/**
 * `@niubai/pdfedit` -- the TypeScript client for the PDF Edit API.
 *
 * ```ts
 * import { PdfEdit } from '@niubai/pdfedit';
 *
 * const pdfedit = new PdfEdit();                 // PDFEDIT_API_KEY
 * const result = await pdfedit.editFile('./contract.pdf', [
 *   { find: 'Acme Inc.', replace: 'Acme, Inc.' },
 * ]);
 * ```
 *
 * The types come from `openapi/openapi.json` (`src/schema.gen.ts`, generated);
 * the client over them is hand-written and has no runtime dependencies.
 */
export { DEFAULT_BASE_URL, PdfEdit, WAIT_FOR_JOB_DEFAULTS } from './client.js';
export type { PdfEditOptions, WaitForJobOptions } from './client.js';
export { PdfEditError, PdfEditTimeoutError } from './errors.js';
export { TERMINAL_JOB_STATUSES, isQueued, isTerminalJobStatus } from './types.js';
export type {
  AtModel,
  BatchOptions,
  BatchRequest,
  ChangeOut,
  EditModel,
  EditRequest,
  EditResponse,
  EditResult,
  ErrorOut,
  FailedOut,
  FontOptions,
  FontsResponse,
  GatewayOptions,
  JobResponse,
  JobStatus,
  MatchModel,
  OutputOut,
  PresignedUpload,
  PreviewRequest,
  QueuedResponse,
  ScopeModel,
  SourceModel,
  StyleModel,
  TextRequest,
  TextResponse,
  UnmatchedOut,
  UsageOut,
} from './types.js';
export type { components, operations, paths } from './schema.gen.js';
