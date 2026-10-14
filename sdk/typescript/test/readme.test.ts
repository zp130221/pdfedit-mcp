/**
 * The README's three quickstart examples, verbatim, run against the fake
 * gateway.
 *
 * A quickstart that does not compile is worse than no quickstart: it is the
 * first code anyone writes with the SDK. Keeping the snippets here means the
 * compiler checks them (`npm run typecheck`) and the suite runs them, so a
 * renamed method or a tightened type cannot leave the README behind. The
 * bodies below are the README's, with only `editFile`'s path and the key
 * pointed at the fixtures.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FakeGateway } from 'fake-gateway';

import { PdfEdit, isQueued } from '../src/index.js';

let gateway: FakeGateway;
let pdfedit: PdfEdit;
let directory: string;

beforeEach(async () => {
  gateway = new FakeGateway();
  const baseUrl = await gateway.start();
  pdfedit = new PdfEdit({ apiKey: 'sk_test_1', baseUrl });
  directory = await mkdtemp(join(tmpdir(), 'pdfedit-readme-'));
});

afterEach(async () => {
  await gateway.stop();
  await rm(directory, { recursive: true, force: true });
});

async function fixture(name: string): Promise<string> {
  const path = join(directory, name);
  await writeFile(path, '%PDF-1.7\n%%EOF\n', 'utf8');
  return path;
}

describe('README quickstart', () => {
  it('example 1: replace text', async () => {
    const result = await pdfedit.editFile(await fixture('contract.pdf'), [
      { find: 'Acme Inc.', replace: 'Acme, Inc.' },
    ]);
    if (isQueued(result)) throw new Error(`queued as ${result.job_id}`);

    expect(result.status).toBe('partial');
    expect(result.output?.url).toContain('/storage/f_out1');
  });

  it('example 2: redact', async () => {
    const redacted = await pdfedit.editFile(
      await fixture('statement.pdf'),
      [{ op: 'redact', find: '4111 1111 1111 1111' }],
      { redact_metadata: true },
    );
    if (isQueued(redacted)) throw new Error(`queued as ${redacted.job_id}`);

    expect(redacted.changes?.map((change) => change.page)).toEqual([1, 1, 4]);
    expect(gateway.to('/v1/edit')[0]?.body).toEqual({
      source: { file_id: 'f_in1' },
      edits: [{ op: 'redact', find: '4111 1111 1111 1111' }],
      options: { redact_metadata: true },
    });
  });

  it('example 3: batch', async () => {
    const template = new Uint8Array(Buffer.from('%PDF-1.7\n%%EOF\n'));
    const job = await pdfedit.batch({
      source: { file_id: await pdfedit.uploadFile(template) },
      edits: [{ find: '{{name}}', replace: '{{name}}' }],
      records: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }],
    });

    const done = await pdfedit.waitForJob(job.job_id);
    expect(done.status).toBe('done');
    expect(done.records).toHaveLength(2);
  });
});
