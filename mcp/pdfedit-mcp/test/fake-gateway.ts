/**
 * An in-process fake of the gateway, for the tool tests.
 *
 * Every response body here is shaped from `openapi/openapi.json`: the
 * `EditResponse` fixture carries only the fields `ChangeOut`, `UnmatchedOut`,
 * `OutputOut` and `UsageOut` declare, `/v1/files` answers with the four keys
 * `create_file` returns, and an error is the `ErrorOut` envelope. Nothing is
 * invented: a key that is not in the schema is not in a fixture.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

/** A 1x1 PNG — a real one, so an image block carries real bytes. */
export const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
);

export const PDF_BYTES = Buffer.from('%PDF-1.7\n% fake edited document\n%%EOF\n', 'utf8');

export interface FakeGatewayOptions {
  /** How many `GET /v1/jobs/{id}` calls answer `running` before the job is done. */
  runningPolls?: number;
  /** `/v1/edit` answers 202 instead of 200. */
  asyncEdit?: boolean;
  /** Reject every authenticated request with the `unauthorized` envelope. */
  requireKey?: boolean;
}

export interface Recorded {
  method: string;
  path: string;
  body: any;
  authorization?: string;
  contentType?: string;
}

export class FakeGateway {
  readonly requests: Recorded[] = [];
  readonly uploads = new Map<string, Buffer>();
  private server?: Server;
  private polls = 0;
  private fileSeq = 0;
  /** File ids the gateway no longer has: an edit naming one answers `not_found`. */
  readonly forgotten = new Set<string>();
  baseUrl = '';

  constructor(private readonly options: FakeGatewayOptions = {}) {}

  async start(): Promise<string> {
    this.server = createServer((req, res) => void this.handle(req, res));
    await new Promise<void>((done) => this.server!.listen(0, '127.0.0.1', done));
    const address = this.server!.address() as AddressInfo;
    this.baseUrl = `http://127.0.0.1:${address.port}`;
    return this.baseUrl;
  }

  async stop(): Promise<void> {
    if (this.server) await new Promise<void>((done) => this.server!.close(() => done()));
  }

  /** The requests made to one path, in order. */
  to(path: string): Recorded[] {
    return this.requests.filter((request) => request.path === path);
  }

  /** The `EditResponse` a finished edit returns (spec §5.2). */
  editResponse(): Record<string, unknown> {
    return {
      status: 'partial',
      job_id: 'job_edit_1',
      changes: [
        this.change(1, 1, 'Acme Inc.', 'Acme, Inc.'),
        this.change(2, 1, 'Acme Inc.', 'Acme, Inc.'),
        this.change(3, 4, 'Acme Inc.', 'Acme, Inc.'),
      ],
      unmatched: [
        {
          edit: 1,
          reason: 'not_found',
          hint: 'no line on pages 1-4 contains that text',
          suggestions: [{ text: 'Acme, Inc.', page: 2, score: 92 }],
        },
      ],
      failed: [],
      warnings: [],
      output: {
        file_id: 'f_out1',
        url: `${this.baseUrl}/storage/f_out1`,
        bytes: PDF_BYTES.byteLength,
        pages: 4,
        expires_at: '2026-10-15T00:00:00+00:00',
      },
      usage: { pages_billed: 4, remaining: 96, weights: { edit: 1 } },
    };
  }

  private change(index: number, page: number, before: string, after: string): Record<string, unknown> {
    return {
      edit: 0,
      op: 'replace',
      page,
      before,
      after,
      context: `This agreement with ${after} is made...`,
      bbox: [72, 108, 220, 122],
      span_ids: [`p${page}b2l1s0`],
      font_used: 'Helvetica',
      font_source: 'embedded',
      is_ocr: false,
      ocr_confidence: null,
      collateral_pixels: 0,
      verified: true,
      notes: [],
      page_label: String(page),
      preview_url: `${this.baseUrl}/storage/preview_${index}.png`,
      fit: null,
    };
  }

