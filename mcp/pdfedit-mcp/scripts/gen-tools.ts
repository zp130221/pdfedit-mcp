/**
 * Generates `src/schemas.gen.ts` from the gateway's OpenAPI document.
 *
 * The tool input schemas are not hand-written: `openapi/openapi.json` is the
 * one source for the gateway, the SDKs and these tools (spec §7, "one schema
 * used in three places"). This script translates the subset of JSON Schema
 * FastAPI emits for the components the five tools need into zod, and
 * `test/schemas.gen.test.ts` fails when the checked-in file no longer matches
 * what this script would emit.
 *
 * Run: `npm run gen`
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The gateway's OpenAPI document (repo root `openapi/openapi.json`). */
export const OPENAPI_PATH = resolve(HERE, '../../../openapi/openapi.json');
/** The generated file. */
export const OUTPUT_PATH = resolve(HERE, '../src/schemas.gen.ts');

/**
 * The components the five tools need, in dependency order: every `$ref` a
 * component makes must already be defined above it.
 */
export const COMPONENTS = [
  'SourceModel',
  'RegionModel',
  'AtModel',
  'StyleModel',
  'MatchModel',
  'FontOptions',
  'GatewayOptions',
  'ScopeModel',
  'EditModel',
  'BatchOptions',
  'BatchRequest',
  'TextRequest',
  'PreviewRequest',
] as const;

type JsonSchema = Record<string, any>;

function quote(value: string): string {
  return JSON.stringify(value);
}

function isNullSchema(schema: JsonSchema): boolean {
  return schema.type === 'null';
}

/** `{ "$ref": "#/components/schemas/X" }` -> `X`. */
function refName(ref: string): string {
  const name = ref.split('/').pop();
  if (!name) throw new Error(`unsupported $ref: ${ref}`);
  return name;
}

function emitEnum(values: unknown[]): string {
  if (values.every((value) => typeof value === 'string')) {
    return `z.enum([${values.map((value) => quote(value as string)).join(', ')}])`;
  }
  return `z.union([${values.map((value) => `z.literal(${JSON.stringify(value)})`).join(', ')}])`;
}

/** One JSON Schema node as a zod expression. */
function emit(schema: JsonSchema): string {
  if (schema.$ref) return refName(schema.$ref);

  if (Array.isArray(schema.anyOf)) {
    const members: JsonSchema[] = schema.anyOf;
    const nonNull = members.filter((member) => !isNullSchema(member));
    const nullable = nonNull.length !== members.length;
    let inner: string;
    if (nonNull.length === 0) {
      inner = 'z.null()';
    } else if (nonNull.length === 1) {
      inner = emit(nonNull[0]!);
    } else {
      inner = `z.union([${nonNull.map((member) => emit(member)).join(', ')}])`;
    }
    return nullable && nonNull.length > 0 ? `${inner}.nullable()` : inner;
  }

  if (schema.const !== undefined) return `z.literal(${JSON.stringify(schema.const)})`;
  if (Array.isArray(schema.enum)) return emitEnum(schema.enum);

  switch (schema.type) {
    case 'string': {
      let expr = schema.format === 'uri' ? 'z.url()' : 'z.string()';
      if (typeof schema.minLength === 'number') expr += `.min(${schema.minLength})`;
      if (typeof schema.maxLength === 'number') expr += `.max(${schema.maxLength})`;
      if (typeof schema.pattern === 'string') expr += `.regex(new RegExp(${quote(schema.pattern)}))`;
      return expr;
    }
    case 'integer':
    case 'number': {
      let expr = schema.type === 'integer' ? 'z.int()' : 'z.number()';
      if (typeof schema.minimum === 'number') expr += `.min(${schema.minimum})`;
      if (typeof schema.maximum === 'number') expr += `.max(${schema.maximum})`;
      return expr;
    }
    case 'boolean':
      return 'z.boolean()';
    case 'null':
      return 'z.null()';
    case 'array': {
      let expr = `z.array(${schema.items ? emit(schema.items) : 'z.unknown()'})`;
      if (typeof schema.minItems === 'number') expr += `.min(${schema.minItems})`;
      if (typeof schema.maxItems === 'number') expr += `.max(${schema.maxItems})`;
      return expr;
    }
    case 'object':
      return emitObject(schema);
    default:
      if (schema.properties) return emitObject(schema);
      return 'z.unknown()';
  }
}

function emitObject(schema: JsonSchema, indent = '  '): string {
  const properties: Record<string, JsonSchema> = schema.properties ?? {};
  const names = Object.keys(properties);
  if (names.length === 0) {
    // FastAPI's `dict[str, Any]`.
    return 'z.record(z.string(), z.unknown())';
  }

  const required: string[] = schema.required ?? [];
  const lines: string[] = [];
  for (const name of names) {
    const property = properties[name]!;
    let expr = emit(property);
    // Defaults are documented, never injected: zod would fill `flatten: false`
    // into a `replace` edit and the gateway's per-op allow-table rejects the
    // field it did not ask for. The API applies its own defaults server-side.
    let description = property.description ?? '';
    if (property.default !== undefined) {
      description = `${description}${description ? ' ' : ''}(default: ${JSON.stringify(property.default)})`;
    }
    if (description) expr += `.describe(${quote(description)})`;
    if (!required.includes(name)) expr += '.optional()';
    lines.push(`${indent}  ${quote(name)}: ${expr},`);
  }

  const factory = schema.additionalProperties === false ? 'z.strictObject' : 'z.looseObject';
  return `${factory}({\n${lines.join('\n')}\n${indent}})`;
}

/** The whole `src/schemas.gen.ts`, as text. */
export function generateSchemas(spec: JsonSchema): string {
  const schemas: Record<string, JsonSchema> = spec.components?.schemas ?? {};
  const parts: string[] = [
    '// Generated by scripts/gen-tools.ts from openapi/openapi.json. DO NOT EDIT.',
    '// Regenerate with `npm run gen`; test/schemas.gen.test.ts fails when stale.',
    "import * as z from 'zod';",
    '',
  ];

  for (const name of COMPONENTS) {
    const schema = schemas[name];
    if (!schema) throw new Error(`openapi.json has no component ${name}`);
    const description: string | undefined = schema.description;
    if (description) {
      parts.push('/**');
      for (const line of description.split('\n')) parts.push(` * ${line}`.trimEnd());
      parts.push(' */');
    }
    parts.push(`export const ${name} = ${emitObject(schema, '')};`, '');
  }

  parts.push(
    '/** The components this file was generated from, for the staleness test. */',
    `export const GENERATED_FROM = [${COMPONENTS.map((name) => quote(name)).join(', ')}] as const;`,
    '',
  );
  return parts.join('\n');
}

export function readSpec(): JsonSchema {
  return JSON.parse(readFileSync(OPENAPI_PATH, 'utf8'));
}

function main(): void {
  writeFileSync(OUTPUT_PATH, generateSchemas(readSpec()), 'utf8');
  process.stdout.write(`wrote ${OUTPUT_PATH}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
