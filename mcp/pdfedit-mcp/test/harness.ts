/**
 * Calling a tool the way the SDK calls it: parse the arguments with the tool's
 * own input schema, then invoke its handler.
 */
import type { McpServer } from '@modelcontextprotocol/server';

import { registerTools, type ToolContext } from '../src/tools.js';

export interface CapturedTool {
  name: string;
  config: any;
  handler: (args: any, ctx?: any) => Promise<any>;
}

export function captureTools(context: ToolContext): Map<string, CapturedTool> {
  const tools = new Map<string, CapturedTool>();
  const server = {
    registerTool(name: string, config: any, handler: any) {
      tools.set(name, { name, config, handler });
      return {};
    },
  } as unknown as McpServer;
  registerTools(server, context);
  return tools;
}

/** Parse `args` with the tool's schema (as `tools/call` does) and run it. */
export async function callTool(tools: Map<string, CapturedTool>, name: string, args: unknown): Promise<any> {
  const tool = tools.get(name);
  if (!tool) throw new Error(`no tool ${name}`);
  const parsed = tool.config.inputSchema.parse(args);
  return await tool.handler(parsed, {});
}
