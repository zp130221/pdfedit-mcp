/**
 * `editFile`: a local path becomes a `file_id`, never a request body.
 *
 * PDFs are uploaded out of band -- `POST /v1/files` for a presigned URL, a
 * PUT of the bytes, and only then the edit referring to `source.file_id`.
 * That is the same flow `mcp/pdfedit-mcp/src/files.ts` implements, so the
 * assertions here are about the order and the shape of those three calls.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FakeGateway } from 'fake-gateway';

import { PdfEdit, PdfEditError, type EditResponse } from '../src/index.js';

const SOURCE_PDF = '%PDF-1.7\n% a local file\n%%EOF\n';

let gateway: FakeGateway;
let client: PdfEdit;
let directory: string;
let path: string;

beforeEach(async () => {
  gateway = new FakeGateway();
  const baseUrl = await gateway.start();
  client = new PdfEdit({ apiKey: 'sk_test_1', baseUrl });
  directory = await mkdtemp(join(tmpdir(), 'pdfedit-sdk-'));
  path = join(directory, 'contract.pdf');
  await writeFile(path, SOURCE_PDF, 'utf8');
});

afterEach(async () => {
  await gateway.stop();
  await rm(directory, { recursive: true, force: true });
});

describe('editFile', () => {
  it('uploads the file, then edits by file_id', async () => {
    const response = (await client.editFile(path, [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }], {
      preview: 'none',
    })) as EditResponse;

    expect(response.status).toBe('partial');

    // One presign, one PUT of exactly the file's bytes, one edit -- in order.
    expect(gateway.requests.map((request) => `${request.method} ${request.path}`)).toEqual([
      'POST /v1/files',
      'PUT /upload/f_in1',
      'POST /v1/edit',
    ]);
    expect(gateway.uploads.get('f_in1')?.toString('utf8')).toBe(SOURCE_PDF);

    const edit = gateway.to('/v1/edit')[0];
    expect(edit?.body).toEqual({
      source: { file_id: 'f_in1' },
      edits: [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }],
      options: { preview: 'none' },
    });
    // The bytes themselves never appear in the edit body.
    expect(JSON.stringify(edit?.body)).not.toContain('%PDF');
  });

  it('sends the presigned headers the gateway asked for', async () => {
    await client.editFile(path, [{ find: 'a', replace: 'b' }]);
    const put = gateway.requests.find((request) => request.method === 'PUT');
    expect(put?.contentType).toBe('application/pdf');
  });

  it('reports an unreadable path as invalid_request with a hint', async () => {
    const missing = join(directory, 'nope.pdf');
    const error = await client.editFile(missing, [{ find: 'a', replace: 'b' }]).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PdfEditError);
    expect((error as PdfEditError).code).toBe('invalid_request');
    expect((error as PdfEditError).hint).toMatch(/path/i);
    // Nothing was uploaded: the read failed before the presign.
    expect(gateway.requests).toHaveLength(0);
  });
});
