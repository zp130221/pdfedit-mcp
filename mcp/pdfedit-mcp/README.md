# `@niubai/pdfedit-mcp` — edit existing PDFs from your agent

Five MCP tools over the PDF Edit API: **replace, delete, redact, insert and form-fill
text inside a PDF that already exists**, keeping the original font, the original layout
and everything you did not point at. Not "generate a new PDF that looks similar" — the
same file, with the words you named changed, and a before/after picture of every change.

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=pdfedit&config=eyJ1cmwiOiJodHRwczovL3BkZmVkaXQtbWNwLXJlbW90ZS5uaXViYWktcGRmZWRpdC1yZW1vdGUtd29ya2VyLndvcmtlcnMuZGV2L21jcCJ9) [![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MCP_server-0098FF?logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%22pdfedit%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A//pdfedit-mcp-remote.niubai-pdfedit-remote-worker.workers.dev/mcp%22%7D) [![npm](https://img.shields.io/npm/v/@niubai/pdfedit-mcp?label=npm)](https://www.npmjs.com/package/@niubai/pdfedit-mcp) [![MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> With `PDFEDIT_BASE_URL` unset the server talks to the hosted API at
> `https://api.niubai.vip`; set it to point at another deployment.

## Try it in 30 seconds, no key

Without `PDFEDIT_API_KEY` the server runs on the keyless free tier: 20 pages a day
per IP, outputs watermarked `TEST`, local files included.

**Claude Code**

```bash
claude mcp add pdfedit -- npx -y @niubai/pdfedit-mcp
```

**Cursor / VS Code / Claude Desktop** — this server entry (or the buttons on the
[repository page](https://github.com/zp130221/pdfedit-mcp)):

```json
{ "pdfedit": { "command": "npx", "args": ["-y", "@niubai/pdfedit-mcp"] } }
```

Then ask your agent: *"In ./contract.pdf replace 'Acme Ltd' with 'Acme GmbH' and
redact the IBAN."* The edited PDF is written next to the original and a before/after
picture of every change comes back. A free API key (200 pages a month, no watermark on
ordinary documents) takes one email at <https://api.niubai.vip>.

## Install

**Claude Code** — one line:

```bash
claude mcp add pdfedit -e PDFEDIT_API_KEY=sk_live_your_key -- npx -y @niubai/pdfedit-mcp
```

**Cursor** — the deeplink (Settings → MCP also takes the same JSON):

```
cursor://anysphere.cursor-deeplink/mcp/install?name=pdfedit&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBuaXViYWkvcGRmZWRpdC1tY3AiXSwiZW52Ijp7IlBERkVESVRfQVBJX0tFWSI6InNrX2xpdmVfeW91cl9rZXkifX0=
```

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pdfedit": {
      "command": "npx",
      "args": ["-y", "@niubai/pdfedit-mcp"],
      "env": {
        "PDFEDIT_API_KEY": "sk_live_your_key"
      }
    }
  }
}
```

No key? Leave `env` out: the keyless free tier is 20 pages/day per IP, outputs
watermarked `TEST`. Web clients that cannot run a local server (claude.ai) can add the
[hosted endpoint](https://github.com/zp130221/pdfedit-mcp/blob/main/mcp/remote-worker/README.md) instead; it takes PDF URLs only.

### Local files versus URLs

This package runs on your machine, so every tool's `file` argument takes **an absolute
(or `~`) local path** — it uploads the file for you and writes the edited PDF back next
to the input as `<name>.edited.pdf` — or an `https://` URL, or an `f_…` file id from an
earlier call. The hosted Streamable-HTTP endpoint cannot read your disk and says so
(*remote server cannot read local paths; pass a URL*). PDFs never travel as MCP content
blobs either way; only up to three preview PNGs of the changed pages come back inline.

## Tools

| Tool | What it does |
| --- | --- |
| `pdf_edit` | Replace / delete / redact / insert / fill, one call, with previews. |
| `pdf_batch` | The same edits once per record over one template. Returns a job id. |
| `pdf_find` | Every span with page, bbox, font and span id; filter with the four match modes. |
| `pdf_preview` | Render a page (or a region) as a PNG, with optional highlight boxes. |
| `pdf_job` | The result of an async edit or a batch. |

Every schema is generated from the gateway's OpenAPI document, so an `edits[]` entry here
is exactly the one `POST /v1/edit` and the SDKs take — see
[`src/tools.ts`](src/tools.ts).

## What it will refuse, and why

The engine would rather hand back "no" with a reason than a file that looks edited and
is not. Two kinds of refusal.

### Verification gates — the edit was attempted and rolled back

Every change is written, then checked, then kept or undone. A group that fails any gate
is rolled back and reported in `failed[]`:

| Reason | What happened |
| --- | --- |
| `collateral_damage` | Pixels changed outside the rewrite's own area — something else on the page moved. The page is restored byte-for-byte. |
| `readback_failed` | Re-reading the edited rectangle did not return the text that was supposed to be there. |
| `does_not_fit` | The replacement does not fit the space, and `fit` was not allowed to make it worse (`fit: "strict"`), or an insert would have landed on text that is already there. |
| `font_unavailable` | `options.font.policy: "exact_only"` (or `"metric_only"`) and neither the system nor the document has an acceptable face. |
| `redact_residual` | After a redaction the string was still readable in the rect — the removal is refused rather than reported as done. |
| `no_target`, `field_not_editable`, `field_value_invalid`, `field_value_mismatch` | The form field does not exist, is read-only, rejects the value, or did not read back as written. |

With `options.atomic` (the default) any single failure fails the whole request and no
file is produced; `options.strict` does the same for an edit that simply did not match.
An unmatched edit comes back with fuzzy `suggestions` ("did you mean *Acme, Inc.*?")
rather than a silent no-op.

### Known-unsupported — rejected up front as `invalid_request`

What the API refuses before touching the document:

- **Right-to-left text** (Arabic, Hebrew) in `find`. Everything after the matcher is
  left-to-right: lines are assembled left edge first and replacements are laid out
  rightwards, so RTL would be matched against a visually reversed line and written in the
  wrong direction with nothing downstream able to notice.
- **`redact` on text that only exists as scanned pixels.** The word *is* the image;
  covering it leaves it in the file, so the op's promise cannot be kept.
- **`style` together with `fit: "reflow"`.** A reflow re-sets the whole paragraph in the
  document's own face, so the matched phrase no longer has a run of its own to style.
- **`fit: "reflow"` on `redact` or `form`.**
- **`options.preview: "pages"`** (whole-page previews); `"changes"` and `"none"` work.
- **Unknown ops.**

### Known limits — supported, with a caveat worth knowing

- **A raster OCR write produces an image, not text.** Where a scanned line has no
  underlying text to clone, the new words are drawn as pixels: correct on the page,
  verified by re-rendering, but not selectable or searchable afterwards.
- **A redaction on a scan is verified by the text layer and the pixel scrub**, not by
  recognising the output again.
- **Text positioned relatively** — matplotlib writes each tick relative to the previous
  one — can make an unrelated element move hundreds of points away. The engine sees that
  as collateral damage and rolls the change back; the page stays correct, the edit does
  not happen. One corpus file does this on purpose as a regression.
- **Fonts.** A replacement is set in the document's own font where the file embeds enough
  of it (any page's subset of that font counts), in a metric-compatible twin where it
  does not (Arial, Helvetica, Times New Roman, Courier New, Calibri, Cambria, Georgia,
  Segoe UI, Palatino, Book Antiqua, Bookman, Century Gothic, Avant Garde, New Century
  Schoolbook and Arial Narrow all have one: same widths, so the line ends where it did),
  and in a look-alike of the same class as a last resort. The result always says which
  (`font_source`, `font_used`), the summary spells out `approx_font_used` when the last
  resort was taken, and `options.font.policy: "metric_only"` refuses it outright, so "it
  looks slightly different" is a value you can read rather than a surprise.
- **`flatten` on radio groups and comboboxes** depends on the appearance the file carries; where it
  declines, the field is left live and `flatten_skipped` is warned instead of failing.
- **Encrypted documents** need the open password (`password`); edits are not attempted
  without it.

## More

- [Quick start](https://api.niubai.vip/quickstart#agents) — install per client, what to say to the agent, what comes back. The canonical usage doc; this README stays short on purpose.
- [API reference](https://api.niubai.vip/docs) — every field of `edits[]`, `options` and the response.
- [Examples](https://api.niubai.vip/examples) — ten before/after pairs, each with the request that produced it.
- [Repository](https://github.com/zp130221/pdfedit-mcp) — this server, the SDKs and the hosted endpoint's source.

MIT -- this server, the SDKs, the agent skill and the OpenAPI document. The
hosted API itself is a proprietary service.
