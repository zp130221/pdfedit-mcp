# @niubai/pdfedit

Edit existing PDFs from TypeScript: replace, redact and insert text in place,
keeping the font, the layout and the rest of the page untouched. A thin typed
client over the PDF Edit API — the types are generated from the API's OpenAPI
schema, so they are the API, and there are no runtime dependencies (`fetch`).

```bash
npm install @niubai/pdfedit
```

### Replace text

```ts
import { PdfEdit, isQueued } from '@niubai/pdfedit';

const pdfedit = new PdfEdit(); // PDFEDIT_API_KEY, or new PdfEdit({ apiKey })

const result = await pdfedit.editFile('./contract.pdf', [
  { find: 'Acme Inc.', replace: 'Acme, Inc.' },
]);
if (isQueued(result)) throw new Error(`queued as ${result.job_id}`); // see 202, below

console.log(result.status, result.output?.url); // 'done' https://…
```

### Redact

```ts
const redacted = await pdfedit.editFile(
  './statement.pdf',
  [{ op: 'redact', find: '4111 1111 1111 1111' }],
  { redact_metadata: true },
);
if (isQueued(redacted)) throw new Error(`queued as ${redacted.job_id}`);

console.log(redacted.changes?.map((change) => change.page)); // [2]
```

The text is removed from the content stream, not covered with a black
rectangle: the bytes are gone, which is the point of handing the file to
someone else (or to a model).

### Batch

```ts
const job = await pdfedit.batch({
  source: { file_id: await pdfedit.uploadFile(template) },
  edits: [{ find: '{{name}}', replace: '{{name}}' }],
  records: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }],
});

const done = await pdfedit.waitForJob(job.job_id); // polls with backoff
console.log(done.status, done.records?.length); // 'done' 2
```

## API

| Method | Endpoint | Returns |
|---|---|---|
| `edit(body)` | `POST /v1/edit` | `EditResponse`, or `QueuedResponse` on a 202 |
| `editFile(path, edits, options?)` | upload + `POST /v1/edit` | the same |
| `text(body)` | `POST /v1/text` | `TextResponse` — spans, to find before editing |
| `preview(body)` | `POST /v1/preview` | `Uint8Array` of PNG bytes |
| `batch(body)` | `POST /v1/batch` | `QueuedResponse` |
| `job(jobId)` | `GET /v1/jobs/{id}` | `JobResponse` |
| `waitForJob(jobId, options?)` | polls the above | the terminal `JobResponse` |
| `uploadFile(bytes)` | `POST /v1/files` + PUT | a `file_id` |

`new PdfEdit({ apiKey, baseUrl, fetch })` — `apiKey` defaults to
`PDFEDIT_API_KEY`, `baseUrl` to `PDFEDIT_BASE_URL` and then to the public
gateway. `fetch` is there for proxies, retries and tests.

**202 is not an error.** With `options.async` (and for large documents) an
edit answers with `{ job_id, status: 'queued' }`; follow it with
`waitForJob`, which polls `GET /v1/jobs/{id}` until the status is terminal
(`done`, `partial`, `failed`). It backs off exponentially — 500 ms, 1 s, 2 s,
4 s, 8 s, 8 s … — for up to 90 s, then rejects with a `PdfEditTimeoutError`
(the job keeps running; the id is on the error). Those defaults are
`WAIT_FOR_JOB_DEFAULTS` and each is an option: `timeoutMs`,
`initialDelayMs`, `maxDelayMs`, `backoffFactor`.

**Local files never travel as JSON.** `editFile` reads the path, reserves a
`file_id` with `POST /v1/files`, PUTs the bytes to the presigned URL, and
sends only the id. `uploadFile` is the same flow for bytes you already have
(a browser `File`, an S3 object), and a `file_id` is reusable across
`text`, `preview` and `edit` calls on the same document.

## Errors

Every failure the API reports arrives as a `PdfEditError` carrying the
envelope: `code` (the stable string to switch on), `message`, `hint` and the
HTTP `status`. A response that is not that envelope — a proxy's HTML 502 —
still arrives as a `PdfEditError`, with `code` set to `http_502`.

```ts
import { PdfEditError } from '@niubai/pdfedit';

try {
  await pdfedit.editFile('./signed.pdf', [{ find: 'a', replace: 'b' }]);
} catch (error) {
  if (error instanceof PdfEditError && error.code === 'signed_document') {
    console.error(error.hint); // 'set options.break_signature to edit anyway …'
  } else throw error;
}
```

## Development

```bash
npm install
npm run gen        # src/schema.gen.ts from ../../openapi/openapi.json
npm run typecheck
npm test           # vitest, against an in-process fake gateway
npm run build
```

`src/schema.gen.ts` is generated and committed; `npm test` fails if it is
stale, so a change to the gateway's schema has to be regenerated rather than
discovered by a caller.
