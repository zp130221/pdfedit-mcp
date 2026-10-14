/**
 * `PdfEdit` -- the hand-written client over the generated types.
 *
 * Thin on purpose: one method per endpoint, the body and the result typed
 * from `components['schemas']` so the compiler, not the README, is what tells
 * a caller which fields exist. The three things the SDK *adds* to raw `fetch`
 * are the ones every caller would otherwise write again: the bearer header,
 * the error envelope as an exception (`PdfEditError`), and `waitForJob`.
 *
 * No runtime dependencies: `fetch` is the platform's (Node 20+, browsers,
 * workers). `editFile` is the only method that touches the filesystem, and it
 * imports `node:fs/promises` dynamically so that bundling this module for a
 * browser does not pull Node builtins in.
 */
import { PdfEditError, PdfEditTimeoutError } from './errors.js';
import {
  isTerminalJobStatus,
  type BatchRequest,
  type EditModel,
  type EditResult,
  type GatewayOptions,
  type JobResponse,
  type PreviewRequest,
  type PresignedUpload,
  type QueuedResponse,
  type TextRequest,
  type TextResponse,
  type EditRequest,
} from './types.js';

/**
 * The hosted API, used when `PDFEDIT_BASE_URL` is unset; the same default
 * `mcp/pdfedit-mcp` uses. Point it at a self-hosted gateway (e.g.
 * `http://localhost:8000`) with the environment variable or the `baseUrl` option.
 */
export const DEFAULT_BASE_URL = 'https://api.niubai.vip';

export interface PdfEditOptions {
  /** Defaults to `process.env.PDFEDIT_API_KEY`. */
  apiKey?: string;
  /** Defaults to `process.env.PDFEDIT_BASE_URL`, then {@link DEFAULT_BASE_URL}. */
  baseUrl?: string;
  /** A `fetch` to use instead of the global one (tests, proxies, retries). */
  fetch?: typeof fetch;
}

/** The documented defaults of {@link PdfEdit.waitForJob}. */
export const WAIT_FOR_JOB_DEFAULTS = {
  /** 90 s -- the same budget `mcp/pdfedit-mcp` polls for. */
  timeoutMs: 90_000,
  /** The first gap after a non-terminal poll. */
  initialDelayMs: 500,
  /** The gap stops growing here. */
  maxDelayMs: 8_000,
  /** Each gap is this multiple of the previous one. */
  backoffFactor: 2,
} as const;

export interface WaitForJobOptions {
  /** Give up after this long. Default `90_000`. */
  timeoutMs?: number;
  /** The first delay between polls. Default `500`. */
  initialDelayMs?: number;
  /** The ceiling the delay backs off to. Default `8_000`. */
  maxDelayMs?: number;
  /** The growth factor. Default `2`. */
  backoffFactor?: number;
  /** Injectable for tests: how to wait. Default a `setTimeout` promise. */
  sleep?: (ms: number) => Promise<void>;
  /** Injectable for tests: the clock the timeout is measured on. Default `Date.now`. */
  now?: () => number;
}

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

