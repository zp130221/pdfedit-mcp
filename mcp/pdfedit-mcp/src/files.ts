/**
 * The `file` argument of every tool, resolved to the gateway's `source`.
 *
 * PDFs never travel as MCP content blobs (a Claude Desktop tool result is
 * capped at 1 MB): a local path is uploaded out of band -- `POST /v1/files`
 * for a presigned URL, then a PUT -- and only the resulting `file_id` goes in
 * the request body. A URL is passed straight through for the gateway to fetch
 * under its own SSRF rules, and an `f_…` id is already a stored file.
 */
import { readFile } from 'node:fs/promises';
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
  options: { client: GatewayClient; mode: ServerMode; password?: string },
): Promise<ResolvedSource> {
  const { client, mode, password } = options;

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

  const reserved = await client.createFile();
  await client.putUpload(reserved.upload_url, bytes, reserved.headers ?? {});
  return { source: { file_id: reserved.file_id, ...(password ? { password } : {}) }, localPath: path };
}

/** `contract.pdf` -> `contract.edited.pdf`, next to the input. */
export function defaultOutputPath(inputPath: string): string {
  const match = /^(.*?)(\.[^.\\/]+)?$/.exec(inputPath);
  const stem = match?.[1] ?? inputPath;
  const extension = match?.[2] ?? '.pdf';
  return `${stem}.edited${extension}`;
}
