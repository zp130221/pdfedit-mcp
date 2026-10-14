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
        /** Healthz */
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
         * Engine source (AGPL-3.0)
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
         * Post Batch
         * @description Queue a batch job. Plain ``def``: resolving the template blocks.
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
        /**
         * Checkout
         * @description A hosted checkout link for a plan upgrade or a credit pack.
         *
         *     ``free`` is refused: there is nothing to buy, and a link that charges
         *     nothing is a support ticket waiting to happen. Downgrades are not
         *     checkouts either -- they happen in the provider's portal, and arrive
         *     here as ``subscription.canceled``.
         */
        get: operations["checkout_v1_billing_checkout_get"];
        put?: never;
        post?: never;
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
         * Creem Webhook
         * @description Apply one Creem event to the account it names.
         *
         *     ``async def`` for one reason: the raw body. The signature covers the
         *     bytes as sent, so they have to be read before any parsing, and reading
         *     a request body is the one thing a sync route cannot do.
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
         * Post Edit
         * @description Plain ``def``: the engine run belongs on a threadpool worker.
         */
        post: operations["post_edit_v1_edit_post"];
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
         * Create File
         * @description Reserve a file id and return a presigned upload URL.
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
         * Delete File
         * @description Delete a file (owner only), cascading to its derived children.
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
        /** Get File Content */
        get: operations["get_file_content_v1_files__file_id__content_get"];
        /**
         * Put File Content
         * @description Stays ``async`` -- it consumes the request body, which only the event
         *     loop can iterate -- and hands the one blocking step (writing the file and
         *     updating the row) to a threadpool worker.
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
         * Get Fonts
         * @description ``{"fonts": [{name, family, styles, scripts, source}, ...]}``.
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
         * List Jobs
         * @description Audit metadata for the account's jobs, newest first, no file contents.
         *
         *     Paged by ``cursor``: the ``job_id`` of the last row returned. Job ids are
         *     ULIDs, so ``id < cursor`` is both the pagination predicate and a
         *     chronological one -- no offset, and a page is stable while new jobs
         *     arrive.
         *
         *     ``since`` is applied in Python rather than in SQL on purpose: SQLite
         *     stores ``DateTime(timezone=True)`` naive (see ``db.as_utc``), so an
         *     offset-aware bound in a WHERE clause compares wrongly. Because the rows
         *     come back newest-first, the first row older than ``since`` ends the page
         *     and nothing qualifying can be below it.
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
         * Get Job
         * @description One job: its status, its progress, and the sync body once it is done.
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
        /** Get Limits */
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
         * Post Preview
         * @description Render one page. Plain ``def``: the source read and the pool both block.
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
         * Post Text
         * @description Spans of the document, filtered and paginated. Plain ``def``:
         *     resolving the source and waiting on the pool both block.
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
        /** Get Usage */
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
            /** Webhook Url */
            webhook_url?: string | null;
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
            /** Webhook Url */
            webhook_url?: string | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/gzip": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
            header?: never;
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    checkout_v1_billing_checkout_get: {
        parameters: {
            query?: {
                /** @description starter | growth | scale */
                plan?: string;
                /** @description a credit pack name, e.g. pack_5k */
                pack?: string;
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
            header?: never;
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EditResponse"];
                };
            };
            /** @description Accepted as a job */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QueuedResponse"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FontsResponse"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TextResponse"];
                };
            };
            /** @description error.code is one of: invalid_request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
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
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: quota_exceeded */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: forbidden_watermark_off */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: not_found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: too_large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: document_encrypted, document_unsupported, edit_failed, signed_document */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: rate_limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: upstream_error */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
            /** @description error.code is one of: engine_timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
}
