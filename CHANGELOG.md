# Changelog

The MCP package (`@niubai/pdfedit-mcp`) is tagged `mcp-vX.Y.Z`; the API is versioned
by date in the `X-API-Version` header.

## 0.1.13 - 2026-10-27
- **`op: "stamp"`: place an image on a page.** A signature, a chop, a logo:
  `image` (base64 PNG, JPEG, GIF, BMP or WebP; a `data:` URL is accepted) is
  fitted into `box{page, x, y, w, h}` -- points from the page's top-left, the
  same frame every bbox this API reports is in -- keeping its proportion and
  centred. A PNG keeps its transparency (a signature on a transparent field
  stays one; nothing under it is painted over); a JPEG is stored as sent. It
  is an edit like any other: the page outside the box is proved unchanged,
  `atomic` rolls it back, it is billed by its page and previewed, and
  `pdf_edit` takes it through `edits[]`.
- **`POST /v1/pages`: rotate, delete, extract and append pages.** An ordered
  list of operations on one document -- `rotate` (90/180/270, added to the
  page's own), `delete`, `extract` (a new document from the pages named, in
  the order named), `append` (another document's pages at the end, by
  `file_id` or `url`) -- applied all or nothing; a refused op is named by its
  index and nothing is written. Every page not named is the page it was,
  byte for byte. Not billed. The SDKs carry the request and response types;
  there is no MCP tool for it yet.

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
- API side: a radio group can be set to a named option. `/v1/text` with
  `layers: ["forms"]` lists each button's `options`; sending one of those
  names back used to clear the group and report success, so the only way to
  answer a three-way question was to accept whichever option happened to be
  first. A value that is neither an option nor a yes or no is now refused
  (`field_not_editable`, with the options listed) rather than taken as "no".
- **A redaction now answers for itself.** The response carries a
  `redaction` block on every edit (null unless something was redacted):
  `found_in` lists the redacted strings that can still be found anywhere in
  the document and `places` says where -- the page text, the document
  information dictionary, the XMP packet, a bookmark title.
  `metadata_scrubbed` and `metadata_places` say what `redact_metadata`
  actually swept. The block was computed and then dropped before it reached
  anyone, `found_in` only ever looked at the page text (so a name redacted
  off page 1 that was also the document's title reported nothing to
  report), and `metadata_scrubbed` was always false however much it swept.
  Also fixed: `redact_metadata` was deleting document-information entries
  that had nothing to do with the redacted string -- keywords, subject,
  author on some documents.
- A `file_id` that nothing has been uploaded to now says so. `POST /v1/files`
  reserves an id and answers with an `upload_url`; using the id before the
  `PUT` reported "File not found", which pointed at the id -- the one thing
  that was right. Same `not_found` code, with the remedy in the message and
  the hint.
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
