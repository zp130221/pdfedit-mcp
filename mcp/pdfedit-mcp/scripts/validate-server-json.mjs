/**
 * Check `server.json` before it is published to the MCP Registry.
 *
 *   node scripts/validate-server-json.mjs
 *
 * The registry validates against its published JSON Schema at submission time;
 * this is the half of that check which can run offline and which catches what
 * actually goes wrong in practice -- a version bumped in `package.json` and not
 * here, a package identifier that no longer matches the published name, a
 * `mcpName` that does not match the registry name (the registry uses it to
 * prove ownership of the npm package). A failure here is a failed publish
 * later, which is a tag that has to be deleted.
 *
 * Exits non-zero with one line per problem.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const server = JSON.parse(readFileSync(join(root, 'server.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const problems = [];
const require_ = (condition, message) => {
  if (!condition) problems.push(message);
};

// --- shape ---------------------------------------------------------------
require_(typeof server.$schema === 'string' && server.$schema.startsWith('https://static.modelcontextprotocol.io/schemas/'),
  '$schema must point at a dated modelcontextprotocol.io server schema');
require_(/^[a-z0-9.-]+\/[a-zA-Z0-9._-]+$/.test(server.name ?? ''),
  'name must be a reverse-DNS namespace and a server name, e.g. io.github.user/server');
require_(typeof server.description === 'string' && server.description.length >= 20 && server.description.length <= 400,
  'description must be a sentence (20..400 characters)');
require_(typeof server.version === 'string' && /^\d+\.\d+\.\d+/.test(server.version),
  'version must be semver');
require_(server.repository?.source === 'github' && typeof server.repository?.url === 'string',
  'repository.url and repository.source are required');
require_(Array.isArray(server.packages) && server.packages.length > 0,
  'packages[] must have at least one entry');

for (const [index, entry] of (server.packages ?? []).entries()) {
  const at = `packages[${index}]`;
  require_(entry.registryType === 'npm', `${at}.registryType must be "npm" for this package`);
  require_(typeof entry.identifier === 'string', `${at}.identifier is required`);
  require_(typeof entry.version === 'string', `${at}.version is required`);
  require_(entry.transport?.type === 'stdio', `${at}.transport.type must be "stdio"`);
  for (const [variableIndex, variable] of (entry.environmentVariables ?? []).entries()) {
    require_(typeof variable.name === 'string' && typeof variable.description === 'string',
      `${at}.environmentVariables[${variableIndex}] needs a name and a description`);
  }
}

for (const [index, remote] of (server.remotes ?? []).entries()) {
  require_(['streamable-http', 'sse'].includes(remote.type),
    `remotes[${index}].type must be "streamable-http" or "sse"`);
  require_(typeof remote.url === 'string' && remote.url.startsWith('https://'),
    `remotes[${index}].url must be https`);
}

// --- agreement with package.json -----------------------------------------
const npmPackage = (server.packages ?? []).find((entry) => entry.registryType === 'npm');
require_(server.version === pkg.version,
  `server.json version ${server.version} != package.json version ${pkg.version}`);
require_(npmPackage?.version === pkg.version,
  `npm package entry version ${npmPackage?.version} != package.json version ${pkg.version}`);
require_(npmPackage?.identifier === pkg.name,
  `npm package identifier ${npmPackage?.identifier} != package.json name ${pkg.name}`);
require_(pkg.mcpName === server.name,
  `package.json mcpName ${pkg.mcpName} != server.json name ${server.name} (the registry uses mcpName to verify ownership)`);

if (problems.length > 0) {
  for (const problem of problems) console.error(`server.json: ${problem}`);
  process.exit(1);
}
console.log(`server.json ok: ${server.name} ${server.version} (${npmPackage.identifier})`);
