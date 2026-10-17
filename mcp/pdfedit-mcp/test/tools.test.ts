/** The five tools against the in-process fake gateway. */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GatewayClient } from '../src/client.js';
import { LOCAL_PATH_HINT, defaultOutputPath } from '../src/files.js';
import { MAX_PREVIEWS, SUMMARY_MAX } from '../src/result.js';
import { DESCRIPTIONS, STRATEGY } from '../src/tools.js';
import { FakeGateway, PDF_BYTES } from './fake-gateway.js';
import { callTool, captureTools } from './harness.js';

let gateway: FakeGateway;
let directory: string;
let inputPath: string;

async function fixtureInput(): Promise<string> {
  directory = await mkdtemp(join(tmpdir(), 'pdfedit-mcp-'));
  const path = join(directory, 'contract.pdf');
  await writeFile(path, PDF_BYTES);
  return path;
}

function toolsFor(gw: FakeGateway, mode: 'stdio' | 'remote' = 'stdio', apiKey = 'sk_test_123') {
  return captureTools({
    client: new GatewayClient({ baseUrl: gw.baseUrl, apiKey }),
    mode,
    pollIntervalMs: 5,
    pollTimeoutMs: 2_000,
  });
}

describe('pdf_edit', () => {
  beforeEach(async () => {
    gateway = new FakeGateway();
    await gateway.start();
    inputPath = await fixtureInput();
  });
  afterEach(() => gateway.stop());

  it('uploads a local path through /v1/files and edits the resulting file_id', async () => {
    const tools = toolsFor(gateway);
    await callTool(tools, 'pdf_edit', {
      file: inputPath,
      edits: [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }],
    });

    expect(gateway.to('/v1/files')).toHaveLength(1);
    expect(gateway.uploads.get('f_in1')).toEqual(PDF_BYTES);
    const edit = gateway.to('/v1/edit')[0]!;
    expect(edit.body.source).toEqual({ file_id: 'f_in1' });
    expect(edit.body.edits[0]).toEqual({ find: 'Acme Inc.', replace: 'Acme, Inc.' });
    expect(edit.authorization).toBe('Bearer sk_test_123');
  });

  it('passes an https URL and an f_ id straight through without uploading', async () => {
    const tools = toolsFor(gateway);
    await callTool(tools, 'pdf_edit', { file: 'https://example.com/a.pdf', edits: [{ find: 'a', replace: 'b' }] });
    await callTool(tools, 'pdf_edit', { file: 'f_stored9', edits: [{ find: 'a', replace: 'b' }] });

    expect(gateway.to('/v1/files')).toHaveLength(0);
    expect(gateway.to('/v1/edit')[0]!.body.source).toEqual({ url: 'https://example.com/a.pdf' });
    expect(gateway.to('/v1/edit')[1]!.body.source).toEqual({ file_id: 'f_stored9' });
  });

  it('summarises in the fixed format, under 300 characters', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'Acme Inc.', replace: 'Acme, Inc.' }] });

    const text: string = result.content[0].text;
    expect(text.length).toBeLessThanOrEqual(SUMMARY_MAX);
    expect(text).toContain('Replaced 3 occurrences on pages 1, 4.');
    expect(text).toContain("1 edit unmatched (did you mean 'Acme, Inc.'?).");
    expect(text).toContain(`Output: ${join(directory, 'contract.edited.pdf')}.`);
  });

  it('returns the gateway response as structuredContent, unmodified', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }] });
    expect(result.structuredContent).toEqual(gateway.editResponse());
  });

  it('downloads the output next to the input, and to output_path when given', async () => {
    const tools = toolsFor(gateway);
    await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }] });
    expect(await readFile(join(directory, 'contract.edited.pdf'))).toEqual(PDF_BYTES);

    const chosen = join(directory, 'elsewhere.pdf');
    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }], output_path: chosen });
    expect(await readFile(chosen)).toEqual(PDF_BYTES);
    expect(result.content[0].text).toContain(`Output: ${chosen}.`);
  });

  it('attaches at most three previews as image blocks', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }] });
    const images = result.content.filter((block: any) => block.type === 'image');
    expect(images).toHaveLength(MAX_PREVIEWS);
    for (const image of images) {
      expect(image.mimeType).toBe('image/png');
      expect(Buffer.from(image.data, 'base64').subarray(1, 4).toString()).toBe('PNG');
    }
  });

  it('refuses a local path in remote mode with the spec hint', async () => {
    const tools = toolsFor(gateway, 'remote');
    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }] });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(LOCAL_PATH_HINT);
    expect(gateway.to('/v1/edit')).toHaveLength(0);
  });

  it('names the download URL instead of a path in remote mode', async () => {
    const tools = toolsFor(gateway, 'remote');
    const result = await callTool(tools, 'pdf_edit', { file: 'f_stored9', edits: [{ find: 'a', replace: 'b' }] });
    expect(result.content[0].text).toContain(`Output: ${gateway.baseUrl}/storage/f_out1.`);
  });
});

