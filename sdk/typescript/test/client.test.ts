/**
 * Every method of `PdfEdit` against the MCP package's fake gateway.
 *
 * The fake is the one from `mcp/pdfedit-mcp/test/fake-gateway.ts` (aliased as
 * `fake-gateway` in `vitest.config.ts`): its fixtures are shaped from
 * `openapi/openapi.json`, so a test passing here means the SDK and the MCP
 * tools agree about the wire.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FakeGateway, PNG_BYTES } from 'fake-gateway';

import { DEFAULT_BASE_URL, PdfEdit, type EditResponse, type QueuedResponse } from '../src/index.js';

let gateway: FakeGateway;
let client: PdfEdit;

beforeEach(async () => {
  gateway = new FakeGateway();
  const baseUrl = await gateway.start();
  client = new PdfEdit({ apiKey: 'sk_test_1', baseUrl });
});

afterEach(async () => {
  await gateway.stop();
});

describe('construction', () => {
  it('reads the key and the base URL from the environment', () => {
    const before = { key: process.env.PDFEDIT_API_KEY, url: process.env.PDFEDIT_BASE_URL };
    process.env.PDFEDIT_API_KEY = 'sk_env';
    process.env.PDFEDIT_BASE_URL = 'https://gateway.example/';
    try {
      const fromEnv = new PdfEdit();
      expect(fromEnv.apiKey).toBe('sk_env');
      // The trailing slash is dropped so `${baseUrl}/v1/edit` never doubles up.
      expect(fromEnv.baseUrl).toBe('https://gateway.example');
    } finally {
      if (before.key === undefined) delete process.env.PDFEDIT_API_KEY;
      else process.env.PDFEDIT_API_KEY = before.key;
      if (before.url === undefined) delete process.env.PDFEDIT_BASE_URL;
      else process.env.PDFEDIT_BASE_URL = before.url;
    }
  });

  it('falls back to the public default base URL', () => {
    const before = process.env.PDFEDIT_BASE_URL;
    delete process.env.PDFEDIT_BASE_URL;
    try {
      expect(new PdfEdit({ apiKey: 'sk_1' }).baseUrl).toBe(DEFAULT_BASE_URL);
    } finally {
      if (before !== undefined) process.env.PDFEDIT_BASE_URL = before;
    }
  });
});

describe('edit', () => {
  it('posts EditRequest to /v1/edit and returns the EditResponse', async () => {
    const response = (await client.edit({
      source: { file_id: 'f_in1' },
      edits: [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }],
    })) as EditResponse;

    expect(response.status).toBe('partial');
    expect(response.job_id).toBe('job_edit_1');
    expect(response.changes).toHaveLength(3);
    expect(response.output?.file_id).toBe('f_out1');

    const [request] = gateway.to('/v1/edit');
    expect(request?.method).toBe('POST');
    expect(request?.authorization).toBe('Bearer sk_test_1');
    expect(request?.contentType).toContain('application/json');
    expect(request?.body).toEqual({
      source: { file_id: 'f_in1' },
      edits: [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }],
    });
  });

  it('returns the 202 QueuedResponse instead of throwing', async () => {
    const queued = new FakeGateway({ asyncEdit: true });
    const baseUrl = await queued.start();
    const asyncClient = new PdfEdit({ apiKey: 'sk_test_1', baseUrl });
    try {
      const response = (await asyncClient.edit({
        source: { file_id: 'f_in1' },
        edits: [{ find: 'a', replace: 'b' }],
        options: { async: true },
      })) as QueuedResponse;
      expect(response.status).toBe('queued');
      expect(response.job_id).toBe('job_edit_1');
    } finally {
      await queued.stop();
    }
  });
});

describe('text', () => {
  it('posts TextRequest and returns the spans', async () => {
    const response = await client.text({ source: { file_id: 'f_in1' }, query: 'Acme Inc.' });
    expect(response.page_count).toBe(4);
    expect(response.spans?.[0]?.span_id).toBe('p1b2l1s0');
    expect(gateway.to('/v1/text')[0]?.body).toEqual({ source: { file_id: 'f_in1' }, query: 'Acme Inc.' });
  });
});

describe('preview', () => {
  it('returns the PNG bytes', async () => {
    const bytes = await client.preview({ source: { file_id: 'f_in1' }, page: 2, scale: 2 });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(bytes).equals(PNG_BYTES)).toBe(true);
    // The PNG signature, so a JSON body could never pass as an image.
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(gateway.to('/v1/preview')[0]?.body).toEqual({
      source: { file_id: 'f_in1' },
      page: 2,
      scale: 2,
    });
  });
});

describe('batch', () => {
  it('posts BatchRequest and returns the queued job', async () => {
    const response = await client.batch({
      source: { file_id: 'f_tpl' },
      edits: [{ find: '{{name}}', replace: '{{name}}' }],
      records: [{ name: 'Ada' }, { name: 'Grace' }],
    });
    expect(response.job_id).toBe('job_batch_1');
    expect(response.status).toBe('queued');
    expect(gateway.to('/v1/batch')[0]?.body?.records).toHaveLength(2);
  });
});

describe('job', () => {
  it('gets one job by id, url-encoding it', async () => {
    const response = await client.job('job_batch_1');
    expect(response.status).toBe('done');
    expect(response.job_id).toBe('job_batch_1');
    expect(response.progress).toEqual({ done: 2, total: 2 });
    expect(gateway.to('/v1/jobs/job_batch_1')[0]?.method).toBe('GET');
  });
});

describe('uploadFile', () => {
  it('presigns, PUTs and hands back the file id', async () => {
    const fileId = await client.uploadFile(new Uint8Array(Buffer.from('%PDF-1.7\n%%EOF\n')));
    expect(fileId).toBe('f_in1');
    expect(gateway.uploads.get('f_in1')?.toString('utf8')).toContain('%PDF-1.7');
  });
});
