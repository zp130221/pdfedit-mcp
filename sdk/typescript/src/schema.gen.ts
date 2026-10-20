/**
 * DO NOT EDIT -- generated from openapi/openapi.json by openapi-typescript.
 * Regenerate with `npm run gen`; `npm test` fails when this file is stale.
 */
export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health check
         * @description `{"status": "ok"}` when the API and its database answer. No key needed.
         */
        get: operations["healthz_healthz_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/source": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download the engine's source (AGPL-3.0)
         * @description The complete source of the editing engine this API runs, as a tar.gz, offered under the GNU AGPL-3.0 to the API's users: send your API key (a free `sk_test_` key is enough; the hosted MCP endpoint relays this for its keyless tier). This is the licence's network-use source offer; the gateway (keys, billing, storage) is a separate program and is not included.
         */
        get: operations["get_source_source_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run the same edits over many records
         * @description One template document, one set of edits with `{placeholders}`, many records (inline or from `records_url`): one output document per record, as a job. Answers `202` with a `job_id`; `GET /v1/jobs/{job_id}` returns one entry per record once it is done, or set `options.webhook_url`.
         */
        post: operations["post_batch_v1_batch_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/billing/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a checkout link
         * @description A merchant-of-record checkout URL for a subscription plan or a credit pack, bound to the calling key's account. Open it in a browser; payment applies to the account through the webhook within a minute. The account page offers the same links without an API call.
         */
        post: operations["checkout_v1_billing_checkout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/billing/webhook/creem": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Merchant webhook (called by Creem)
         * @description Receives payment, subscription, refund and dispute events from Creem, verifies the `creem-signature` HMAC and applies them to the account. Not for clients: deliveries without a valid signature are refused.
         */
        post: operations["creem_webhook_v1_billing_webhook_creem_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/edit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Edit a PDF
         * @description Apply one or more edits (replace, delete, redact, insert, form fill) to a document and get the edited PDF back with every change verified. Send the document as a multipart upload (`file`) with `edits` as a JSON string, or as JSON with `source.url` or a `source.file_id` from an earlier upload. Small documents answer `200` with the result at once; larger ones (over the plan's sync page limit) and any request with `options.async` true answer `202` with a `job_id` to poll at `GET /v1/jobs/{job_id}` (or set `options.webhook_url` to be called when it finishes). Add `Accept: application/pdf` to receive the edited file itself instead of JSON. Each entry in `changes` says which font was written (`font_source`, `font_used`), whether the pixel check passed (`verified`, `collateral_pixels`) and links a before/after preview; `unmatched` and `failed` list what did not happen and why.
         */
        post: operations["post_edit_v1_edit_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rate the API or report a problem
         * @description `{"rating": 1-5, "message": "what you tried and what happened", "request_id": "the X-Request-Id of the call", "email": "optional"}`: a rating, a message, or both. No key needed. The owner reads every message; an edit that fails on a real document is treated as a bug and is usually fixed within days. Answers `202 {"received": true}`.
         */
        post: operations["feedback_v1_feedback_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reserve an upload
         * @description For documents you would rather not send inline: returns a `file_id` and a presigned `upload_url`. `PUT` the bytes there with the given `headers`, then pass `source.file_id` to `/v1/edit`. Uploads expire with the retention window.
         */
        post: operations["create_file_v1_files_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/files/{file_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete a file
         * @description Remove an uploaded or produced document before its 24-hour retention ends, together with the outputs and previews derived from it. Owner only.
         */
        delete: operations["delete_file_v1_files__file_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/files/{file_id}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download a file
         * @description The bytes of an output, preview or uploaded document. The URL comes signed (`token`) from a response; no API key is needed and the link expires.
         */
        get: operations["get_file_content_v1_files__file_id__content_get"];
        /**
         * Upload the file's bytes
         * @description The second step of `POST /v1/files`: `PUT` the document to the presigned URL with the headers it returned. `204` when stored.
         */
        put: operations["put_file_content_v1_files__file_id__content_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/fonts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List fonts
         * @description The fonts this deployment can write with by name, for `style.font` and for reading `font_used` in a change. The document's own embedded fonts are always preferred when they carry the needed glyphs.
         */
        get: operations["get_fonts_v1_fonts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List jobs
         * @description The account's jobs, newest first, with status, kind, timings, pages billed and the number of changes. Filter with `since` and `status`; page with `cursor` and `limit`. Kept 30 days.
         */
        get: operations["list_jobs_v1_jobs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a job
         * @description The state of an async edit or batch. While it runs: `status` and `progress`. When it is done: the same body a synchronous edit returns (`changes`, `output`, `warnings`, `usage`), and `records` for a batch. Output links are valid for 24 hours.
         */
        get: operations["get_job_v1_jobs__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/limits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the plan's limits
         * @description What the calling key may do: monthly pages, concurrency, requests per minute, file and page size limits, whether `watermark: off` is allowed.
         */
        get: operations["get_limits_v1_limits_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Render a page as a PNG
         * @description A PNG of one page (or a region of it), optionally with highlight boxes, to look before editing or to show a person what changed. At most 200 KB. Free.
         */
        post: operations["post_preview_v1_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/text": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Read the text of a PDF
         * @description Every text span with its page, box, font and `span_id`, plus form fields, for the whole document or a page range. Use it to find what to edit and to scope an edit to one exact span (`scope.span_ids`). Free: reading does not bill pages.
         */
        post: operations["post_text_v1_text_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get this period's usage
         * @description Pages used, the allowance, credit-pack pages and what remains for the current period of the calling key's account. The same numbers the account page shows.
         */
        get: operations["get_usage_v1_usage_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AccountUsageOut */
        AccountUsageOut: {
            /**
             * Credit Pages
             * @description Credit-pack pages left; spent before the allowance, never expire.
             */
            credit_pages: number;
            /**
             * Mode
             * @description `live` or `test`.
             */
            mode: string;
            /**
             * Overage Pages
             * @description Recorded for information; never invoiced.
             */
            overage_pages: number;
            /** Pages Allowance */
            pages_allowance: number;
            /** Pages Remaining */
            pages_remaining: number;
            /** Pages Used */
            pages_used: number;
            /**
             * Period
             * @description `yyyy-mm` for live keys, `yyyy-mm-dd` for test keys.
             */
            period: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * AtModel
         * @description Where an `insert` writes: a point, or a piece of text to hang off.
         *
         *     The point is the BASELINE ORIGIN of the first line written -- where the bottom left
         *     of the first glyph sits, not the top left of a text box. That is how every
         *     coordinate in this engine is expressed (a span's `origin`, `/v1/text`'s span
         *     geometry), so the x/y of a span read out of a document can be used here unchanged;
         *     and it is the one of the two that does not move when `fit` shrinks the size.
         */
        AtModel: {
            /**
             * After
             * @description Anchor text to insert after; the first occurrence on the page wins, and the style is inherited from it.
             */
            after?: string | null;
            /** Page */
            page: number;
            /**
             * Placement
             * @description With `after`: 'inline' writes one space past the anchor's right edge on its own baseline; 'below' writes at the anchor line's left edge, one leading down.
             * @default inline
             * @enum {string}
             */
            placement?: "inline" | "below";
            /**
             * Units
             * @default pt
             * @enum {string}
             */
            units?: "pt" | "fraction";
            /**
             * X
             * @description Baseline origin x. Points from the page's left edge, or a fraction of the page width when units='fraction'.
             */
            x?: number | null;
            /**
             * Y
             * @description Baseline origin y: where the first line sits, measured from the page's TOP edge (PDF viewer convention, as every bbox and span origin in this API). A fraction of the page height when units='fraction'.
             */
            y?: number | null;
        };
        /**
         * BatchOptions
         * @description ``/edit``'s options plus the three only a batch has (spec §6).
         *
         *     Like the rest of ``GatewayOptions`` these never reach the engine, so
         *     their names are in ``runner.GATEWAY_ONLY_OPTIONS`` too.
         */
        BatchOptions: {
            /**
             * Async
             * @default false
             */
            async?: boolean;
            /**
             * Atomic
             * @default true
             */
            atomic?: boolean;
            /**
             * Break Signature
             * @default false
             */
            break_signature?: boolean;
            /**
             * Collateral Threshold
             * @default 8
             */
            collateral_threshold?: number;
            /**
             * Dry Run
             * @default false
             */
            dry_run?: boolean;
            /**
             * Fail Fast
             * @default false
             */
            fail_fast?: boolean;
            /** Filename */
            filename?: string | null;
            font?: components["schemas"]["FontOptions"];
            /**
             * Ocr
             * @default auto
             * @enum {string}
             */
            ocr?: "auto" | "on" | "off";
            /** Ocr Lang */
            ocr_lang?: ("zh" | "en")[];
            /**
             * Output
             * @default files
             * @enum {string}
             */
            output?: "zip" | "files";
            /**
             * Preview
             * @default changes
             * @enum {string}
             */
            preview?: "changes" | "pages" | "none";
            /**
             * Redact Metadata
             * @default false
             */
            redact_metadata?: boolean;
            /**
             * Redact Style
             * @default box
             * @enum {string}
             */
            redact_style?: "box" | "text";
            /**
             * Redact Verify Ocr
             * @default true
             */
            redact_verify_ocr?: boolean;
            /**
             * Retain
             * @default true
             */
            retain?: boolean;
            /**
             * Strict
             * @default false
             */
            strict?: boolean;
            /**
             * Tidy
             * @default true
             */
            tidy?: boolean;
            /**
             * Watermark
             * @default auto
             * @enum {string}
             */
            watermark?: "auto" | "on" | "off";
            /**
             * Webhook Url
             * @description Called with POST when the job finishes: the body is the job's result (what GET /v1/jobs/{id} returns) plus `event` (job.done, job.failed, batch.done ...) and `job_id`, signed in `X-Signature` (hex HMAC-SHA256 of the raw body with the account's webhook secret). Non-2xx answers are retried after 1, 5 and 30 minutes. https only.
             */
            webhook_url?: string | null;
        };
        /**
         * BatchRecordOut
         * @description One record of a batch, as ``GET /v1/jobs/{id}`` reports it (spec §6).
         */
        BatchRecordOut: {
            /**
             * Changes Count
             * @default 0
             */
            changes_count?: number;
            /** Error */
            error?: string | null;
            /** Index */
            index: number;
            output?: components["schemas"]["OutputOut"] | null;
            /** Status */
            status: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * BatchRequest
         * @description ``POST /v1/batch``'s JSON body (spec §6).
         *
         *     ``records`` inline xor ``records_url`` (a CSV or JSONL file fetched with
         *     the same SSRF rules as ``source.url``). The per-record count limit is
         *     ``limits.batch_max_records``, which the route applies -- it depends on
         *     the caller's plan, so it cannot be a model constraint.
         */
        BatchRequest: {
            /** Edits */
            edits: components["schemas"]["EditModel"][];
            options?: components["schemas"]["BatchOptions"];
            /** Records */
            records?: {
                [key: string]: unknown;
            }[] | null;
            /** Records Url */
            records_url?: string | null;
            source: components["schemas"]["SourceModel"];
        };
        /**
         * ChangeOut
         * @description One verified change: ``Change.to_dict()`` plus ``preview_url``.
         *
         *     ``preview_url`` is null when the change has no preview -- ``preview:
         *     "none"``, or the per-response cap (``settings.preview_cap``) was reached,
         *     in which case ``warnings`` carries ``preview_capped``.
         */
        ChangeOut: {
            /**
             * After
             * @default
             */
            after?: string;
            /** Bbox */
            bbox?: number[];
            /**
             * Before
             * @default
             */
            before?: string;
            /**
             * Collateral Pixels
             * @default 0
             */
            collateral_pixels?: number;
            /**
             * Context
             * @default
             */
            context?: string;
            /** Edit */
            edit: number;
            /** Fit */
            fit?: {
                [key: string]: unknown;
            } | null;
            /**
             * Font Source
             * @default
             */
            font_source?: string;
            /**
             * Font Used
             * @default
             */
            font_used?: string;
            /**
             * Is Ocr
             * @default false
             */
            is_ocr?: boolean;
            /** Notes */
            notes?: string[];
            /** Ocr Confidence */
            ocr_confidence?: number | null;
            /** Op */
            op: string;
            /** Page */
            page: number;
            /** Page Label */
            page_label?: string | null;
            /** Preview Url */
            preview_url?: string | null;
            /** Span Ids */
            span_ids?: string[];
            /**
             * Verified
             * @default true
             */
            verified?: boolean;
        } & {
            [key: string]: unknown;
        };
        /** CheckoutOut */
        CheckoutOut: {
            /** Item */
            item: string;
            /**
             * Kind
             * @description `plan` or `pack`.
             */
            kind: string;
            /**
             * Url
             * @description Open in a browser to pay.
             */
            url: string;
        };
        /** CheckoutRequest */
        CheckoutRequest: {
            /**
             * Pack
             * @description pack_500 | pack_5k
             */
            pack?: string | null;
            /**
             * Plan
             * @description starter | growth | scale
             */
            plan?: string | null;
        };
        /** EditModel */
        EditModel: {
            at?: components["schemas"]["AtModel"] | null;
            /** Fields */
            fields?: {
                [key: string]: unknown;
            } | null;
            /** Find */
            find?: string | null;
            /**
             * Fit
             * @default auto
             * @enum {string}
             */
            fit?: "auto" | "reflow" | "strict";
            /**
             * Flatten
             * @default false
             */
            flatten?: boolean;
            match?: components["schemas"]["MatchModel"];
            /**
             * Op
             * @default replace
             * @enum {string}
             */
            op?: "replace" | "delete" | "redact" | "insert" | "form";
            /** Replace */
            replace?: string | null;
            scope?: components["schemas"]["ScopeModel"];
            style?: components["schemas"]["StyleModel"] | null;
            /** Text */
            text?: string | null;
        };
        /**
         * EditRequest
         * @description ``POST /v1/edit``'s JSON body (spec §5.1).
         */
        EditRequest: {
            /** Edits */
            edits: components["schemas"]["EditModel"][];
            options?: components["schemas"]["GatewayOptions"];
            source: components["schemas"]["SourceModel"];
        };
        /**
         * EditResponse
         * @description A sync edit's body: 200 for done/partial, 422 for failed.
         *
         *     A failed edit keeps all three lists (the spec requires them for
         *     debugging) and additionally carries the ``error`` envelope.
         */
        EditResponse: {
            /** Changes */
            changes?: components["schemas"]["ChangeOut"][];
            /** Error */
            error?: {
                [key: string]: unknown;
            } | null;
            /** Failed */
            failed?: components["schemas"]["FailedOut"][];
            /** Job Id */
            job_id: string;
            output?: components["schemas"]["OutputOut"] | null;
            /** Status */
            status: string;
            /** Unmatched */
            unmatched?: components["schemas"]["UnmatchedOut"][];
            usage?: components["schemas"]["UsageOut"];
            /** Warnings */
            warnings?: string[];
        } & {
            [key: string]: unknown;
        };
        /**
         * ErrorOut
         * @description The error envelope (``errors.envelope``), for the OpenAPI schema.
         */
        ErrorOut: {
            /** Error */
            error: {
                [key: string]: unknown;
            };
        };
        /**
         * FailedOut
         * @description An edit the engine applied and then rolled back (``Failed.to_dict()``).
         *
         *     Carries the reason's own structured detail flattened in alongside these
         *     fields -- hence ``extra="allow"``.
         */
        FailedOut: {
            /** Collateral Pixels */
            collateral_pixels?: number | null;
            /** Edit */
            edit: number;
            /**
             * Hint
             * @default
             */
            hint?: string;
            /** Page */
            page?: number | null;
            /** Reason */
            reason: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * FieldOut
         * @description One form widget, as ``/v1/text`` lists them with ``layers: ["forms"]``.
         */
        FieldOut: {
            /** Bbox */
            bbox?: number[];
            /** Name */
            name?: string | null;
            /** Options */
            options?: unknown[] | null;
            /**
             * Page
             * @default 1
             */
            page?: number;
            /**
             * Readonly
             * @default false
             */
            readonly?: boolean;
            /**
             * Type
             * @default
             */
            type?: string;
            /** Value */
            value?: string | null;
            /**
             * Xref
             * @default 0
             */
            xref?: number;
        } & {
            [key: string]: unknown;
        };
        /** FileCreateOut */
        FileCreateOut: {
            /**
             * Expires At
             * @description ISO 8601; the upload slot and the file expire then.
             */
            expires_at?: string | null;
            /**
             * File Id
             * @description Pass as `source.file_id` once the bytes are uploaded.
             */
            file_id: string;
            /**
             * Headers
             * @description Headers the PUT must carry.
             */
            headers?: {
                [key: string]: unknown;
            };
            /**
             * Upload Url
             * @description PUT the document here.
             */
            upload_url: string;
        };
        /** FontOptions */
        FontOptions: {
            /**
             * Policy
             * @default auto
             * @enum {string}
             */
            policy?: "auto" | "metric_only" | "exact_only";
        };
        /**
         * FontOut
         * @description One font family ``style.font`` can name (``fonts.list_fonts``).
         */
        FontOut: {
            /**
             * Family
             * @default
             */
            family?: string;
            /** Name */
            name: string;
            /** Scripts */
            scripts?: string[];
            /**
             * Source
             * @default
             */
            source?: string;
            /** Styles */
            styles?: string[];
        } & {
            [key: string]: unknown;
        };
        /**
         * FontsResponse
         * @description ``GET /v1/fonts``: the families ``style.font`` can name here.
         */
        FontsResponse: {
            /** Fonts */
            fonts?: components["schemas"]["FontOut"][];
        } & {
            [key: string]: unknown;
        };
        /**
         * GatewayOptions
         * @description The engine's options plus the ones the gateway itself implements.
         *
         *     ``async`` is a Python keyword, so the field is ``async_`` with ``async``
         *     as its alias; ``populate_by_name`` keeps internal construction
         *     (``GatewayOptions(async_=True)``) working alongside the wire name.
         */
        GatewayOptions: {
            /**
             * Async
             * @default false
             */
            async?: boolean;
            /**
             * Atomic
             * @default true
             */
            atomic?: boolean;
            /**
             * Break Signature
             * @default false
             */
            break_signature?: boolean;
            /**
             * Collateral Threshold
             * @default 8
             */
            collateral_threshold?: number;
            /**
             * Dry Run
             * @default false
             */
            dry_run?: boolean;
            font?: components["schemas"]["FontOptions"];
            /**
             * Ocr
             * @default auto
             * @enum {string}
             */
            ocr?: "auto" | "on" | "off";
            /** Ocr Lang */
            ocr_lang?: ("zh" | "en")[];
            /**
             * Preview
             * @default changes
             * @enum {string}
             */
            preview?: "changes" | "pages" | "none";
            /**
             * Redact Metadata
             * @default false
             */
            redact_metadata?: boolean;
            /**
             * Redact Style
             * @default box
             * @enum {string}
             */
            redact_style?: "box" | "text";
            /**
             * Redact Verify Ocr
             * @default true
             */
            redact_verify_ocr?: boolean;
            /**
             * Retain
             * @default true
             */
            retain?: boolean;
            /**
             * Strict
             * @default false
             */
            strict?: boolean;
            /**
             * Tidy
             * @default true
             */
            tidy?: boolean;
            /**
             * Watermark
             * @default auto
             * @enum {string}
             */
            watermark?: "auto" | "on" | "off";
            /**
             * Webhook Url
             * @description Called with POST when the job finishes: the body is the job's result (what GET /v1/jobs/{id} returns) plus `event` (job.done, job.failed, batch.done ...) and `job_id`, signed in `X-Signature` (hex HMAC-SHA256 of the raw body with the account's webhook secret). Non-2xx answers are retried after 1, 5 and 30 minutes. https only.
             */
            webhook_url?: string | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthOut */
        HealthOut: {
            /**
             * Status
             * @description "ok" when the API and its database answer.
             * @default ok
             */
            status?: string;
        };
        /** JobListOut */
        JobListOut: {
            /** Jobs */
            jobs: components["schemas"]["JobSummaryOut"][];
            /**
             * Next Cursor
             * @description Pass as `cursor` for the next page; null on the last.
             */
            next_cursor?: string | null;
        };
        /**
         * JobResponse
         * @description ``GET /v1/jobs/{id}``: the sync body once the job is finished.
         *
         *     While the job is queued or running only ``status``, ``job_id`` and
         *     ``progress`` are present; a finished job carries everything the sync
         *     response carries (plus ``records`` for a batch).
         */
        JobResponse: {
            /** Job Id */
            job_id: string;
            /**
             * Kind
             * @default edit
             */
            kind?: string;
            /** Progress */
            progress?: {
                [key: string]: unknown;
            };
            /** Records */
            records?: components["schemas"]["BatchRecordOut"][] | null;
            /** Status */
            status: string;
        } & {
            [key: string]: unknown;
        };
        /** JobSummaryOut */
        JobSummaryOut: {
            /**
             * Changes
             * @default 0
             */
            changes?: number;
            /** Created At */
            created_at?: string | null;
            /** Error Code */
            error_code?: string | null;
            /** Finished At */
            finished_at?: string | null;
            /** Job Id */
            job_id: string;
            /** Kind */
            kind: string;
            /**
             * Pages Billed
             * @default 0
             */
            pages_billed?: number;
            /** Status */
            status: string;
            /** Warnings */
            warnings?: string[];
            /** Webhook State */
            webhook_state?: string | null;
        } & {
            [key: string]: unknown;
        };
        /** LimitsOut */
        LimitsOut: {
            /** Concurrency */
            concurrency: number;
            /** Max File Mb */
            max_file_mb: number;
            /** Max Pages */
            max_pages: number;
            /** Monthly Pages */
            monthly_pages: number;
            /**
             * Overage Allowed
             * @description Always false: every plan is prepaid.
             */
            overage_allowed: boolean;
            /** Rate Per Minute */
            rate_per_minute: number;
            /**
             * Sync Max Edited Pages
             * @description Edits touching more pages than this run as a job.
             */
            sync_max_edited_pages: number;
            /** Watermark Off Allowed */
            watermark_off_allowed: boolean;
        } & {
            [key: string]: unknown;
        };
        /** MatchModel */
        MatchModel: {
            /**
             * Across Lines
             * @default false
             */
            across_lines?: boolean;
            /**
             * Mode
             * @default exact
             * @enum {string}
             */
            mode?: "exact" | "icase" | "word" | "regex";
            /**
             * Normalize
             * @default true
             */
            normalize?: boolean;
        };
        /**
         * OutputOut
         * @description The edited document (absent on ``dry_run`` and on a failed edit).
         */
        OutputOut: {
            /**
             * Bytes
             * @default 0
             */
            bytes?: number;
            /** Expires At */
            expires_at?: string | null;
            /** File Id */
            file_id: string;
            /**
             * Pages
             * @default 0
             */
            pages?: number;
            /** Url */
            url?: string | null;
        } & {
            [key: string]: unknown;
        };
        /**
         * PreviewRequest
         * @description ``POST /v1/preview``'s body (spec §2.2).
         */
        PreviewRequest: {
            /** Highlight */
            highlight?: number[][] | null;
            /**
             * Page
             * @default 1
             */
            page?: number;
            /** Region */
            region?: number[] | null;
            /**
             * Scale
             * @default 2
             * @enum {integer}
             */
            scale?: 1 | 2 | 3;
            source: components["schemas"]["SourceModel"];
        };
        /**
         * QueuedResponse
         * @description The 202 body of an async edit or a batch: the worker has the job.
         */
        QueuedResponse: {
            /** Job Id */
            job_id: string;
            /**
             * Status
             * @default queued
             * @constant
             */
            status?: "queued";
        } & {
            [key: string]: unknown;
        };
        /** RegionModel */
        RegionModel: {
            /**
             * Units
             * @default fraction
             * @enum {string}
             */
            units?: "fraction" | "pt";
            /** X0 */
            x0: number;
            /** X1 */
            x1: number;
            /** Y0 */
            y0: number;
            /** Y1 */
            y1: number;
        };
        /** ScopeModel */
        ScopeModel: {
            /** After */
            after?: string | null;
            /** Before */
            before?: string | null;
            /**
             * Layers
             * @description Page layers to match in. All three are implemented; a match on the 'forms' layer is applied to the field's value, not to the page.
             */
            layers?: ("content" | "forms" | "annotations")[];
            /**
             * Occurrence
             * @default all
             */
            occurrence?: ("all" | "first" | "last") | number;
            /** Page Labels */
            page_labels?: string[] | null;
            /**
             * Pages
             * @default all
             */
            pages?: string | number[];
            region?: components["schemas"]["RegionModel"] | null;
            /** Span Ids */
            span_ids?: string[] | null;
        };
        /** SourceModel */
        SourceModel: {
            /** File Id */
            file_id?: string | null;
            /** Password */
            password?: string | null;
            /** Url */
            url?: string | null;
        };
        /** StyleModel */
        StyleModel: {
            /** Color */
            color?: string | null;
            /** Font */
            font?: string | null;
            /** Size */
            size?: number | null;
        };
        /**
         * TextRequest
         * @description ``POST /v1/text``'s body (spec §2.1).
         *
         *     ``match`` is the engine's own ``MatchModel``, so ``query`` accepts
         *     exactly the four modes an edit's ``find`` does -- a caller searches with
         *     a string and then edits with the same string and the same ``match``.
         */
        TextRequest: {
            /** Cursor */
            cursor?: string | null;
            /** Layers */
            layers?: ("content" | "forms" | "annotations")[];
            /**
             * Limit
             * @default 200
             */
            limit?: number;
            match?: components["schemas"]["MatchModel"];
            /** Pages */
            pages?: string | number[] | null;
            /** Query */
            query?: string | null;
            source: components["schemas"]["SourceModel"];
        };
        /**
         * TextResponse
         * @description ``POST /v1/text``'s body.
         *
         *     ``next_cursor`` is present only when there is another page of results --
         *     a cursor on the last page is an invitation to make one more empty
         *     request. ``fields`` only when ``layers`` included ``forms``.
         */
        TextResponse: {
            /** Fields */
            fields?: components["schemas"]["FieldOut"][] | null;
            /** Next Cursor */
            next_cursor?: string | null;
            /**
             * Page Count
             * @default 0
             */
            page_count?: number;
            /** Spans */
            spans?: components["schemas"]["TextSpanOut"][];
        } & {
            [key: string]: unknown;
        };
        /**
         * TextSpanOut
         * @description One span of the document, as ``/v1/text`` reports it (spec §2.1).
         */
        TextSpanOut: {
            /** Bbox */
            bbox?: number[];
            /** Block Id */
            block_id: string;
            /**
             * Color
             * @default #000000
             */
            color?: string;
            /** Dir */
            dir?: number[];
            /** Field */
            field?: string | null;
            /**
             * Font
             * @default
             */
            font?: string;
            /**
             * In Shared Xobject
             * @default false
             */
            in_shared_xobject?: boolean;
            /**
             * Is Ocr
             * @default false
             */
            is_ocr?: boolean;
            /**
             * Layer
             * @default content
             */
            layer?: string;
            /** Line Id */
            line_id: string;
            /** Page */
            page: number;
            /** Page Label */
            page_label?: string | null;
            /**
             * Size
             * @default 0
             */
            size?: number;
            /** Span Id */
            span_id: string;
            /** Text */
            text: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * UnmatchedOut
         * @description An edit that found nothing (``Unmatched.to_dict()``).
         */
        UnmatchedOut: {
            /** Edit */
            edit: number;
            /**
             * Hint
             * @default
             */
            hint?: string;
            /** Reason */
            reason: string;
            /** Suggestions */
            suggestions?: {
                [key: string]: unknown;
            }[];
        } & {
            [key: string]: unknown;
        };
        /**
         * UsageOut
         * @description What the request cost (spec §5.2's ``usage``).
         */
        UsageOut: {
            /**
             * Pages Billed
             * @default 0
             */
            pages_billed?: number;
            /**
             * Remaining
             * @default 0
             */
            remaining?: number;
            /** Weights */
            weights?: {
                [key: string]: unknown;
            };
        } & {
            [key: string]: unknown;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /** WebhookAckOut */
        WebhookAckOut: {
            /** Credit Pages */
            credit_pages?: number | null;
            /** Kind */
            kind?: string | null;
            /** Plan */
            plan?: string | null;
            /** Reason */
            reason?: string | null;
            /**
             * Status
             * @description `applied` or `ignored`.
             */
            status: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    healthz_healthz_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_source_source_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/gzip": unknown;
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    post_batch_v1_batch_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe. The same key with the same body returns the first request's result (a replay, never a second charge); a duplicate that arrives while the first is still running waits for it, then answers `409 conflict` if it has not finished; the same key with a different body is refused `400`. Without the header the gateway derives a key from the request's content, so a blind retry of a timed-out POST is still safe. Keys are scoped to the account and the key's mode. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BatchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, signed_document, edit_failed */
            422: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    checkout_v1_billing_checkout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutOut"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    creem_webhook_v1_billing_webhook_creem_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookAckOut"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    post_edit_v1_edit_post: {
        parameters: {
            query?: never;
            header?: {
                /** @description Makes a retry safe. The same key with the same body returns the first request's result (a replay, never a second charge); a duplicate that arrives while the first is still running waits for it, then answers `409 conflict` if it has not finished; the same key with a different body is refused `400`. Without the header the gateway derives a key from the request's content, so a blind retry of a timed-out POST is still safe. Keys are scoped to the account and the key's mode. */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EditRequest"];
                "multipart/form-data": {
                    /**
                     * Edits
                     * @description A JSON array of EditModel objects, as `EditRequest.edits` takes them.
                     */
                    edits?: string;
                    /**
                     * File
                     * Format: binary
                     * @description The PDF to edit. The bytes are the source, so `source` is not sent.
                     */
                    file: string;
                    /**
                     * Options
                     * @description A JSON object of GatewayOptions, as `EditRequest.options` takes it.
                     */
                    options?: string;
                    /**
                     * Password
                     * @description The document open password, when it has one.
                     */
                    password?: string;
                };
            };
        };
        responses: {
            /** @description The edit ran */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EditResponse"];
                };
            };
            /** @description Accepted as a job */
            202: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QueuedResponse"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, signed_document, edit_failed */
            422: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    feedback_v1_feedback_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    create_file_v1_files_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FileCreateOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    delete_file_v1_files__file_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                file_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_file_content_v1_files__file_id__content_get: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path: {
                file_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/pdf": string;
                    "image/png": string;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    put_file_content_v1_files__file_id__content_put: {
        parameters: {
            query: {
                token: string;
            };
            header?: never;
            path: {
                file_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_fonts_v1_fonts_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FontsResponse"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    list_jobs_v1_jobs_get: {
        parameters: {
            query?: {
                /** @description ISO 8601 lower bound on created_at */
                since?: string | null;
                status?: string | null;
                /** @description the job_id of the last row of the previous page */
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobListOut"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_job_v1_jobs__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobResponse"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_limits_v1_limits_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LimitsOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    post_preview_v1_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreviewRequest"];
            };
        };
        responses: {
            /** @description The rendered page, at most 200 KB. */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, signed_document, edit_failed */
            422: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    post_text_v1_text_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TextRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TextResponse"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, signed_document, edit_failed */
            422: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    get_usage_v1_usage_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountUsageOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    /** @description Seconds to wait before retrying. */
                    "Retry-After"?: number;
                    /** @description Requests allowed per minute for this key's plan. */
                    "X-RateLimit-Limit"?: number;
                    /** @description Requests left in the current minute. */
                    "X-RateLimit-Remaining"?: number;
                    /** @description Unix time at which the window refills. */
                    "X-RateLimit-Reset"?: number;
                    /** @description A unique id for this request; quote it to support. */
                    "X-Request-Id"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
}
