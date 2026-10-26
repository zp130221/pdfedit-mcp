# pdfedit-mcp

The agent-facing half of the PDF Edit API (`https://api.niubai.vip`): edit text
inside PDFs that already exist -- replace, delete, redact, insert, fill forms --
keeping the original fonts and layout, with every change verified before it is
returned.

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=pdfedit&config=eyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJAbml1YmFpL3BkZmVkaXQtbWNwIl19) [![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MCP_server-0098FF?logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%20%22pdfedit%22%2C%20%22type%22%3A%20%22stdio%22%2C%20%22command%22%3A%20%22npx%22%2C%20%22args%22%3A%20%5B%22-y%22%2C%20%22%40niubai/pdfedit-mcp%22%5D%7D) [![npm](https://img.shields.io/npm/v/@niubai/pdfedit-mcp?label=npm)](https://www.npmjs.com/package/@niubai/pdfedit-mcp) [![MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![M8ven Score](https://m8ven.ai/badge/mcp/zp130221-pdfedit-mcp-n6x8sw?v=d3b363c2c55d41b01d968275c0c8fab4)](https://m8ven.ai/mcp/zp130221-pdfedit-mcp-n6x8sw?s=readme)

## Try it in 30 seconds, no key

The server works with no key at all: 20 pages a day per IP, outputs marked
`SAMPLE`, local files included. Nothing to sign up for:

**Claude Code**

```bash
claude mcp add pdfedit -- npx -y @niubai/pdfedit-mcp
```

**Cursor / VS Code / Claude Desktop** — the buttons above, or this server entry:

```json
{ "pdfedit": { "command": "npx", "args": ["-y", "@niubai/pdfedit-mcp"] } }
```

Then ask your agent: *"In ./contract.pdf replace 'Acme Ltd' with 'Acme GmbH' and
redact the IBAN."* The edited PDF is written next to the original and a before/after
picture of every change comes back. A free API key (200 pages a month, no watermark on
ordinary documents) takes one email at <https://api.niubai.vip>; set it as
`PDFEDIT_API_KEY`. Web clients that cannot run a local server (claude.ai) use the hosted
endpoint `https://pdfedit-mcp-remote.niubai-pdfedit-remote-worker.workers.dev/mcp` with PDF URLs.

## No Node? Install the skill

The same API as an [Agent Skill](skills/pdfedit/SKILL.md): a SKILL.md plus a
stdlib-only Python script, for Claude Code, Codex, Cursor, Gemini CLI and any other
agent that runs shell commands. Nothing to install but the skill itself:

```bash
npx skills add zp130221/pdfedit-mcp
```

Claude Code can also take the whole thing as a plugin, MCP server and skill together:

```text
/plugin marketplace add zp130221/pdfedit-mcp
/plugin install pdfedit@pdfedit
```

| What | Where |
|---|---|
| The whole API in one file, for an AI assistant (give it to a model and it knows how to call the API) | [api.niubai.vip/llms-full.txt](https://api.niubai.vip/llms-full.txt) |
| MCP server (`npx -y @niubai/pdfedit-mcp`) for Claude Code, Cursor, Claude Desktop | [`mcp/pdfedit-mcp/`](mcp/pdfedit-mcp/README.md) |
| Agent skill (`npx skills add zp130221/pdfedit-mcp`), no Node needed | [`skills/pdfedit/`](skills/pdfedit/SKILL.md) |
| TypeScript SDK (`@niubai/pdfedit`) | [`sdk/typescript/`](sdk/typescript/README.md) |
| Python SDK | [`sdk/python/`](sdk/python/README.md) |
| OpenAPI document the SDKs and tool schemas are generated from | [`openapi/openapi.json`](openapi/openapi.json) |
| What it does, pricing, ten before/after examples | [`docs/public/`](docs/public/index.md) |

Everything here is MIT. The hosted API itself is a proprietary service.

The API is operated by Niubai (<https://niubai.vip>), support
<zp130221@163.com>; payments are collected by [Creem](https://www.creem.io) as
merchant of record, so card details never reach the service and the cancel link
is on the receipt. Terms, privacy and refunds:
<https://api.niubai.vip/legal>. Documents are deleted within 24 hours and are
never used for training.
