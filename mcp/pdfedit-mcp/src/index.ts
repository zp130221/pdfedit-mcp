#!/usr/bin/env node
/**
 * The stdio entry (`pdfedit-mcp`), for Claude Code, Cursor and Claude Desktop.
 *
 * Runs on the user's machine, so a local path given to a tool is read and
 * uploaded here and the edited PDF is written back next to the input.
 * `PDFEDIT_API_KEY` is optional: without it the hosted API serves the keyless
 * free tier (20 pages a day per IP, outputs watermarked TEST). `PDFEDIT_BASE_URL`
 * points at a self-hosted gateway.
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { buildServer } from './server.js';

serveStdio(() => buildServer({ mode: 'stdio' }), {
  onerror: (error) => process.stderr.write(`pdfedit-mcp: ${error.message}\n`),
});
