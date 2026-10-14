/** The generated schemas must match what the gateway's OpenAPI says today. */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { COMPONENTS, OUTPUT_PATH, generateSchemas, readSpec } from '../scripts/gen-tools.js';
import * as generated from '../src/schemas.gen.js';
import { EditOptions, PdfEditInput, PdfFindInput, PdfPreviewInput } from '../src/tools.js';

describe('src/schemas.gen.ts', () => {
  it('is not stale: regenerating from openapi.json produces the checked-in file', () => {
    const fresh = generateSchemas(readSpec());
    const onDisk = readFileSync(OUTPUT_PATH, 'utf8');
    expect(onDisk.replace(/\r\n/g, '\n')).toBe(fresh.replace(/\r\n/g, '\n'));
  });

  it('exports one schema per OpenAPI component the tools need', () => {
    for (const name of COMPONENTS) {
      expect(generated, name).toHaveProperty(name);
    }
    expect(generated.GENERATED_FROM).toEqual([...COMPONENTS]);
  });

  it('keeps EditModel faithful to the component: defaults, enums and extra-key rejection', () => {
    const spec = readSpec().components.schemas.EditModel;
    const parsed = generated.EditModel.parse({ find: 'Acme Inc.', replace: 'Acme, Inc.' });
    expect(parsed.op).toBe(spec.properties.op.default);
    expect(parsed.fit).toBe(spec.properties.fit.default);
    expect(() => generated.EditModel.parse({ find: 'x', op: 'rewrite' })).toThrow();
    expect(() => generated.EditModel.parse({ find: 'x', nonsense: 1 })).toThrow();
  });

  it('takes an edit`s options from GatewayOptions, which is BatchOptions minus the batch-only three', () => {
    const batchOnly = ['output', 'filename', 'fail_fast'];
    for (const key of batchOnly) expect(Object.keys(generated.BatchOptions.shape)).toContain(key);
    for (const key of batchOnly) expect(Object.keys(EditOptions.shape)).not.toContain(key);
    // The component the `/v1/edit` body actually names, not a derivation of
    // the batch one: the two must otherwise agree key for key.
    expect(Object.keys(EditOptions.shape).sort()).toEqual(
      Object.keys(generated.GatewayOptions.shape).sort(),
    );
    expect(Object.keys(generated.BatchOptions.shape).filter((k) => !batchOnly.includes(k)).sort()).toEqual(
      Object.keys(generated.GatewayOptions.shape).sort(),
    );
    expect(EditOptions.parse({}).watermark).toBe('auto');
    expect(EditOptions.parse({ async: true }).async).toBe(true);
  });

  it('builds the find/preview inputs from the request components, with source replaced by file', () => {
    expect(Object.keys(PdfFindInput.shape)).not.toContain('source');
    expect(Object.keys(PdfFindInput.shape)).toContain('file');
    expect(PdfFindInput.parse({ file: 'a.pdf' }).limit).toBe(
      readSpec().components.schemas.TextRequest.properties.limit.default,
    );
    expect(PdfPreviewInput.parse({ file: 'a.pdf' }).scale).toBe(
      readSpec().components.schemas.PreviewRequest.properties.scale.default,
    );
  });

  it('rejects an edits list longer than the API accepts', () => {
    const edit = { find: 'x', replace: 'y' };
    expect(() => PdfEditInput.parse({ file: 'a.pdf', edits: Array(201).fill(edit) })).toThrow();
    expect(() => PdfEditInput.parse({ file: 'a.pdf', edits: [] })).toThrow();
  });
});
