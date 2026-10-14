import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));
/** The repository root: the SDK, the MCP package and the schema all live under it. */
const repoRoot = resolve(here, '../..');

export default defineConfig({
  resolve: {
    alias: {
      // The MCP package's in-process fake gateway, reused rather than copied:
      // one fake, built from `openapi/openapi.json`, keeps the SDK tests and
      // the MCP tool tests honest about the same response shapes. It lives
      // outside this package root, hence the alias plus `server.fs.allow`.
      // `tsconfig.check.json` carries the matching `paths` entry.
      'fake-gateway': resolve(repoRoot, 'mcp/pdfedit-mcp/test/fake-gateway.ts'),
    },
  },
  server: {
    fs: { allow: [repoRoot] },
  },
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
