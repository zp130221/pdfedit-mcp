# Changelog

The MCP package (`@niubai/pdfedit-mcp`) is tagged `mcp-vX.Y.Z`; the API is versioned
by date in the `X-API-Version` header.

## 0.1.11 - 2026-10-21
- The package ships the agent skill as well (`skills/pdfedit/`), which is where the
  skills CLI looks inside an installed package, so an agent without Node's MCP support
  can use the same tools over plain HTTP.
- API side: a Simplified Chinese substitute that matches the document (Noto Serif/Sans
  CJK SC) instead of a Taiwanese Ming face, and Word's faked bold on CJK text is
  reproduced rather than lost, so a replaced name keeps the weight of the text around it.

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
