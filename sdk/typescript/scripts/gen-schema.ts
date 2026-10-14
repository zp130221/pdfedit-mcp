/**
 * `src/schema.gen.ts` from `openapi/openapi.json` (`npm run gen`).
 *
 * The generation is a pure function (`generateSchemaSource`) rather than a
 * shell pipeline so that the staleness test can call it in-process: the test
 * regenerates the types and compares them with the committed file, which is
 * the whole point of committing a generated file -- a route added to the
 * gateway without a regeneration fails the suite instead of silently
 * shipping an SDK that cannot describe it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import openapiTS, { astToString, type OpenAPI3 } from 'openapi-typescript';

/**
 * `defaultNonNullable: false`.
 *
 * openapi-typescript's default is to mark a property that has a `default` as
 * *required*, on the theory that the server always sends it. That is wrong
 * for a request body: `EditModel.op` defaults to `"replace"` precisely so a
 * caller can leave it out, and with the default setting
 * `{ find, replace }` -- the first example in the README and in the spec --
 * would not compile. Requests outnumber responses in a client SDK, so the
 * option is off and a defaulted response field reads as optional instead.
 */
const OPTIONS = { defaultNonNullable: false } as const;

const here = dirname(fileURLToPath(import.meta.url));

/** The single schema the MCP tools, this SDK and the Python SDK all read. */
export const OPENAPI_PATH = resolve(here, '../../../openapi/openapi.json');

/** Where the generated types are committed. */
export const SCHEMA_OUT_PATH = resolve(here, '../src/schema.gen.ts');

const HEADER = [
  '/**',
  ' * DO NOT EDIT -- generated from openapi/openapi.json by openapi-typescript.',
  ' * Regenerate with `npm run gen`; `npm test` fails when this file is stale.',
  ' */',
  '',
].join('\n');

/** CRLF/LF and trailing-whitespace differences are not staleness. */
export function normalise(source: string): string {
  return source.replace(/\r\n/g, '\n').replace(/\s*$/, '\n');
}

/** The exact text `src/schema.gen.ts` must contain, LF-normalised. */
export async function generateSchemaSource(): Promise<string> {
  const document = JSON.parse(await readFile(OPENAPI_PATH, 'utf8')) as OpenAPI3;
  const ast = await openapiTS(document, OPTIONS);
  return normalise(HEADER + astToString(ast));
}

const entry = process.argv[1];
if (entry && pathToFileURL(entry).href === import.meta.url) {
  const source = await generateSchemaSource();
  await writeFile(SCHEMA_OUT_PATH, source, 'utf8');
  console.log(`wrote ${SCHEMA_OUT_PATH} (${source.length} bytes)`);
}
