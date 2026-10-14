/**
 * The Streamable HTTP entry, for self-hosting the same five tools.
 *
 * No key of its own: each request's `Authorization: Bearer` header is passed
 * through to the gateway, and because the process is not on the caller's
 * machine the tools refuse local paths with the spec's hint.
 *
 * `node dist/http.js` serves on `PORT` (default 8787); `createHandler` is the
 * web-standard face for a Worker or any fetch-native runtime.
 */
import { createServer } from 'node:http';

import { createMcpHandler } from '@modelcontextprotocol/server';

import { GatewayClient } from './client.js';
import { buildServer } from './server.js';

/** `Authorization: Bearer sk_…` -> `sk_…`. */
export function bearerOf(request: Request | undefined): string | undefined {
  const header = request?.headers.get('authorization') ?? undefined;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1];
}

export function createHandler() {
  const base = new GatewayClient({ apiKey: undefined });
  return createMcpHandler((ctx) =>
    buildServer({ mode: 'remote', client: base.withApiKey(bearerOf(ctx.requestInfo)) }),
  );
}

export function serve(port = Number(process.env.PORT ?? 8787)) {
  const handler = createHandler();
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const url = `http://${req.headers.host ?? `localhost:${port}`}${req.url ?? '/'}`;
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(', '));
      }
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
      const request = new Request(url, {
        method: req.method,
        headers,
        ...(body && req.method !== 'GET' && req.method !== 'HEAD' ? { body } : {}),
      });
      handler
        .fetch(request)
        .then(async (response) => {
          res.statusCode = response.status;
          response.headers.forEach((value, name) => res.setHeader(name, value));
          res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
        })
        .catch((error: Error) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: { code: 'internal_error', message: error.message } }));
        });
    });
  });
  server.listen(port);
  return server;
}

if (process.argv[1] && process.argv[1].endsWith('http.js')) serve();
