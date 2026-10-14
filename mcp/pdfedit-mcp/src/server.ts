/**
 * The `McpServer` factory both transports share, so stdio and Streamable HTTP
 * can never offer different tools.
 */
import { McpServer } from '@modelcontextprotocol/server';

import { GatewayClient } from './client.js';
import type { ServerMode } from './files.js';
import { registerTools, type ToolContext } from './tools.js';

export const SERVER_NAME = 'pdfedit';
export const SERVER_VERSION = '0.1.0';

export interface BuildServerOptions extends Partial<ToolContext> {
  client?: GatewayClient;
  mode?: ServerMode;
}

export function buildServer(options: BuildServerOptions = {}): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION, title: 'PDF Edit' },
    { capabilities: { tools: {} } },
  );
  registerTools(server, {
    client: options.client ?? new GatewayClient(),
    mode: options.mode ?? 'stdio',
    pollTimeoutMs: options.pollTimeoutMs,
    pollIntervalMs: options.pollIntervalMs,
  });
  return server;
}