  /** The `TextResponse` of `/v1/text`. */
  textResponse(): Record<string, unknown> {
    return {
      page_count: 4,
      next_cursor: 'c_2',
      spans: [
        {
          span_id: 'p1b2l1s0',
          page: 1,
          block_id: 'p1b2',
          line_id: 'p1b2l1',
          text: 'Acme Inc.',
          bbox: [72, 108, 160, 122],
          dir: [1, 0],
          font: 'Helvetica',
          size: 11,
          color: '#000000',
          layer: 'content',
          is_ocr: false,
          in_shared_xobject: false,
          page_label: '1',
          field: null,
        },
      ],
      fields: null,
    };
  }

  private jobBody(jobId: string): Record<string, unknown> {
    if (jobId.startsWith('job_batch')) {
      return {
        status: 'done',
        job_id: jobId,
        kind: 'batch',
        progress: { done: 2, total: 2 },
        records: [
          { index: 0, status: 'done', output: { file_id: 'f_r0', url: `${this.baseUrl}/storage/f_r0` } },
          { index: 1, status: 'done', output: { file_id: 'f_r1', url: `${this.baseUrl}/storage/f_r1` } },
        ],
      };
    }
    return { ...this.editResponse(), job_id: jobId, kind: 'edit', progress: { done: 1, total: 1 } };
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks);
    const url = new URL(req.url ?? '/', this.baseUrl || 'http://127.0.0.1');
    let body: any = null;
    if (raw.byteLength > 0 && (req.headers['content-type'] ?? '').includes('json')) {
      try {
        body = JSON.parse(raw.toString('utf8'));
      } catch {
        body = raw.toString('utf8');
      }
    }
    this.requests.push({
      method: req.method ?? 'GET',
      path: url.pathname,
      body,
      authorization: req.headers.authorization,
      contentType: req.headers['content-type'] as string | undefined,
    });

    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(payload));
    };
    const needsKey = url.pathname.startsWith('/v1/');
    if (this.options.requireKey && needsKey && !req.headers.authorization) {
      json(401, { error: { code: 'unauthorized', message: 'Missing API key', hint: 'send Authorization: Bearer sk_…' } });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/files') {
      const fileId = `f_in${++this.fileSeq}`;
      json(200, {
        file_id: fileId,
        upload_url: `${this.baseUrl}/upload/${fileId}`,
        headers: { 'x-amz-meta-account': 'acct_1' },
        expires_at: '2026-10-15T00:00:00+00:00',
      });
      return;
    }
    if (req.method === 'PUT' && url.pathname.startsWith('/upload/')) {
      this.uploads.set(url.pathname.slice('/upload/'.length), raw);
      res.writeHead(200).end();
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/edit') {
      const named = String(body?.source?.file_id ?? '');
      if (this.forgotten.has(named)) {
        json(404, { error: { code: 'not_found', message: 'File not found', hint: 'upload it again' } });
        return;
      }
      if (this.options.asyncEdit) json(202, { job_id: 'job_edit_1', status: 'queued' });
      else json(200, this.editResponse());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/batch') {
      json(202, { job_id: 'job_batch_1', status: 'queued' });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/text') {
      json(200, this.textResponse());
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/preview') {
      res.writeHead(200, { 'content-type': 'image/png' });
      res.end(PNG_BYTES);
      return;
    }
    if (req.method === 'GET' && url.pathname.startsWith('/v1/jobs/')) {
      const jobId = decodeURIComponent(url.pathname.slice('/v1/jobs/'.length));
      if (this.polls < (this.options.runningPolls ?? 0)) {
        this.polls += 1;
        json(200, { status: 'running', job_id: jobId, kind: 'edit', progress: { done: 0, total: 1 } });
        return;
      }
      json(200, this.jobBody(jobId));
      return;
    }
    if (req.method === 'GET' && url.pathname.startsWith('/storage/')) {
      if (url.pathname.endsWith('.png')) {
        res.writeHead(200, { 'content-type': 'image/png' });
        res.end(PNG_BYTES);
      } else {
        res.writeHead(200, { 'content-type': 'application/pdf' });
        res.end(PDF_BYTES);
      }
      return;
    }
    json(404, { error: { code: 'not_found', message: `No route for ${req.method} ${url.pathname}` } });
  }
}
