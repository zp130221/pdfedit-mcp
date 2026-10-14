/**
 * Turning a gateway response into an MCP tool result.
 *
 * Three rules, all from spec §10 and the plan:
 *   - the whole response goes in `structuredContent`, unmodified, so an agent
 *     can read `changes[].page`, `unmatched[].suggestions` and `usage`;
 *   - the text block is a ≤ 300 character sentence in one fixed format, because
 *     that is what a model reads first;
 *   - at most three previews ride along as image blocks, and only while the
 *     total stays under 600 KB -- a PDF never travels as a blob at all.
 */
import { writeFile } from 'node:fs/promises';

import type { GatewayClient } from './client.js';

/** The longest text summary a tool returns. */
export const SUMMARY_MAX = 300;
/** At most three before/after previews (spec §10). */
export const MAX_PREVIEWS = 3;
/** ...and at most this many bytes of them in total. */
export const PREVIEW_BUDGET_BYTES = 600 * 1024;
/** How long `pdf_edit`/`pdf_batch` wait on a 202 before handing back the job id. */
export const POLL_TIMEOUT_MS = 90_000;

const VERBS: Record<string, string> = {
  replace: 'Replaced',
  delete: 'Deleted',
  redact: 'Redacted',
  insert: 'Inserted',
  form: 'Filled',
};

export interface ToolImage {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface ToolText {
  type: 'text';
  text: string;
}

export type ToolContent = ToolText | ToolImage;

function pageList(pages: number[]): string {
  const unique = [...new Set(pages)].sort((a, b) => a - b);
  if (unique.length === 0) return '';
  if (unique.length <= 4) return unique.join(', ');
  return `${unique.slice(0, 4).join(', ')} and ${unique.length - 4} more`;
}

function clamp(text: string): string {
  return text.length <= SUMMARY_MAX ? text : `${text.slice(0, SUMMARY_MAX - 1).trimEnd()}…`;
}

/**
 * The fixed summary format:
 * `Replaced 3 occurrences on pages 1, 4. 1 edit unmatched (did you mean 'Acme, Inc.'?). Output: ./contract.edited.pdf`
 */
export function summarize(response: any, outputLabel?: string): string {
  const changes: any[] = Array.isArray(response?.changes) ? response.changes : [];
  const unmatched: any[] = Array.isArray(response?.unmatched) ? response.unmatched : [];
  const failed: any[] = Array.isArray(response?.failed) ? response.failed : [];
  const sentences: string[] = [];

  const byOp = new Map<string, number[]>();
  for (const change of changes) {
    const op = String(change?.op ?? 'replace');
    const pages = byOp.get(op) ?? [];
    if (typeof change?.page === 'number') pages.push(change.page);
    byOp.set(op, pages);
  }
  for (const [op, pages] of byOp) {
    const count = changes.filter((change) => String(change?.op ?? 'replace') === op).length;
    const verb = VERBS[op] ?? `Applied ${op} to`;
    const noun = count === 1 ? 'occurrence' : 'occurrences';
    const where = pages.length > 0 ? ` on page${new Set(pages).size === 1 ? '' : 's'} ${pageList(pages)}` : '';
    sentences.push(`${verb} ${count} ${noun}${where}.`);
  }
  if (changes.length === 0 && unmatched.length === 0 && failed.length === 0) {
    sentences.push(`Nothing changed (status ${String(response?.status ?? 'unknown')}).`);
  }

  if (unmatched.length > 0) {
    const suggestion = unmatched
      .flatMap((entry: any) => (Array.isArray(entry?.suggestions) ? entry.suggestions : []))
      .map((entry: any) => entry?.text)
      .find((text: unknown) => typeof text === 'string' && text.length > 0);
    const tail = suggestion ? ` (did you mean '${suggestion}'?)` : '';
    sentences.push(`${unmatched.length} edit${unmatched.length === 1 ? '' : 's'} unmatched${tail}.`);
  }
  if (failed.length > 0) {
    const reason = failed[0]?.reason ? ` (${failed[0].reason})` : '';
    sentences.push(`${failed.length} edit${failed.length === 1 ? '' : 's'} rolled back${reason}.`);
  }
  const warnings: any[] = Array.isArray(response?.warnings) ? response.warnings : [];
  if (warnings.length > 0) sentences.push(`Warnings: ${warnings.join(', ')}.`);
  if (outputLabel) sentences.push(`Output: ${outputLabel}.`);

  return clamp(sentences.join(' '));
}

/** Up to three `preview_url`s of a response, fetched as image blocks within the byte budget. */
export async function fetchPreviews(response: any, client: GatewayClient): Promise<ToolImage[]> {
  const urls: string[] = (Array.isArray(response?.changes) ? response.changes : [])
    .map((change: any) => change?.preview_url)
    .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
    .slice(0, MAX_PREVIEWS);

  const images: ToolImage[] = [];
  let used = 0;
  for (const url of urls) {
    try {
      const { bytes, contentType } = await client.getUrl(url);
      if (used + bytes.byteLength > PREVIEW_BUDGET_BYTES) break;
      used += bytes.byteLength;
      images.push({
        type: 'image',
        data: Buffer.from(bytes).toString('base64'),
        mimeType: contentType.startsWith('image/') ? contentType : 'image/png',
      });
    } catch {
      // A preview that will not download is not worth failing the edit over.
      break;
    }
  }
  return images;
}

/** Download `output.url` to `path`; returns the number of bytes written. */
export async function downloadOutput(response: any, client: GatewayClient, path: string): Promise<number> {
  const url: unknown = response?.output?.url;
  if (typeof url !== 'string' || url.length === 0) return 0;
  const { bytes } = await client.getUrl(url);
  await writeFile(path, bytes);
  return bytes.byteLength;
}

/**
 * Poll `GET /v1/jobs/{id}` until the job leaves `queued`/`running`.
 *
 * Returns the finished body, or `null` when `timeoutMs` runs out first -- the
 * caller then hands the agent the job id and the "call pdf_job" sentence.
 */
export async function pollJob(
  client: GatewayClient,
  jobId: string,
  options: { timeoutMs?: number; intervalMs?: number; now?: () => number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<any | null> {
  const timeoutMs = options.timeoutMs ?? POLL_TIMEOUT_MS;
  const intervalMs = options.intervalMs ?? 1_000;
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const deadline = now() + timeoutMs;

  for (;;) {
    const { body } = await client.job(jobId);
    const status = String(body?.status ?? '');
    if (status !== 'queued' && status !== 'running') return body;
    if (now() + intervalMs > deadline) return null;
    await sleep(intervalMs);
  }
}

/** The text a tool returns instead of a result when a job is still running. */
export function queuedText(jobId: string): string {
  return clamp(`Still running after 90s. Job ${jobId} accepted; call pdf_job with job_id '${jobId}' for the result.`);
}