describe('pdf_edit async', () => {
  afterEach(() => gateway.stop());

  it('polls /v1/jobs/{id} after a 202 and returns the finished edit', async () => {
    gateway = new FakeGateway({ asyncEdit: true, runningPolls: 2 });
    await gateway.start();
    inputPath = await fixtureInput();
    const tools = toolsFor(gateway);

    const result = await callTool(tools, 'pdf_edit', {
      file: inputPath,
      edits: [{ find: 'a', replace: 'b' }],
      options: { async: true },
    });

    expect(gateway.to('/v1/jobs/job_edit_1').length).toBe(3);
    expect(result.content[0].text).toContain('Replaced 3 occurrences');
    expect(result.structuredContent.job_id).toBe('job_edit_1');
  });

  it('hands back the job id and the pdf_job sentence when the poll times out', async () => {
    gateway = new FakeGateway({ asyncEdit: true, runningPolls: 1_000 });
    await gateway.start();
    inputPath = await fixtureInput();
    const tools = captureTools({
      client: new GatewayClient({ baseUrl: gateway.baseUrl, apiKey: 'sk_test_123' }),
      mode: 'stdio',
      pollIntervalMs: 5,
      pollTimeoutMs: 30,
    });

    const result = await callTool(tools, 'pdf_edit', { file: inputPath, edits: [{ find: 'a', replace: 'b' }] });
    expect(result.content[0].text).toContain("call pdf_job with job_id 'job_edit_1'");
    expect(result.structuredContent).toEqual({ job_id: 'job_edit_1', status: 'queued' });
  });
});

