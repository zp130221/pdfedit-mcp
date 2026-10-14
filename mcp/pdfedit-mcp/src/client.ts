/**
 * The gateway HTTP client.
 *
 * One `GatewayClient` per MCP server instance: in stdio mode it carries the
 * `PDFEDIT_API_KEY` from the environment for the life of the process, in HTTP
 * mode the caller's own `Authorization: Bearer` header is passed through
 * per request (the remote entry never holds a key of its own).
 *
 * `PDFEDIT_BASE_URL` overrides the gateway address for self-hosted
 * deployments; the default is the hosted API.
 */

/** The hosted API, used when `PDFEDIT_BASE_URL` is unset. */
export const DEFAULT_BASE_URL = 'https://api.niubai.vip';

/** An error envelope (`{"error": {"code", "message", "hint?"}}`) from the gateway. */
export class GatewayError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly hint?: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GatewayError';
  }

  /** The text an MCP tool shows: the message, plus the gateway's hint. */
  toToolText(): string {
    return this.hint ? `${this.code}: ${this.message} (${this.hint})` : `${this.code}: ${this.message}`;
  }
}

export interface GatewayClientOptions {
  baseUrl?: string;
  /** `PDFEDIT_API_KEY` (stdio) or the caller's bearer token (HTTP). */
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

/** A JSON response plus the status code the tools branch on (200 vs 202). */
export interface JsonResult<T = any> {
  status: number;
  body: T;
}

export class GatewayClient {
  readonly baseUrl: string;
  readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GatewayClientOptions = {}) {
    const baseUrl = options.baseUrl ?? process.env.PDFEDIT_BASE_URL ?? DEFAULT_BASE_URL;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey ?? process.env.PDFEDIT_API_KEY ?? undefined;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** A copy of this client that authenticates as `apiKey` (HTTP passthrough). */
  withApiKey(apiKey: string | undefined): GatewayClient {
    return new GatewayClient({ baseUrl: this.baseUrl, apiKey, fetchImpl: this.fetchImpl });
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    return headers;
  }

  private async raise(response: Response): Promise<never> {
    let code = `http_${response.status}`;
    let message = `${response.status} ${response.statusText}`.trim();
    let hint: string | undefined;
    try {
      const body: any = await response.json();
      const error = body?.error;
      if (error && typeof error === 'object') {
        code = error.code ?? code;
        message = error.message ?? message;
        hint = error.hint;
      }
    } catch {
      /* a non-JSON body (a proxy error page): keep the status line */
    }
    throw new GatewayError(code, message, hint, response.status);
  }

  /** POST JSON, returning the status so a 202 can be told from a 200. */
  async postJson<T = any>(path: string, body: unknown): Promise<JsonResult<T>> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify(body),
    });
    if (!response.ok) await this.raise(response);
    return { status: response.status, body: (await response.json()) as T };
  }

  async getJson<T = any>(path: string): Promise<JsonResult<T>> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers({ Accept: 'application/json' }),
    });
    if (!response.ok) await this.raise(response);
    return { status: response.status, body: (await response.json()) as T };
  }

  /** `POST /v1/preview` -> `image/png` bytes. */
  async postBinary(path: string, body: unknown): Promise<{ bytes: Uint8Array; contentType: string }> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json', Accept: 'image/png' }),
      body: JSON.stringify(body),
    });
    if (!response.ok) await this.raise(response);
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    };
  }

  /**
   * An absolute URL the gateway handed back (`output.url`, a change's
   * `preview_url`, a presigned GET). No API key: those URLs carry their own
   * signature, and they may point at object storage.
   */
  async getUrl(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
    const response = await this.fetchImpl(url, { method: 'GET' });
    if (!response.ok) await this.raise(response);
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    };
  }

  /** `POST /v1/files`: reserve a file id and get a presigned upload URL. */
  async createFile(): Promise<{
    file_id: string;
    upload_url: string;
    headers?: Record<string, string>;
    expires_at?: string | null;
  }> {
    const { body } = await this.postJson('/v1/files', {});
    return body;
  }

  /** PUT the bytes at a presigned upload URL. */
  async putUpload(url: string, bytes: Uint8Array, headers: Record<string, string> = {}): Promise<void> {
    const response = await this.fetchImpl(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf', ...headers },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- BodyInit is not in the ES2022 lib
      body: bytes as any,
    });
    if (!response.ok) await this.raise(response);
  }

  edit(body: unknown) {
    return this.postJson('/v1/edit', body);
  }

  batch(body: unknown) {
    return this.postJson('/v1/batch', body);
  }

  text(body: unknown) {
    return this.postJson('/v1/text', body);
  }

  preview(body: unknown) {
    return this.postBinary('/v1/preview', body);
  }

  job(jobId: string) {
    return this.getJson(`/v1/jobs/${encodeURIComponent(jobId)}`);
  }
}
