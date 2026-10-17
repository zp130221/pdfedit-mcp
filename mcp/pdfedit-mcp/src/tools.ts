/**
 * The five tools of spec §10, registered on an `McpServer`.
 *
 * Every input schema is built from `src/schemas.gen.ts`, which
 * `scripts/gen-tools.ts` derives from the gateway's OpenAPI document: an edit
 * sent through MCP is the same `EditModel` the HTTP API and the SDKs take, and
 * a schema change in the gateway cannot silently diverge here (the staleness
 * test fails instead).
 */
import * as z from 'zod';

import type { CallToolResult, McpServer } from '@modelcontextprotocol/server';

import { GatewayClient, GatewayError } from './client.js';
import { defaultOutputPath, resolveSource, type ServerMode } from './files.js';
import { downloadOutput, fetchPreviews, pollJob, queuedText, summarize } from './result.js';
import {
  BatchOptions,
  EditModel,
  GatewayOptions,
  MatchModel,
  PreviewRequest,
  TextRequest,
} from './schemas.gen.js';

/**
 * The calling strategy, appended to every editing tool's description verbatim
 * from spec §10.
 */
export const STRATEGY =
  "To change text on one page only, set `scope.pages`; to pick one of several identical matches, use `scope.after` with nearby text or `scope.occurrence`. Use `op: 'redact'` when the text must be unrecoverable.";

/** How a `file` argument may be written, in every tool's schema. */
const FILE_DESCRIPTION =
  'The PDF: an absolute (or ~) local path, which this server uploads for you, an https:// URL the API fetches, or an `f_…` file id from an earlier call.';

/** `/v1/edit`'s options: a batch's options minus the three only a batch has. */
/**
 * An edit's options are the gateway's own component: `GatewayOptions` is what
 * `EditRequest.options` takes, and `BatchOptions` is that plus the three a
 * batch adds (`output`, `filename`, `fail_fast`). Until the OpenAPI document
 * carried the `/v1/edit` body this had to be derived by subtraction from
 * `BatchOptions`; now the component exists, so it is used directly.
 */
export const EditOptions = GatewayOptions;

export const PdfEditInput = z.strictObject({
  file: z.string().min(1).describe(FILE_DESCRIPTION),
  edits: z.array(EditModel).min(1).max(200).describe('The edits to apply, in order, exactly as `POST /v1/edit` takes them.'),
  options: EditOptions.optional(),
  password: z.string().optional().describe('The document open password, when it has one.'),
  output_path: z
    .string()
    .optional()
    .describe('Where to write the edited PDF (stdio mode only). Default: `<name>.edited.pdf` next to the input, or `<name>.edited.2.pdf`, `.3.pdf`, ... when that exists; an earlier result is never overwritten.'),
});

export const PdfBatchInput = z.strictObject({
  file: z.string().min(1).describe(`${FILE_DESCRIPTION} Used as the template for every record.`),
  edits: z.array(EditModel).min(1).max(200).describe('The edits applied to each record, with `{field}` placeholders filled from it.'),
  records: z.array(z.record(z.string(), z.unknown())).optional().describe('One object per output document.'),
  records_url: z.url().optional().describe('A CSV or JSONL file of records, instead of `records`.'),
  options: BatchOptions.optional(),
  password: z.string().optional(),
});

export const PdfFindInput = TextRequest.omit({ source: true }).extend({
  file: z.string().min(1).describe(FILE_DESCRIPTION),
  password: z.string().optional(),
});

export const PdfPreviewInput = PreviewRequest.omit({ source: true }).extend({
  file: z.string().min(1).describe(FILE_DESCRIPTION),
  password: z.string().optional(),
});

export const PdfJobInput = z.strictObject({
  job_id: z.string().min(1).describe('The `job_id` an async edit or a batch returned.'),
  output_path: z
    .string()
    .optional()
    .describe('Where to write the finished document (stdio mode, single-document jobs only).'),
});

