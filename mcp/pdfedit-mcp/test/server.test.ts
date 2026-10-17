/** The transports: tool registration on a real McpServer, and HTTP auth passthrough. */
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_BASE_URL, GatewayClient, GatewayError } from '../src/client.js';
import { defaultOutputPath, expandPath, isFileId, isHttpUrl } from '../src/files.js';
import { bearerOf } from '../src/http.js';
import { buildServer } from '../src/server.js';
import { FakeGateway } from './fake-gateway.js';
import { callTool, captureTools } from './harness.js';

describe('buildServer', () => {
  it('registers the five tools on a real McpServer and converts their schemas to JSON Schema', () => {
    const server = buildServer({ client: new GatewayClient({ baseUrl: 'http://127.0.0.1:1' }), mode: 'stdio' });
    for (const name of ['pdf_edit', 'pdf_batch', 'pdf_find', 'pdf_preview', 'pdf_job']) {
      const schema = (server as any).toolInputSchemaJson(name) as Record<string, any>;
      expect(schema, name).toBeTruthy();
      expect(schema.type).toBe('object');
      expect(Object.keys(schema.properties)).toContain(name === 'pdf_job' ? 'job_id' : 'file');
    }
    const editSchema = (server as any).toolInputSchemaJson('pdf_edit');
    expect(editSchema.required).toContain('edits');
    expect(editSchema.properties.edits.items.properties.op.enum).toEqual([
      'replace',
      'delete',
      'redact',
      'insert',
      'form',
    ]);
  });
});

describe('auth and base URL', () => {
  let gateway: FakeGateway;
  beforeEach(async () => {
    gateway = new FakeGateway({ requireKey: true });
    await gateway.start();
  });
  afterEach(() => gateway.stop());

  it('reads the bearer token out of an HTTP request and passes it to the gateway', async () => {
    const request = new Request('http://localhost:8787/mcp', {
      method: 'POST',
      headers: { authorization: 'Bearer sk_live_9' },
    });
    expect(bearerOf(request)).toBe('sk_live_9');
    expect(bearerOf(new Request('http://localhost:8787/mcp'))).toBeUndefined();

    const tools = captureTools({
      client: new GatewayClient({ baseUrl: gateway.baseUrl }).withApiKey(bearerOf(request)),
      mode: 'remote',
    });
    await callTool(tools, 'pdf_find', { file: 'f_stored9' });
    expect(gateway.to('/v1/text')[0]!.authorization).toBe('Bearer sk_live_9');
  });

  it('takes PDFEDIT_API_KEY and PDFEDIT_BASE_URL from the environment', () => {
    const previous = { key: process.env.PDFEDIT_API_KEY, url: process.env.PDFEDIT_BASE_URL };
    try {
      delete process.env.PDFEDIT_API_KEY;
      delete process.env.PDFEDIT_BASE_URL;
      expect(new GatewayClient().baseUrl).toBe(DEFAULT_BASE_URL);
      expect(new GatewayClient().apiKey).toBeUndefined();

      process.env.PDFEDIT_API_KEY = 'sk_env_1';
      process.env.PDFEDIT_BASE_URL = 'https://gw.example.com/';
      const client = new GatewayClient();
      expect(client.apiKey).toBe('sk_env_1');
      expect(client.baseUrl).toBe('https://gw.example.com');
    } finally {
      if (previous.key === undefined) delete process.env.PDFEDIT_API_KEY;
      else process.env.PDFEDIT_API_KEY = previous.key;
      if (previous.url === undefined) delete process.env.PDFEDIT_BASE_URL;
      else process.env.PDFEDIT_BASE_URL = previous.url;
    }
  });
});

describe('file argument helpers', () => {
  it('classifies ids, URLs and paths', () => {
    expect(isFileId('f_abc-123')).toBe(true);
    expect(isFileId('./f_abc.pdf')).toBe(false);
    expect(isHttpUrl('https://x/y.pdf')).toBe(true);
    expect(isHttpUrl('C:/x/y.pdf')).toBe(false);
  });

  it('expands ~ and keeps absolute paths', () => {
    expect(expandPath('~')).toBe(homedir());
    expect(expandPath('~/a.pdf')).toBe(resolve(homedir(), 'a.pdf'));
    expect(expandPath(resolve('/tmp', 'a.pdf'))).toBe(resolve('/tmp', 'a.pdf'));
  });

  it('rejects a relative path instead of resolving it against the cwd', () => {
    for (const relative of ['a.pdf', './a.pdf', '../a.pdf']) {
      let error: unknown;
      try {
        expandPath(relative);
      } catch (caught) {
        error = caught;
      }
      expect(error, relative).toBeInstanceOf(GatewayError);
      const gatewayError = error as GatewayError;
      expect(gatewayError.code).toBe('invalid_request');
      expect(gatewayError.hint).toBe('pass an absolute path or ~/…');
      expect(gatewayError.message).toContain(relative);
    }
  });

  it('names the default output next to the input', () => {
    expect(defaultOutputPath(join('/tmp', 'contract.pdf'))).toBe(join('/tmp', 'contract.edited.pdf'));
    expect(defaultOutputPath(join('/tmp', 'noext'))).toBe(join('/tmp', 'noext.edited.pdf'));
    const taken = new Set([join('/tmp', 'contract.edited.pdf'), join('/tmp', 'contract.edited.2.pdf')]);
    const exists = (p: string) => taken.has(p);
    expect(defaultOutputPath(join('/tmp', 'contract.pdf'), exists)).toBe(join('/tmp', 'contract.edited.3.pdf'));
    expect(defaultOutputPath(join('/tmp', 'contract.edited.pdf'), exists)).toBe(join('/tmp', 'contract.edited.3.pdf'));
    expect(defaultOutputPath(join('/tmp', 'contract.edited.2.pdf'), () => false)).toBe(join('/tmp', 'contract.edited.pdf'));
  });
});
