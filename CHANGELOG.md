# Changelog

The MCP package (`@niubai/pdfedit-mcp`) is tagged `mcp-vX.Y.Z`; the API is versioned
by date in the `X-API-Version` header.

## 0.1.12 - 2026-10-26
- `GET /source` is gone (404). It existed to make the previous editing engine's
  source available under its licence; the API now runs on an engine with no
  third-party copyleft code in it, so there is nothing that offer applies to.
  The clients, SDKs, agent skill and OpenAPI document in this repository remain
  MIT -- that has not changed, and is now the whole of the licence story.
- API side: text inside an annotation -- a sticky note, a stamp, a form
  widget's own drawing -- is edited only when `scope.layers` asks for
  `"annotations"`. It is not in the default (`["content", "forms"]`) and the
  reference has always said so, but an edit whose text was nowhere on the page
  would fall through to the annotations anyway and report success. If you were
  relying on that, name the layer.
- API side: `op: "form"` on a checkbox or a radio group reports what it did.
  Clearing a checkbox (`false`) and selecting a radio group both wrote the
  document correctly and then returned `readback_failed`, so a caller saw a
  failure over a document that was right.
- API side: replacing a word the document's own font cannot write -- a
  substituted face is brought in for it -- no longer nudges the text BEFORE
  the edit. Up to 1.9pt on a heading, measured; nothing ahead of an edit has
  any reason to move.

## 0.1.11 - 2026-10-21
- The package ships the agent skill as well (`skills/pdfedit/`), which is where the
  skills CLI looks inside an installed package, so an agent without Node's MCP support
  can use the same tools over plain HTTP.
- API side: a Simplified Chinese substitute that matches the document (Noto Serif/Sans
  CJK SC) instead of a Taiwanese Ming face, and Word's faked bold on CJK text is
  reproduced rather than lost, so a replaced name keeps the weight of the text around it.
- API side, same day, from a comparison run over four public documents: a document that
  embeds its fonts as Type1C -- the form Adobe's tools produce, and a whole class of
  files that had been falling back to a substitute face at a slightly different size --
  is now written in the document's own face at the size the line was set in; and a face
  the document embedded without a readable name no longer leaves the output font
  unnamed, which had made the replaced text unidentifiable to other PDF tools.

## 0.1.10 - 2026-10-20
- A local file is uploaded once per session: later calls that name the same unchanged
  path reuse the stored file (an hour, or until the gateway reports it gone), instead of
  uploading it again on every call.
- API side, same day, from the first outside customer's document: a `find` typed from
  the page matches across the space extraction synthesises at a CJK/Latin boundary
  ("2022级" finds "2022 级"); a match that straddles two fonts is rewritten only where
  it changes, so the untouched half keeps its font; a line whose rewritten segment
  comes back in a different extraction order no longer fails verification; an
  inserted-but-unused font no longer bloats the output.

## 0.1.9 - 2026-10-19
- Agent skill `skills/pdfedit` (`npx skills add zp130221/pdfedit-mcp`): the API over
  curl or a stdlib Python script, for agents without Node. The repository is also a
  Claude Code plugin marketplace (`/plugin marketplace add zp130221/pdfedit-mcp`).
- The tool summary spells out `approx_font_used` (a look-alike font was used for the
  changed text; check the preview) instead of passing the bare name through.
- API side, same day: metric twins for Georgia, Segoe UI, Palatino/Book Antiqua,
  Bookman, Century Gothic/Avant Garde, New Century Schoolbook and Arial Narrow; a glyph
  missing from the page's embedded subset is taken from another page's subset of the
  same font; the last-resort face is a Latin look-alike of the same class.

## 0.1.8 - 2026-10-19
- No key needed: the hosted API serves the keyless free tier (20 pages a day per IP,
  outputs watermarked) to the npm server too, local files included.
- Install buttons and docs lead with `npx -y @niubai/pdfedit-mcp`.

## 0.1.7 - 2026-10-18
- The server reports its real package version (generated at build time).

## 0.1.6 - 2026-10-18
- Version read from package.json (broke when bundled; superseded by 0.1.7).

## 0.1.5 - 2026-10-17
- Output files never overwrite: `x.edited.pdf`, then `x.edited.2.pdf`, ...
- npm keywords, badges, trimmed README.

## 0.1.4 - 2026-10-16
- README with absolute links; registry listing.

## 0.1.0 - 2026-10-15
- First release: pdf_edit, pdf_find, pdf_preview, pdf_batch, pdf_job.
