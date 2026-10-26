# Edit the text inside a PDF that already exists

**One API call changes the words in a PDF and leaves everything else exactly where it
was** — the font the document embeds, the layout, the other 99 % of the page — and tells
you, per change, what it did and how it checked.

Not a PDF generator, not a form filler bolted onto a renderer, and not a viewer that
draws a white box over the old text: the old text is removed from the content stream and
the new text is written in the document's own font. Every change is rendered before and
after, compared pixel by pixel outside its own area, and rolled back if anything else on
the page moved.

```bash
curl -sS https://api.niubai.vip/v1/edit \
  -H "Authorization: Bearer sk_live_your_key" \
  -F file=@contract.pdf \
  -F 'edits=[{"find": "$4,200", "replace": "$4,800"}]' \
  -H 'Accept: application/pdf' -o contract.edited.pdf
```

Also available as [an MCP server](../../mcp/pdfedit-mcp/README.md) (one line in Claude
Code, Cursor or Claude Desktop), a [TypeScript SDK](../../sdk/typescript/README.md) and a
[Python SDK](../../sdk/python/README.md).

> The hosted API is `https://api.niubai.vip`; packages publish under the npm scope
> `@niubai/`. Quick start: <https://api.niubai.vip/quickstart>.

## What it does

| Operation | What it means |
| --- | --- |
| `replace` | Change a phrase. Same font, same position, same line; the untouched spans do not move. |
| `delete` | Remove a phrase, and (with `tidy`) the double space and stranded punctuation it leaves. |
| `redact` | Remove it so it is gone: out of the content stream, pixels under the box scrubbed, metadata/XMP/outlines/attachments swept, and a report of anywhere else in the file the same string still appears. |
| `insert` | Add a line, at a point or hung off existing text, inheriting that text's style. |
| `form` | Fill AcroForm fields by name, with the value read back after reopening the file. Optional `flatten`. |

Across it all: four match modes (exact, case-insensitive, word, linear-time regex), page / region
/ anchor / occurrence scoping, paragraph reflow when the replacement is much longer,
OCR for pages that have no text layer, and batch (one template, one output per record).

## Ten before/after examples

Every pair below was produced by the API itself over a real document — the request
JSON is printed next to each one:

**[→ docs/public/examples](examples/README.md)**

replace · delete · style · redact · insert · form fill · paragraph reflow · a date split
across two fonts · a header shared by three pages · a regex over matplotlib output.

## Pricing

| Plan | Price | Pages included | Notes |
| --- | --- | --- | --- |
| Free | $0 | 200 / month | |
| Try-it pack | $4.90 once | 500 pages, no expiry | No subscription. |
| Starter | $9 / month | 5,000 ($0.0018 / page) | |
| Growth | $29 / month | 25,000 ($0.0012 / page) | May turn the watermark off on flagged documents. |
| Scale | $99 / month | 120,000 ($0.0008 / page) | Same. |
| Credit pack | $12 once | 5,000 pages, no expiry | For bursty use; no subscription. Every plan is prepaid: nothing is billed beyond what you buy. |

Watermarks: an ordinary document is never watermarked on any plan. A document that
looks like an invoice, a contract, a sealed or official paper is marked "Edited" by
default; only Growth and Scale accounts that have accepted the document-integrity terms
may turn that off. A redaction is never watermarked.

- **A page is the unit.** `pages_billed` counts the pages an edit actually changed, not
  the pages in the document.
- **An OCR page counts as five.** Recognising a page costs seconds where editing text
  costs milliseconds. The result shows the arithmetic (`billing.weights`).
- **`dry_run` is free**, and so is anything that failed: a rolled-back edit is not billed.
- Billing runs through Creem as merchant of record; 30-day refunds, cancel any time.

## What it refuses to do

The engine would rather return a reason than a file that looks edited and is not.

**Rolled back after the fact** — the edit was made, checked, and undone:
`collateral_damage` (pixels changed outside the edit's own area), `readback_failed` (the
edited rectangle does not read back as the new text), `does_not_fit`, `font_unavailable`,
`redact_residual` (the string was still readable after the redaction). By default a
single failure fails the whole request and no file is produced.

**Refused up front:**

- Right-to-left scripts (Arabic, Hebrew) in `find` — everything after the matcher is
  left-to-right, so the result would be wrong in a way nothing downstream could detect.
- `redact` on text that exists only as scanned pixels — the word *is* the image.
- `style` together with `fit: "reflow"`; `fit: "reflow"` on `redact` or `form`.
- Whole-page previews (`preview: "pages"`).

**Supported, with a caveat:**

- Where a scanned line has no text underneath, the replacement is drawn as pixels: it
  looks right and is verified by re-rendering, but it is not selectable or searchable.
- Text positioned relatively (matplotlib writes each tick relative to the previous one)
  can make an unrelated element move hundreds of points away; the engine sees that as
  damage and rolls the edit back rather than wrecking the page.
- Fonts: the document's own face where it embeds enough of it, a metric-compatible twin
  where it does not, an approximation as a last resort — and the result always says
  which, so a slight difference is a value you can read rather than a surprise.
- Encrypted documents need their open password.

The long version, with the measurements behind each number, is in the engine closeouts:
[plan 1](../superpowers/plans/2026-10-12-pdf-edit-engine-plan1.md#closeout-2026-10-13),
[plan 2](../superpowers/plans/2026-10-13-pdf-edit-engine-plan2.md#closeout-2026-10-14).

## Documents, and what happens to them

Inputs and outputs live 24 hours and are then deleted, with an object-store lifecycle
rule as the backstop; `options.retain: false` deletes them as soon as the response is
sent, and `DELETE /v1/files/{id}` does it on demand. Nothing is used to train anything.
Editing a document you are not entitled to edit is forbidden by the terms, and documents
that look like sealed or official papers are watermarked by default.

## Start

- **MCP**: `claude mcp add pdfedit -e PDFEDIT_API_KEY=... pdfedit -- npx -y @niubai/pdfedit-mcp`
  → [full install notes](../../mcp/pdfedit-mcp/README.md)
- **HTTP**: the OpenAPI document is [`openapi/openapi.json`](../../openapi/openapi.json).
- **SDKs**: [TypeScript](../../sdk/typescript/README.md) ·
  [Python](../../sdk/python/README.md)
- **License**: the clients, the SDKs, the agent skill and the OpenAPI document
  are MIT. The hosted API itself is a proprietary service.