export const DESCRIPTIONS = {
  pdf_edit:
    'Edit the text of an existing PDF in place: replace, delete, redact, insert, or fill form fields, keeping the original layout, fonts and everything you did not point at. ' +
    '`edits[]` is taken exactly as the API takes it (`op`, `scope`, `match`, `fit`), and the result carries up to 3 before/after previews of the pages that changed. ' +
    STRATEGY,
  pdf_batch:
    'Apply the same edits to one template PDF once per record, producing one output document per record — a mail merge over an existing PDF. ' +
    'Returns a `job_id`: call `pdf_job` with it for the per-record results. ' +
    STRATEGY,
  pdf_find:
    'Read the text of a PDF: every span with its page, position, font and span id, optionally filtered by `query` (the same four `match` modes an edit uses) and `pages`, over the `content`, `forms` and `annotations` layers. ' +
    'Paginated: pass the returned `next_cursor` back as `cursor` for the next page. ' +
    'Use it before `pdf_edit` to check what a document actually says and to pick the `scope` that selects the match you mean.',
  pdf_preview:
    'Render one page of a PDF as a PNG image block, optionally cropped to `region` and with rectangles drawn over `highlight`. Use it to see a page before editing it, or to check the result afterwards.',
  pdf_job:
    'The result of an async edit or a batch, by `job_id`: the same body `pdf_edit` returns once the job is done, plus `progress` while it is still queued or running, and `records` for a batch.',
} as const;

export interface ToolContext {
  client: GatewayClient;
  mode: ServerMode;
  /** Overridable for the tests. */
  pollTimeoutMs?: number;
  pollIntervalMs?: number;
}

/** What every handler returns: the SDK's own result type. */
type ToolResult = CallToolResult;

function errorResult(error: unknown): ToolResult {
  if (error instanceof GatewayError) {
    return {
      content: [{ type: 'text', text: error.toToolText() }],
      structuredContent: { error: { code: error.code, message: error.message, ...(error.hint ? { hint: error.hint } : {}) } },
      isError: true,
    };
  }
  return { content: [{ type: 'text', text: `error: ${(error as Error).message}` }], isError: true };
}

/** Everything `pdf_edit`, `pdf_job` and a finished batch share: summary, output, previews. */
async function shapeEditResponse(
  response: any,
  context: ToolContext,
  options: { outputPath?: string; localPath?: string } = {},
): Promise<ToolResult> {
  let label: string | undefined;
  if (response?.output) {
    const remoteLabel: string = response.output.url ?? `file ${response.output.file_id}`;
    // A local destination needs either an explicit `output_path` or the local
    // input to sit next to; a URL-sourced edit in stdio mode has neither, and
    // writing into the process's working directory would be a surprise.
    const path = options.outputPath ?? (options.localPath ? defaultOutputPath(options.localPath) : undefined);
    if (context.mode === 'stdio' && path) {
      const written = await downloadOutput(response, context.client, path);
      label = written > 0 ? path : remoteLabel;
    } else {
      label = remoteLabel;
    }
  }
  const images = await fetchPreviews(response, context.client);
  return {
    content: [{ type: 'text', text: summarize(response, label) }, ...images],
    structuredContent: response,
  };
}

