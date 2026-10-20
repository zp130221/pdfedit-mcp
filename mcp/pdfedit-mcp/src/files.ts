/**
 * The `file` argument of every tool, resolved to the gateway's `source`.
 *
 * PDFs never travel as MCP content blobs (a Claude Desktop tool result is
 * capped at 1 MB): a local path is uploaded out of band -- `POST /v1/files`
 * for a presigned URL, then a PUT -- and only the resulting `file_id` goes in
 * the request body. A URL is passed straight through for the gateway to fetch
 * under its own SSRF rules, and an `f_…` id is already a stored file.
 */
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';

import type { GatewayClient } from './client.js';
import { GatewayError } from './client.js';

/** How the server was started: stdio runs on the user's machine, HTTP does not. */
export type ServerMode = 'stdio' | 'remote';

/** The hint a remote server gives when handed a local path. */
export const LOCAL_PATH_HINT = 'remote server cannot read local paths; pass a URL';

/** The gateway's `source` object (`SourceModel`). */
export interface ResolvedSource {
  source: { file_id?: string; url?: string; password?: string };
  /** The local path the source came from, when it was one (stdio uploads). */
  localPath?: string;
  /** The file id came from an earlier upload of the same bytes (see `withSource`). */
  reused?: boolean;
}

/**
 * How long an upload is reused for. The gateway keeps a retained input for 24 h
 * (`retention_hours`); an hour leaves a wide margin, and a stale id is caught
 * anyway: the gateway answers `not_found` and `withSource` uploads again.
 */
export const UPLOAD_REUSE_MS = 60 * 60 * 1000;

/**
 * Uploads this process made, per client: `<path>|<size>|<mtime>` -> file id.
 *
 * An agent session edits the same document many times over -- one customer's
 * 32 calls re-uploaded a 600 KB file 62 times in 17 minutes -- and every call
 * that names the same unchanged path can name the same stored file instead.
 */
const uploaded = new WeakMap<GatewayClient, Map<string, { fileId: string; until: number }>>();

function uploadsOf(client: GatewayClient): Map<string, { fileId: string; until: number }> {
  let map = uploaded.get(client);
  if (!map) {
    map = new Map();
    uploaded.set(client, map);
  }
  return map;
}

/** Drop a reused id the gateway no longer knows (or that an edit without `retain` deleted). */
export function forgetUpload(client: GatewayClient, fileId: string): void {
  const map = uploaded.get(client);
  if (!map) return;
  for (const [key, entry] of map) if (entry.fileId === fileId) map.delete(key);
}

/** `f_…` — the gateway's file id prefix (`storage.presign_put`). */
export function isFileId(file: string): boolean {
  return /^f_[A-Za-z0-9_-]+$/.test(file);
}

export function isHttpUrl(file: string): boolean {
  return /^https?:\/\//i.test(file);
}

/**
 * `~/x.pdf` -> `<home>/x.pdf`; an absolute path passes through unchanged.
 *
 * A relative path is refused rather than resolved: the server's cwd is
 * wherever the MCP client happened to launch it, which is never reliably the
 * directory the user had in mind.
 *
 * @throws GatewayError('invalid_request') for a relative path.
 */
export function expandPath(file: string): string {
  if (file === '~') return homedir();
  if (file.startsWith('~/') || file.startsWith('~\\')) return resolve(homedir(), file.slice(2));
  if (!isAbsolute(file)) {
    throw new GatewayError('invalid_request', `The path '${file}' is relative`, 'pass an absolute path or ~/…', 400);
  }
  return file;
}

/**
 * Resolve one `file` argument.
 *
 * @throws GatewayError('invalid_request') in remote mode for a local path.
 */
export async function resolveSource(
  file: string,
  options: { client: GatewayClient; mode: ServerMode; password?: string; reuse?: boolean },
): Promise<ResolvedSource> {
  const { client, mode, password, reuse = true } = options;

  if (isHttpUrl(file)) {
    return { source: { url: file, ...(password ? { password } : {}) } };
  }
  if (isFileId(file)) {
    return { source: { file_id: file, ...(password ? { password } : {}) } };
  }
  if (mode !== 'stdio') {
    throw new GatewayError('invalid_request', `Cannot use the local path '${file}'`, LOCAL_PATH_HINT, 400);
  }

  const path = expandPath(file);
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await readFile(path));
  } catch (error) {
    throw new GatewayError(
      'invalid_request',
      `Cannot read '${path}': ${(error as Error).message}`,
      'pass an absolute path to an existing PDF, an https:// URL, or an f_… file id',
      400,
    );
  }

  const info = await stat(path);
  const key = `${path}|${info.size}|${info.mtimeMs}`;
  const known = uploadsOf(client).get(key);
  if (reuse && known && known.until > Date.now()) {
    return { source: { file_id: known.fileId, ...(password ? { password } : {}) }, localPath: path, reused: true };
  }

  const reserved = await client.createFile();
  await client.putUpload(reserved.upload_url, bytes, reserved.headers ?? {});
  if (reuse) uploadsOf(client).set(key, { fileId: reserved.file_id, until: Date.now() + UPLOAD_REUSE_MS });
  else uploadsOf(client).delete(key);
  return { source: { file_id: reserved.file_id, ...(password ? { password } : {}) }, localPath: path };
}

/**
 * `resolveSource`, then `run` with the result -- once more with a fresh upload
 * if the gateway no longer has a REUSED file id (`not_found`: retention ran
 * out, or an earlier call edited it with `retain: false`). A `not_found` for
 * anything else -- a stale `f_…` id the caller passed, a URL -- is the caller's.
 */
export async function withSource<T>(
  file: string,
  options: { client: GatewayClient; mode: ServerMode; password?: string; reuse?: boolean },
  run: (resolved: ResolvedSource) => Promise<T>,
): Promise<T> {
  const resolved = await resolveSource(file, options);
  try {
    return await run(resolved);
  } catch (error) {
    if (resolved.reused && error instanceof GatewayError && error.code === 'not_found' && resolved.source.file_id) {
      forgetUpload(options.client, resolved.source.file_id);
      return run(await resolveSource(file, options));
    }
    throw error;
  }
}

/**
 * `contract.pdf` -> `contract.edited.pdf`, next to the input -- and never on
 * top of an earlier result: if that name is taken, `contract.edited.2.pdf`,
 * `.3.pdf`, ... Editing an output again keeps one stem, so
 * `contract.edited.pdf` -> `contract.edited.2.pdf`, not `.edited.edited.pdf`.
 * `exists` is injectable for tests; the default checks the filesystem.
 */
export function defaultOutputPath(inputPath: string, exists: (p: string) => boolean = existsSync): string {
  const match = /^(.*?)(\.[^.\/]+)?$/.exec(inputPath);
  let stem = match?.[1] ?? inputPath;
  const extension = match?.[2] ?? '.pdf';
  stem = stem.replace(/\.edited(\.\d+)?$/, '');
  const first = `${stem}.edited${extension}`;
  if (!exists(first)) return first;
  for (let n = 2; ; n += 1) {
    const candidate = `${stem}.edited.${n}${extension}`;
    if (!exists(candidate)) return candidate;
  }
}