describe('pdf_batch, pdf_find, pdf_preview, pdf_job', () => {
  beforeEach(async () => {
    gateway = new FakeGateway();
    await gateway.start();
    inputPath = await fixtureInput();
  });
  afterEach(() => gateway.stop());

  it('pdf_batch returns the job id and tells the agent to call pdf_job', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_batch', {
      file: inputPath,
      edits: [{ find: '{name}', replace: '{name}' }],
      records: [{ name: 'A' }, { name: 'B' }],
    });
    const body = gateway.to('/v1/batch')[0]!.body;
    expect(body.records).toEqual([{ name: 'A' }, { name: 'B' }]);
    expect(result.structuredContent).toEqual({ job_id: 'job_batch_1', status: 'queued' });
    expect(result.content[0].text).toContain("call pdf_job with job_id 'job_batch_1'");
  });

  it('pdf_find sends query/pages/layers and reports the spans', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_find', {
      file: inputPath,
      query: 'Acme Inc.',
      pages: '1-4',
      layers: ['content', 'forms'],
      match: { mode: 'icase' },
    });
    const body = gateway.to('/v1/text')[0]!.body;
    expect(body).toMatchObject({ query: 'Acme Inc.', pages: '1-4', layers: ['content', 'forms'] });
    expect(body.limit).toBeUndefined();
    expect(body.match.mode).toBe('icase');
    expect(body.source).toEqual({ file_id: 'f_in1' });
    expect(result.structuredContent).toEqual(gateway.textResponse());
    expect(result.content[0].text).toContain('Found 1 span');
    expect(result.content[0].text).toContain('pass next_cursor back as cursor');
  });

  it('pdf_preview returns one PNG image block', async () => {
    const tools = toolsFor(gateway);
    const result = await callTool(tools, 'pdf_preview', { file: inputPath, page: 2, scale: 3 });
    expect(gateway.to('/v1/preview')[0]!.body).toMatchObject({ page: 2, scale: 3 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('image');
    expect(result.content[0].mimeType).toBe('image/png');
  });

  it('pdf_job returns a finished edit, a running job, and a batch summary', async () => {
    const running = new FakeGateway({ runningPolls: 1 });
    await running.start();
    const runningTools = toolsFor(running);
    const first = await callTool(runningTools, 'pdf_job', { job_id: 'job_edit_1' });
    expect(first.content[0].text).toContain('is running (0/1)');
    const second = await callTool(runningTools, 'pdf_job', { job_id: 'job_edit_1' });
    expect(second.content[0].text).toContain('Replaced 3 occurrences');
    expect(second.content[0].text).toContain(`Output: ${running.baseUrl}/storage/f_out1.`);
    const runningTools2 = runningTools;

    const written = join(directory, 'from-job.pdf');
    const third = await callTool(runningTools2, 'pdf_job', { job_id: 'job_edit_1', output_path: written });
    expect(third.content[0].text).toContain(`Output: ${written}.`);
    expect(await readFile(written)).toEqual(PDF_BYTES);

    const tools = toolsFor(gateway);
    const batch = await callTool(tools, 'pdf_job', { job_id: 'job_batch_1' });
    expect(batch.content[0].text).toContain('2/2 records produced an output');
    await running.stop();
  });

  it('turns an error envelope into an isError result carrying code, message and hint', async () => {
    const guarded = new FakeGateway({ requireKey: true });
    await guarded.start();
    const tools = captureTools({
      client: new GatewayClient({ baseUrl: guarded.baseUrl, apiKey: undefined }),
      mode: 'stdio',
    });
    const result = await callTool(tools, 'pdf_find', { file: 'f_stored9' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('unauthorized: Missing API key (send Authorization: Bearer sk_…)');
    expect(result.structuredContent).toEqual({
      error: { code: 'unauthorized', message: 'Missing API key', hint: 'send Authorization: Bearer sk_…' },
    });
    await guarded.stop();
  });
});

describe('tool metadata', () => {
  beforeEach(async () => {
    gateway = new FakeGateway();
    await gateway.start();
  });
  afterEach(() => gateway.stop());

  it('registers exactly the five tools of spec §10 with the right annotations', () => {
    const tools = toolsFor(gateway);
    expect([...tools.keys()]).toEqual(['pdf_edit', 'pdf_batch', 'pdf_find', 'pdf_preview', 'pdf_job']);
    for (const name of ['pdf_edit', 'pdf_batch']) {
      expect(tools.get(name)!.config.annotations).toMatchObject({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      });
    }
    for (const name of ['pdf_find', 'pdf_preview', 'pdf_job']) {
      expect(tools.get(name)!.config.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    }
  });

  it('carries the spec §10 strategy sentences verbatim on the editing tools', () => {
    expect(STRATEGY).toBe(
      "To change text on one page only, set `scope.pages`; to pick one of several identical matches, use `scope.after` with nearby text or `scope.occurrence`. Use `op: 'redact'` when the text must be unrecoverable.",
    );
    expect(DESCRIPTIONS.pdf_edit).toContain(STRATEGY);
    expect(DESCRIPTIONS.pdf_batch).toContain(STRATEGY);
    expect(DESCRIPTIONS.pdf_batch).toContain('call `pdf_job`');
    expect(DESCRIPTIONS.pdf_find).toContain('next_cursor');
    expect(DESCRIPTIONS.pdf_preview).toContain('PNG');
  });
});