/** Register the five tools of spec §10 on `server`. */
export function registerTools(server: McpServer, context: ToolContext): void {
  server.registerTool(
    'pdf_edit',
    {
      title: 'Edit a PDF',
      description: DESCRIPTIONS.pdf_edit,
      inputSchema: PdfEditInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { source, localPath } = await resolveSource(args.file, {
          client: context.client,
          mode: context.mode,
          password: args.password,
        });
        const body: Record<string, unknown> = { source, edits: args.edits };
        if (args.options) body.options = args.options;
        const { status, body: first } = await context.client.edit(body);
        if (status === 202) {
          const jobId = String(first?.job_id ?? '');
          const finished = await pollJob(context.client, jobId, {
            timeoutMs: context.pollTimeoutMs,
            intervalMs: context.pollIntervalMs,
          });
          if (!finished) {
            return { content: [{ type: 'text', text: queuedText(jobId) }], structuredContent: first };
          }
          return await shapeEditResponse(finished, context, { outputPath: args.output_path, localPath });
        }
        return await shapeEditResponse(first, context, { outputPath: args.output_path, localPath });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'pdf_batch',
    {
      title: 'Batch-edit a PDF template',
      description: DESCRIPTIONS.pdf_batch,
      inputSchema: PdfBatchInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { source } = await resolveSource(args.file, {
          client: context.client,
          mode: context.mode,
          password: args.password,
        });
        const body: Record<string, unknown> = { source, edits: args.edits };
        if (args.records) body.records = args.records;
        if (args.records_url) body.records_url = args.records_url;
        if (args.options) body.options = args.options;
        const { body: queued } = await context.client.batch(body);
        const jobId = String(queued?.job_id ?? '');
        return {
          content: [
            {
              type: 'text',
              text: `Batch queued as job ${jobId}; call pdf_job with job_id '${jobId}' for the per-record results.`,
            },
          ],
          structuredContent: queued,
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'pdf_find',
    {
      title: 'Read the text of a PDF',
      description: DESCRIPTIONS.pdf_find,
      inputSchema: PdfFindInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { file, password, ...rest } = args;
        const { source } = await resolveSource(file, { client: context.client, mode: context.mode, password });
        const { body } = await context.client.text({ source, ...rest });
        const spans: any[] = Array.isArray(body?.spans) ? body.spans : [];
        const pages = [...new Set(spans.map((span) => span?.page).filter((page) => typeof page === 'number'))];
        const more = body?.next_cursor ? ' More results: pass next_cursor back as cursor.' : '';
        return {
          content: [
            {
              type: 'text',
              text: `Found ${spans.length} span${spans.length === 1 ? '' : 's'} on ${pages.length} page${
                pages.length === 1 ? '' : 's'
              } of ${body?.page_count ?? '?'}.${more}`,
            },
          ],
          structuredContent: body,
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'pdf_preview',
    {
      title: 'Render a PDF page',
      description: DESCRIPTIONS.pdf_preview,
      inputSchema: PdfPreviewInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { file, password, ...rest } = args;
        const { source } = await resolveSource(file, { client: context.client, mode: context.mode, password });
        const { bytes, contentType } = await context.client.preview({ source, ...rest });
        return {
          content: [
            {
              type: 'image',
              data: Buffer.from(bytes).toString('base64'),
              mimeType: contentType.startsWith('image/') ? contentType : 'image/png',
            },
          ],
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'pdf_job',
    {
      title: 'Job result',
      description: DESCRIPTIONS.pdf_job,
      inputSchema: PdfJobInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { body } = await context.client.job(args.job_id);
        const status = String(body?.status ?? '');
        if (status === 'queued' || status === 'running') {
          const progress = body?.progress ?? {};
          return {
            content: [
              {
                type: 'text',
                text: `Job ${args.job_id} is ${status} (${progress.done ?? 0}/${progress.total ?? 1}). Call pdf_job again in a moment.`,
              },
            ],
            structuredContent: body,
          };
        }
        if (Array.isArray(body?.records)) {
          const done = body.records.filter((record: any) => record?.status === 'done').length;
          return {
            content: [
              {
                type: 'text',
                text: `Batch ${args.job_id} ${status}: ${done}/${body.records.length} records produced an output.`,
              },
            ],
            structuredContent: body,
          };
        }
        return await shapeEditResponse(body, context, { outputPath: args.output_path });
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

/** Re-exported so the tests can assert the tool schemas against the OpenAPI. */
export { EditModel, MatchModel };
