# pdfedit-mcp

The agent-facing half of the PDF Edit API (`https://api.niubai.vip`): edit text
inside PDFs that already exist -- replace, delete, redact, insert, fill forms --
keeping the original fonts and layout, with every change verified before it is
returned.

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
