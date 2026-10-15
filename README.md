# pdfedit-mcp

The agent-facing half of the PDF Edit API (`https://api.niubai.vip`): edit text
inside PDFs that already exist -- replace, delete, redact, insert, fill forms --
keeping the original fonts and layout, with every change verified before it is
returned.

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=pdfedit&config=eyJ1cmwiOiJodHRwczovL3BkZmVkaXQtbWNwLXJlbW90ZS5uaXViYWktcGRmZWRpdC1yZW1vdGUtd29ya2VyLndvcmtlcnMuZGV2L21jcCJ9) [![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MCP_server-0098FF?logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%22pdfedit%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A//pdfedit-mcp-remote.niubai-pdfedit-remote-worker.workers.dev/mcp%22%7D) [![npm](https://img.shields.io/npm/v/@niubai/pdfedit-mcp?label=npm)](https://www.npmjs.com/package/@niubai/pdfedit-mcp) [![MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Try it in 30 seconds, no key

The hosted endpoint answers anonymous callers on a free tier (20 pages a day per IP,
outputs watermarked `TEST`). Nothing to install:

**Claude Code**

```bash
claude mcp add --transport http pdfedit https://pdfedit-mcp-remote.niubai-pdfedit-remote-worker.workers.dev/mcp
```

**Cursor / VS Code / Claude Desktop (remote server)** — add this server, or use the
buttons above:

```json
{ "pdfedit": { "url": "https://pdfedit-mcp-remote.niubai-pdfedit-remote-worker.workers.dev/mcp" } }
```

Then ask your agent: *"In https://example.com/contract.pdf replace 'Acme Ltd' with
'Acme GmbH' and redact the IBAN."* It returns the edited PDF link and a before/after
picture of every change. A free API key (200 pages a month, no watermark on ordinary
documents) takes one email at <https://api.niubai.vip>.

| What | Where |
|---|---|
| MCP server (`npx -y @niubai/pdfedit-mcp`) for Claude Code, Cursor, Claude Desktop | [`mcp/pdfedit-mcp/`](mcp/pdfedit-mcp/README.md) |
| TypeScript SDK (`@niubai/pdfedit`) | [`sdk/typescript/`](sdk/typescript/README.md) |
| Python SDK | [`sdk/python/`](sdk/python/README.md) |
| OpenAPI document the SDKs and tool schemas are generated from | [`openapi/openapi.json`](openapi/openapi.json) |
| What it does, pricing, ten before/after examples | [`docs/public/`](docs/public/index.md) |

Everything here is MIT. The editing engine behind the API is AGPL-3.0; the API
serves its complete source to its users at `GET /source` (any API key, a free
test key included).
