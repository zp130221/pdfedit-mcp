# PDF Edit API reference for the skill

Base URL `https://api.niubai.vip`. Every request may carry `Authorization: Bearer sk_live_…`; without it the keyless tier applies (20 pages a day per client IP, UTC day, outputs marked SAMPLE). Interactive docs: https://api.niubai.vip/docs. Quick start: https://api.niubai.vip/quickstart.

## Endpoints

| Method and path | Purpose |
|---|---|
| `POST /v1/files` | Reserve an upload: body `{"content_type": "application/pdf", "bytes": N}` → `{"file_id", "upload_url", "headers"}`. Then `PUT` the bytes to `upload_url` with those headers. |
| `POST /v1/edit` | JSON `{"source": {"url" or "file_id"}, "edits": [...], "options": {...}}`, or multipart with fields `file`, `edits` (JSON text), `options` (JSON text). `Accept: application/pdf` returns the edited file directly. Large files answer `202 {"job_id"}`. |
| `GET /v1/jobs/{job_id}` | Job state: `queued`, `running`, `done`, `partial`, `failed`, then the same result fields as `/v1/edit`. |
| `POST /v1/text` | Spans of the document: `{"source", "query"?, "match"?, "pages"?, "limit"?, "cursor"?}` → `{"page_count", "spans": [{span_id, page, text, font, size, bbox, ...}], "fields"}`. Free: not billed. |
| `POST /v1/preview` | `{"source", "page", "scale", "region"?, "highlight"?}` → PNG (with `Accept: image/png`) or JSON with a URL. |
| `POST /v1/batch` | The same edits once per record over one template: `{"source", "edits", "records": [{...}]}` → job id; `GET /v1/jobs/{id}` returns `records[]` with one output each. |
| `GET /v1/files/{file_id}/content?token=…` | Download an output; `output.url` in a result is this link, valid 24 hours. |
| `GET /v1/usage` | Pages used and remaining this period. |
| `GET /v1/fonts` | Fonts `style.font` may name. |
| `POST /v1/feedback` | `{"rating": 1-5, "message", "request_id"?, "email"?}` → `202 {"received": true}`. No key needed; the owner reads every message. |

## Edit object

| Field | Values | Notes |
|---|---|---|
| `op` | `replace` (default), `delete`, `redact`, `insert`, `form` | |
| `find` | string | Text to match (replace, delete, redact). |
| `replace` | string | New text (replace). |
| `text` | string | Text to write (insert). |
| `at` | `{"page": N, "after": "anchor"}` or `{"page": N, "x": pt, "y": pt}` | Where to insert; `placement`: `inline` (default) or `below`; `units`: `pt` or `fraction`. `y` is measured from the top edge. |
| `fields` | `{"name": "value", "checkbox": true}` | Form values (form). `flatten: true` burns them in. |
| `match` | `{"mode": "exact" \| "icase" \| "word" \| "regex", "across_lines": false, "normalize": true}` | |
| `scope` | `{"pages": [1,2] \| "all", "occurrence": "all" \| "first" \| "last" \| N, "after": "text", "before": "text", "span_ids": [...], "region": {"x0","y0","x1","y1","units"}, "page_labels": [...]}` | Narrow where the match applies. |
| `fit` | `auto` (default), `reflow`, `strict` | What to do when the replacement is longer than the original. |
| `style` | `{"color": "#rrggbb", "size": pt, "font": "name"}` | Restyle the replacement; names from `/v1/fonts`. |

## Request options

| Option | Default | Meaning |
|---|---|---|
| `dry_run` | false | Compute and verify, return the result, write nothing, bill nothing. |
| `atomic` | true | One failing edit rolls back the whole request. `false` keeps the edits that worked. |
| `preview` | `changes` | `changes` (PNG per change), `none`. |
| `ocr` | `auto` | `auto`, `on`, `off` for scanned pages. OCR pages count as five. |
| `font.policy` | `auto` | `metric_only` refuses an approximate font; `exact_only` refuses any substitute. |
| `tidy` | true | Collapse the spacing and punctuation a delete leaves behind. |
| `redact_metadata` | false | Also sweep document metadata, outlines and attachments for the redacted string. |
| `redact_style` | `box` | `box` or `text` placeholder. |
| `collateral_threshold` | 8 | Pixels outside the edit that may differ before a change is rolled back. |
| `watermark` | `auto` | Flagged documents (statements, IDs, signed contracts) are marked on the free tiers; Growth and Scale may set `off`. |
| `async` | false | Always return a job id; pair with `webhook_url` to be called when done. |
| `strict` | false | Reject unknown fields instead of ignoring them. |

## Result fields

- `status`: `done`, `partial`, `failed`; `job_id`.
- `changes[]`: `edit` (index), `op`, `page`, `page_label`, `before`, `after`, `context`, `bbox`, `span_ids`, `font_source` (`exact-embedded`, `exact-system`, `metric-compatible`, `approx`, `styled`, `redacted`, `form`), `font_used`, `fit`, `collateral_pixels`, `verified`, `notes`, `preview_url`, `is_ocr`, `ocr_confidence`.
- `unmatched[]`: `edit`, `reason`, `hint`, `suggestions[{text, page, span_id}]`.
- `failed[]`: `edit`, `reason`, `hint`, `page`, `collateral_pixels`.
- `warnings[]`: `approx_font_used`, `style_merged`, `financial_document`, `sealed_document`, `subset_fonts_failed`, `preview_capped`, `flatten_skipped`, `redacted_text_in_<place>`.
- `output`: `file_id`, `url`, `bytes`, `pages`, `expires_at`.
- `usage`: `pages_billed`, `remaining`, `weights`.

## Error envelope

`{"error": {"code", "message", "hint"}}`, with the `X-Request-Id` header to quote to support.

| code | HTTP | Meaning |
|---|---|---|
| `invalid_request` | 400 | Malformed body, an edit impossible as written, or an `Idempotency-Key` reused with a different body. |
| `unauthorized` | 401 | Unknown or revoked key. |
| `quota_exceeded` | 402 | Daily pages (keyless) or the month's allowance and packs (keyed) are used up; the hint says where to get more. |
| `forbidden_watermark_off` | 403 | `options.watermark: "off"` on a flagged document needs a plan that allows it. |
| `not_found` | 404 | No such file, job or route for this account; outputs expire after 24 hours. |
| `conflict` | 409 | A request with this `Idempotency-Key` is still running; wait and re-poll. |
| `too_large` | 413 | Over the plan's size or page limit. |
| `document_encrypted` | 422 | Needs `source.password`. |
| `document_unsupported` | 422 | Not a PDF the engine can open (damaged, a portfolio, a non-PDF). |
| `signed_document` | 422 | Digitally signed; pass `options.break_signature: true` to edit an unsigned copy. |
| `edit_failed` | 422 | Every edit was rolled back or unmatched; `failed[]` and `unmatched[]` say why. |
| `rate_limited` | 429 | Over the requests-per-minute limit or the service is busy; honour `Retry-After`. |
| `engine_error` | 500 | The engine crashed on this document; retry once, then report the `X-Request-Id`. |
| `upstream_error` | 502 | `source.url` could not be fetched. |
| `engine_timeout` | 504 | The synchronous run took too long; send it again with `options.async: true`. |

Retries: send an `Idempotency-Key` header on `/v1/edit` and `/v1/batch`; the same key returns the first result instead of charging twice.
