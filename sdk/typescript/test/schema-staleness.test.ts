/**
 * `src/schema.gen.ts` is committed, so CI has to prove it is current.
 *
 * The generator is called in-process (openapi-typescript's programmatic API,
 * the same call `npm run gen` makes) and the result compared with the file on
 * disk. A route or a field added to the gateway without `npm run gen` fails
 * here rather than shipping an SDK whose types quietly disagree with the API.
 */
import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { generateSchemaSource, normalise, OPENAPI_PATH, SCHEMA_OUT_PATH } from '../scripts/gen-schema.js';
import type { components } from '../src/schema.gen.js';

describe('src/schema.gen.ts', () => {
  it('matches a fresh generation from openapi/openapi.json', async () => {
    const [committed, fresh] = await Promise.all([
      readFile(SCHEMA_OUT_PATH, 'utf8').then(normalise),
      generateSchemaSource(),
    ]);
    expect(
      committed === fresh,
      `${SCHEMA_OUT_PATH} is stale; run \`npm run gen\` (source: ${OPENAPI_PATH})`,
    ).toBe(true);
  });

  it('carries the do-not-edit header', async () => {
    const committed = await readFile(SCHEMA_OUT_PATH, 'utf8');
    expect(committed).toContain('DO NOT EDIT');
    expect(committed).toContain('npm run gen');
  });

  it('exports the schemas the client methods are typed from', async () => {
    const document = JSON.parse(await readFile(OPENAPI_PATH, 'utf8'));
    for (const name of [
      'EditRequest',
      'EditResponse',
      'QueuedResponse',
      'TextRequest',
      'TextResponse',
      'PreviewRequest',
      'BatchRequest',
      'EditModel',
      'SourceModel',
      'GatewayOptions',
    ]) {
      expect(Object.keys(document.components.schemas)).toContain(name);
    }

    // A compile-time assertion as well: these names must exist in the
    // generated `components`, or this file does not typecheck.
    const edit: components['schemas']['EditRequest'] = {
      source: { file_id: 'f_1' },
      edits: [{ find: 'a', replace: 'b', op: 'replace' }],
      options: { async: true },
    };
    expect(edit.edits).toHaveLength(1);
  });
});
