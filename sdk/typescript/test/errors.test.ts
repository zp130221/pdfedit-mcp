/**
 * The error envelope (`{"error": {"code", "message", "hint"}}`) as a
 * `PdfEditError`, and the fallback for a body that is not that envelope at
 * all -- a proxy's HTML 502 is the common case, and a client that throws a
 * `SyntaxError: Unexpected token '<'` there has lost the status code the
 * caller needed.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { FakeGateway } from 'fake-gateway';

import { PdfEdit, PdfEditError } from '../src/index.js';

const gateways: FakeGateway[] = [];

afterEach(async () => {
  await Promise.all(gateways.splice(0).map((gateway) => gateway.stop()));
});

async function unauthorizedClient(): Promise<PdfEdit> {
  const gateway = new FakeGateway({ requireKey: true });
  gateways.push(gateway);
  const baseUrl = await gateway.start();
  // No key at all, so the gateway answers its `unauthorized` envelope.
  return new PdfEdit({ apiKey: '', baseUrl });
}

describe('PdfEditError', () => {
  it('carries code, message, hint and status out of the envelope', async () => {
    const client = await unauthorizedClient();
    const error = await client
      .edit({ source: { file_id: 'f_in1' }, edits: [{ find: 'a', replace: 'b' }] })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PdfEditError);
    const failure = error as PdfEditError;
    expect(failure.name).toBe('PdfEditError');
    expect(failure.code).toBe('unauthorized');
    expect(failure.message).toBe('Missing API key');
    expect(failure.hint).toBe('send Authorization: Bearer sk_…');
    expect(failure.status).toBe(401);
    // The thrown value is a real Error, so a stack and `throw` both behave.
    expect(failure).toBeInstanceOf(Error);
    expect(failure.stack).toBeTruthy();
  });

  it('raises on a GET too', async () => {
    const client = await unauthorizedClient();
    const error = (await client.job('job_edit_1').catch((e: unknown) => e)) as PdfEditError;
    expect(error).toBeInstanceOf(PdfEditError);
    expect(error.code).toBe('unauthorized');
  });

  it('leaves hint undefined when the envelope omits it', async () => {
    const client = new PdfEdit({
      apiKey: 'sk_test_1',
      baseUrl: 'https://gateway.invalid',
      fetch: async () =>
        new Response(JSON.stringify({ error: { code: 'not_found', message: 'Job not found' } }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
    });
    const error = (await client.job('job_gone').catch((e: unknown) => e)) as PdfEditError;
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Job not found');
    expect(error.status).toBe(404);
    expect(error.hint).toBeUndefined();
  });

  it('falls back to the status line when the body is not JSON', async () => {
    const client = new PdfEdit({
      apiKey: 'sk_test_1',
      baseUrl: 'https://gateway.invalid',
      fetch: async () =>
        new Response('<html><body>502 Bad Gateway</body></html>', {
          status: 502,
          statusText: 'Bad Gateway',
          headers: { 'content-type': 'text/html' },
        }),
    });

    const error = (await client
      .edit({ source: { file_id: 'f_in1' }, edits: [{ find: 'a', replace: 'b' }] })
      .catch((e: unknown) => e)) as PdfEditError;

    expect(error).toBeInstanceOf(PdfEditError);
    expect(error.code).toBe('http_502');
    expect(error.status).toBe(502);
    expect(error.message).toContain('502');
  });

  it('falls back on a JSON body that is not the envelope', async () => {
    const client = new PdfEdit({
      apiKey: 'sk_test_1',
      baseUrl: 'https://gateway.invalid',
      fetch: async () =>
        new Response(JSON.stringify({ detail: 'Not Found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
    });
    const error = (await client.job('job_1').catch((e: unknown) => e)) as PdfEditError;
    expect(error.code).toBe('http_404');
    expect(error.status).toBe(404);
  });

  it('reports a failed preview as an error, not as PNG bytes', async () => {
    const client = await unauthorizedClient();
    const error = (await client.preview({ source: { file_id: 'f_in1' } }).catch((e: unknown) => e)) as PdfEditError;
    expect(error).toBeInstanceOf(PdfEditError);
    expect(error.code).toBe('unauthorized');
  });
});
