# pdfedit

Edit existing PDFs from Python: replace, redact and insert text in place,
keeping the font, the layout and the rest of the page untouched. A thin typed
client over the PDF Edit API — the models are generated from the API's OpenAPI
schema, so they are the API, and the only dependency is `httpx`.

```bash
pip install pdfedit
```

### Replace text

```python
from pdfedit import Client

client = Client()  # PDFEDIT_API_KEY, or Client(api_key="sk_...")

result = client.edit_file("./contract.pdf", [
    {"find": "Acme Inc.", "replace": "Acme, Inc."},
])

print(result["status"], result["output"]["url"])  # 'done' https://…
```

### Redact

```python
redacted = client.edit_file(
    "./statement.pdf",
    [{"op": "redact", "find": "4111 1111 1111 1111"}],
    {"redact_metadata": True},
)

print([change["page"] for change in redacted["changes"]])  # [2]
```

The text is removed from the content stream, not covered with a black
rectangle: the bytes are gone, which is the point of handing the file to
someone else (or to a model).

### Batch

```python
with open("./invoice-template.pdf", "rb") as handle:
    template = client.upload_file(handle.read())

job = client.batch({
    "source": {"file_id": template},
    "edits": [{"find": "{{name}}", "replace": "{{name}}"}],
    "records": [{"name": "Ada Lovelace"}, {"name": "Grace Hopper"}],
})

done = client.wait_for_job(job["job_id"])  # polls with backoff
print(done["status"], len(done["records"]))  # 'done' 2
```

## API

| Method | Endpoint | Returns |
|---|---|---|
| `edit(body)` | `POST /v1/edit` | the edit response, or the queued job on a 202 |
| `edit_file(path, edits, options=None)` | upload + `POST /v1/edit` | the same |
| `text(body)` | `POST /v1/text` | spans and fields, to find before editing |
| `preview(body)` | `POST /v1/preview` | `bytes` of PNG |
| `batch(body)` | `POST /v1/batch` | the queued job |
| `job(job_id)` | `GET /v1/jobs/{id}` | the job |
| `wait_for_job(job_id, ...)` | polls the above | the terminal job |
| `upload_file(data)` | `POST /v1/files` + PUT | a `file_id` |
| `download(url)` | a URL the gateway returned | `bytes` |

`Client(api_key, base_url, *, timeout, transport, sleep, clock)` — `api_key`
defaults to `PDFEDIT_API_KEY`, `base_url` to `PDFEDIT_BASE_URL` and then to
the public gateway. `transport` is there for proxies, retries and tests;
`sleep` and `clock` are what `wait_for_job` polls with. The client is a
context manager (`with Client() as client:`) and has `close()`.

Every request method takes a plain dict or the generated dataclasses
interchangeably — `Client().edit(EditRequest(source=SourceModel(file_id=…),
edits=[EditModel(op=Op.redact, find="SSN")]))` — and unset fields, enums and
the `async_` field name are serialised the way the gateway expects.

**202 is not an error.** With `options["async"]` (and for large documents) an
edit answers with `{"job_id": ..., "status": "queued"}`; `is_queued(body)`
recognises it and `wait_for_job` follows it, polling `GET /v1/jobs/{id}` until
the status is terminal (`done`, `partial`, `failed`). It backs off
exponentially — 0.5 s, 1 s, 2 s, 4 s, 8 s, 8 s … — for up to 90 s, then raises
`PdfEditTimeoutError` (the job keeps running; the id is on the error). Those
defaults are `WAIT_FOR_JOB_DEFAULTS` and each is an argument: `timeout`,
`initial_delay`, `max_delay`, `backoff_factor`.

**Local files never travel as JSON.** `edit_file` reads the path, reserves a
`file_id` with `POST /v1/files`, PUTs the bytes to the presigned URL, and
sends only the id. `upload_file` is the same flow for bytes you already have,
and a `file_id` is reusable across `text`, `preview` and `edit` calls on the
same document.

## Errors

Every failure the API reports arrives as a `PdfEditError` carrying the
envelope: `code` (the stable string to branch on), `message`, `hint` and the
HTTP `status`. A response that is not that envelope — a proxy's HTML 502 —
still arrives as a `PdfEditError`, with `code` set to `http_502`.

```python
from pdfedit import PdfEditError

try:
    client.edit_file("./signed.pdf", [{"find": "a", "replace": "b"}])
except PdfEditError as error:
    if error.code == "signed_document":
        print(error.hint)  # 'set options.break_signature to edit anyway'
    else:
        raise
```

## Development

```bash
pip install -e '.[dev]'
python generate.py        # pdfedit/models.py from ../../openapi/openapi.json
python -m pytest tests -q # against respx-mocked httpx
```

`pdfedit/models.py` is generated and committed; `pytest` fails if it is stale,
so a change to the gateway's schema has to be regenerated rather than
discovered by a caller.
