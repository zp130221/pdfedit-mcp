/**
 * The request and response types, taken from the generated schema.
 *
 * Nothing here is hand-written: each alias points at
 * `components['schemas'][...]` in `src/schema.gen.ts`, which is generated
 * from `openapi/openapi.json`. One schema, three consumers (the MCP tools'
 * zod schemas, this SDK, the Python SDK) -- so a field added to the gateway
 * reaches a TypeScript caller by regenerating, never by editing a type.
 *
 * The one exception is `JobResponse`: `GET /v1/jobs/{job_id}` is declared
 * with an empty 200 schema (the route returns a queued job, a running job, or
 * the finished sync body, all under one status code), so the shape a poller
 * needs is written out here and the rest left open.
 */
import type { components } from './schema.gen.js';

type Schemas = components['schemas'];

/** `POST /v1/edit`'s JSON body. */
export type EditRequest = Schemas['EditRequest'];
/** A finished edit: 200 for `done`/`partial`. */
export type EditResponse = Schemas['EditResponse'];
/** The 202 body of an async edit or a batch. */
export type QueuedResponse = Schemas['QueuedResponse'];
/** `POST /v1/text`'s body. */
export type TextRequest = Schemas['TextRequest'];
export type TextResponse = Schemas['TextResponse'];
/** `POST /v1/preview`'s body; the response is PNG bytes. */
export type PreviewRequest = Schemas['PreviewRequest'];
/** `POST /v1/batch`'s body. */
export type BatchRequest = Schemas['BatchRequest'];

/** One edit operation: `replace`, `delete`, `redact`, `insert` or `form`. */
export type EditModel = Schemas['EditModel'];
/** Where the PDF comes from: a `file_id`, a URL, plus an optional password. */
export type SourceModel = Schemas['SourceModel'];
/** The options an edit takes (`async`, `preview`, `redact_style`, ...). */
export type GatewayOptions = Schemas['GatewayOptions'];
/** `GatewayOptions` plus the three keys only a batch has. */
export type BatchOptions = Schemas['BatchOptions'];
export type FontOptions = Schemas['FontOptions'];
export type MatchModel = Schemas['MatchModel'];
export type ScopeModel = Schemas['ScopeModel'];
export type StyleModel = Schemas['StyleModel'];
export type AtModel = Schemas['AtModel'];
export type ChangeOut = Schemas['ChangeOut'];
export type UnmatchedOut = Schemas['UnmatchedOut'];
export type FailedOut = Schemas['FailedOut'];
export type OutputOut = Schemas['OutputOut'];
export type UsageOut = Schemas['UsageOut'];
export type FontsResponse = Schemas['FontsResponse'];
export type ErrorOut = Schemas['ErrorOut'];

/** What `/v1/edit` answers with: the result (200) or a job (202). */
export type EditResult = EditResponse | QueuedResponse;

/**
 * Whether `/v1/edit` answered 202 rather than returning the edit.
 *
 * The narrowing a caller needs on {@link EditResult}: in the `false` branch
 * the result is an {@link EditResponse} with `changes` and `output`, in the
 * `true` branch a {@link QueuedResponse} with a `job_id` for `waitForJob`.
 */
export function isQueued(result: EditResult): result is QueuedResponse {
  return result.status === 'queued';
}

/** The statuses a job can hold. */
export type JobStatus = 'queued' | 'running' | 'done' | 'partial' | 'failed';

/**
 * `GET /v1/jobs/{job_id}`.
 *
 * Once the status is terminal the body *is* the sync response -- `changes`,
 * `output` and `usage` for an edit, `records` for a batch -- so the edit
 * fields are declared optional here and the index signature keeps whatever
 * else the kind of job adds.
 */
export interface JobResponse extends Partial<Omit<EditResponse, 'status' | 'job_id'>> {
  status: JobStatus;
  job_id: string;
  kind?: string;
  progress?: { done: number; total: number };
  records?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

/** `done`, `partial` and `failed` -- `jobs.TERMINAL_STATUSES`. */
export const TERMINAL_JOB_STATUSES = ['done', 'partial', 'failed'] as const satisfies readonly JobStatus[];

/** Whether a polled job has stopped moving. */
export function isTerminalJobStatus(status: string): boolean {
  return (TERMINAL_JOB_STATUSES as readonly string[]).includes(status);
}

/** `POST /v1/files`: a reserved file id and where to PUT the bytes. */
export interface PresignedUpload {
  file_id: string;
  upload_url: string;
  headers?: Record<string, string>;
  expires_at?: string | null;
}