export class PdfEdit {
  /** The gateway address, without a trailing slash. */
  readonly baseUrl: string;
  /** The key sent as `Authorization: Bearer`; empty means no header at all. */
  readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PdfEditOptions = {}) {
    const baseUrl = options.baseUrl ?? process.env.PDFEDIT_BASE_URL ?? DEFAULT_BASE_URL;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey ?? process.env.PDFEDIT_API_KEY ?? '';
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  // ---------------------------------------------------------------- endpoints

  /**
   * `POST /v1/edit`.
   *
   * A 202 is **not** an error: with `options.async` (or when the gateway
   * decides a document is too big to edit inline) the result is a
   * {@link QueuedResponse}, and the job it names is followed with
   * {@link waitForJob}. Narrow on `status === 'queued'`.
   */
  async edit(body: EditRequest): Promise<EditResult> {
    const { body: result } = await this.postJson<EditResult>('/v1/edit', body);
    return result;
  }

  /**
   * Edit a PDF on this machine: upload it, then {@link edit} by `file_id`.
   *
   * The bytes travel out of band (`POST /v1/files` -> presigned PUT) and only
   * the id goes in the request body -- a 20 MB PDF is never base64 in JSON.
   * Node only; in a browser, read the file yourself and call
   * {@link uploadFile}.
   */
  async editFile(path: string, edits: EditModel[], options?: GatewayOptions): Promise<EditResult> {
    const bytes = await readLocalFile(path);
    const fileId = await this.uploadFile(bytes);
    return this.edit({
      source: { file_id: fileId },
      edits,
      ...(options ? { options } : {}),
    });
  }

  /** `POST /v1/text`: the document's spans, filtered and paginated. */
  async text(body: TextRequest): Promise<TextResponse> {
    const { body: result } = await this.postJson<TextResponse>('/v1/text', body);
    return result;
  }

  /** `POST /v1/preview`: one page rendered as PNG bytes (at most 200 KB). */
  async preview(body: PreviewRequest): Promise<Uint8Array> {
    const response = await this.request('/v1/preview', {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json', Accept: 'image/png' }),
      body: JSON.stringify(body),
    });
    return new Uint8Array(await response.arrayBuffer());
  }

  /** `POST /v1/batch`: always a job (202). */
  async batch(body: BatchRequest): Promise<QueuedResponse> {
    const { body: result } = await this.postJson<QueuedResponse>('/v1/batch', body);
    return result;
  }

  /** `GET /v1/jobs/{job_id}`: status, progress, and the sync body once done. */
  async job(jobId: string): Promise<JobResponse> {
    const response = await this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET',
      headers: this.headers({ Accept: 'application/json' }),
    });
    return (await response.json()) as JobResponse;
  }

  /**
   * Poll a job until its status is terminal (`done`, `partial` or `failed`).
   *
   * The first poll happens immediately; after each non-terminal answer the
   * client sleeps `initialDelayMs` and multiplies that by `backoffFactor` up
   * to `maxDelayMs` -- 500 ms, 1 s, 2 s, 4 s, 8 s, 8 s ... by default, so a
   * job that finishes in a second is noticed in a second and a five-minute
   * batch costs a handful of requests. A job still moving when the budget
   * runs out rejects with {@link PdfEditTimeoutError}; it is not cancelled.
   *
   * Defaults: {@link WAIT_FOR_JOB_DEFAULTS}.
   */
  async waitForJob(jobId: string, options: WaitForJobOptions = {}): Promise<JobResponse> {
    const timeoutMs = options.timeoutMs ?? WAIT_FOR_JOB_DEFAULTS.timeoutMs;
    const maxDelayMs = options.maxDelayMs ?? WAIT_FOR_JOB_DEFAULTS.maxDelayMs;
    const backoffFactor = options.backoffFactor ?? WAIT_FOR_JOB_DEFAULTS.backoffFactor;
    const sleep = options.sleep ?? defaultSleep;
    const now = options.now ?? Date.now;

    // At least 1 ms: the delay grows by multiplication, so a 0 (or negative)
    // initial delay would stay 0 and turn the backoff into a tight loop.
    let delay = Math.max(1, options.initialDelayMs ?? WAIT_FOR_JOB_DEFAULTS.initialDelayMs);
    const started = now();

    for (;;) {
      const job = await this.job(jobId);
      if (isTerminalJobStatus(job.status)) return job;
      // Checked *before* sleeping: a client that slept past its own budget
      // and only then noticed would blow the caller's timeout, not keep it.
      if (now() - started + delay >= timeoutMs) {
        throw new PdfEditTimeoutError(jobId, job.status, timeoutMs);
      }
      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }

  // ------------------------------------------------------------------- files

  /**
   * `POST /v1/files` + the presigned PUT: bytes in, `file_id` out.
   *
   * The id is what `source.file_id` takes, and it is reusable -- upload once,
   * then find, preview and edit the same document without re-sending it.
   */
  async uploadFile(bytes: Uint8Array, contentType = 'application/pdf'): Promise<string> {
    const { body: reserved } = await this.postJson<PresignedUpload>('/v1/files', {});
    const response = await this.fetchImpl(reserved.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType, ...(reserved.headers ?? {}) },
      // `BodyInit` is not in the ES2022 lib; a `Uint8Array` is a valid body.
      body: bytes as unknown as RequestInit['body'],
    });
    if (!response.ok) throw await PdfEditError.fromResponse(response);
    return reserved.file_id;
  }

  /**
   * Download a URL the gateway handed back (`output.url`, a `preview_url`).
   *
   * Sent without the API key: those URLs carry their own signature and may
   * point straight at object storage.
   */
  async download(url: string): Promise<Uint8Array> {
    const response = await this.fetchImpl(url, { method: 'GET' });
    if (!response.ok) throw await PdfEditError.fromResponse(response);
    return new Uint8Array(await response.arrayBuffer());
  }

  // --------------------------------------------------------------- internals

  private headers(extra: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    return headers;
  }

  /** One request, with the envelope turned into a `PdfEditError`. */
  private async request(path: string, init: RequestInit): Promise<Response> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    if (!response.ok) throw await PdfEditError.fromResponse(response);
    return response;
  }

  /** POST JSON, keeping the status so a 202 can be told from a 200. */
  private async postJson<T>(path: string, body: unknown): Promise<{ status: number; body: T }> {
    const response = await this.request(path, {
      method: 'POST',
      headers: this.headers(JSON_HEADERS),
      body: JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as T };
  }
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

/**
 * Read a local PDF.
 *
 * `node:fs/promises` is imported here, inside the one function that needs it,
 * so that a bundler walking `src/index.ts` for the browser never has to
 * resolve a Node builtin. A missing or unreadable path is reported as the
 * gateway would report it -- `invalid_request` with a hint -- rather than as a
 * bare `ENOENT`, so a caller has one error type to handle.
 */
async function readLocalFile(path: string): Promise<Uint8Array> {
  const { readFile } = await import('node:fs/promises');
  try {
    return new Uint8Array(await readFile(path));
  } catch (error) {
    throw new PdfEditError(
      'invalid_request',
      `Cannot read '${path}': ${(error as Error).message}`,
      'pass an absolute path to an existing PDF, or upload the bytes with uploadFile()',
      400,
    );
  }
}
