# Changelog

The MCP package (`@niubai/pdfedit-mcp`) is tagged `mcp-vX.Y.Z`; the API is versioned
by date in the `X-API-Version` header.

## 0.1.9 - 2026-10-19
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
