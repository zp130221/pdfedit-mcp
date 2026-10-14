"""The PDF Edit gateway client.

One class, one `httpx.Client`, and the same methods as the TypeScript SDK
(`sdk/typescript/src/client.ts`) in Python spelling -- `edit`, `edit_file`,
`text`, `preview`, `batch`, `job`, `wait_for_job`, `upload_file`,
`download` -- returning the same bodies, so an example in one language reads
as the other.

Authentication is `Authorization: Bearer <api_key>`, defaulting to
`PDFEDIT_API_KEY`; `PDFEDIT_BASE_URL` points the client at a self-hosted
gateway, defaulting to `DEFAULT_BASE_URL`.

**Three things are deliberate.**

*The API key is set per request, not on the `httpx.Client`.* `upload_file`
PUTs bytes to a presigned URL that may belong to object storage, where an
extra `Authorization` header invalidates the signature -- that request must
carry none, and a client-wide default header cannot be removed for one call.

*A 202 is not an error.* `options.async` and every `/v1/batch` answer with
`{"status": "queued", "job_id": ...}`; `is_queued` recognises it and
`wait_for_job` follows it.

*`wait_for_job`'s sleep and clock are injectable.* Tests of the backoff
record the delays instead of living through them.
"""
from __future__ import annotations

import dataclasses
import enum
import os
import time
import urllib.parse
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Optional, Union

import httpx

from .errors import PdfEditError, PdfEditTimeoutError

#: The hosted API, used when `PDFEDIT_BASE_URL` is unset; the same default
#: `mcp/pdfedit-mcp` and the TypeScript SDK use. Point it at a self-hosted
#: gateway (e.g. ``http://localhost:8000``) with the environment variable or
#: the `base_url` argument.
DEFAULT_BASE_URL = "https://api.niubai.vip"

#: A synchronous edit runs the engine while the caller waits, so the HTTP
#: timeout is generous; `options.async` plus `wait_for_job` is how to avoid
#: holding a connection at all.
DEFAULT_TIMEOUT = 120.0

#: The documented defaults of `Client.wait_for_job`, mirroring the
#: The floor on one poll delay: a backoff that multiplies cannot start at 0.
MIN_POLL_DELAY = 0.001

#: TypeScript SDK's `WAIT_FOR_JOB_DEFAULTS` (seconds, not milliseconds).
WAIT_FOR_JOB_DEFAULTS = {
    # The same budget `mcp/pdfedit-mcp` polls for.
    "timeout": 90.0,
    # The first gap after a non-terminal poll.
    "initial_delay": 0.5,
    # The gap stops growing here.
    "max_delay": 8.0,
    # Each gap is this multiple of the previous one.
    "backoff_factor": 2.0,
}

#: Job statuses that will not change again.
TERMINAL_JOB_STATUSES = ("done", "partial", "failed")

#: What the client tells a caller who hands `edit_file` an unreadable path.
UNREADABLE_PATH_HINT = (
    "pass a path to an existing PDF, or upload the bytes with upload_file()"
)

#: A request body: a generated dataclass, a plain dict, or a mix of both.
Body = Any


def is_terminal_job_status(status: Any) -> bool:
    """True once a job's status cannot change again."""
    return status in TERMINAL_JOB_STATUSES


def is_queued(body: Any) -> bool:
    """True when an edit or batch response is a job to poll, not a result."""
    return isinstance(body, Mapping) and body.get("status") == "queued"


def to_wire(value: Any) -> Any:
    """Serialise `value` for JSON, the way the gateway's models expect it.

    * dataclasses become objects, dropping fields left as `None` (the
      schema's "unset"), so a bare `GatewayOptions()` does not send
      eighteen nulls;
    * a field named `async_` goes out as `async`, matching the alias
      `GatewayOptions` declares for the Python keyword;
    * enums become their values, `Path` becomes a string;
    * `None` values are dropped from dicts too, so a body built by hand with
      a few `None`s behaves the same as the dataclasses do.
    """
    if isinstance(value, enum.Enum):
        return to_wire(value.value)
    if dataclasses.is_dataclass(value) and not isinstance(value, type):
        wire = {}
        for field in dataclasses.fields(value):
            member = getattr(value, field.name)
            if member is None:
                continue
            name = field.name[:-1] if field.name.endswith("_") else field.name
            wire[name] = to_wire(member)
        return wire
    if isinstance(value, Mapping):
        return {key: to_wire(member) for key, member in value.items() if member is not None}
    if isinstance(value, (str, bytes)):
        return value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, Iterable):
        return [to_wire(member) for member in value]
    return value


class Client:
    """A synchronous gateway client.

    Args:
        api_key: Bearer token; defaults to `PDFEDIT_API_KEY`. A client
            without one still reaches the keyless free tier.
        base_url: Gateway address; defaults to `PDFEDIT_BASE_URL`, then
            `DEFAULT_BASE_URL`. A trailing slash is dropped.
        timeout: httpx timeout, in seconds, for every request.
        transport: An `httpx.BaseTransport` to use instead of the network
            (`httpx.MockTransport` in tests, a retrying transport in anger).
        sleep: What `wait_for_job` waits with. Injectable so a test can
            record the backoff rather than live through it.
        clock: The monotonic clock `wait_for_job` measures its budget with.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        *,
        timeout: Union[float, httpx.Timeout, None] = DEFAULT_TIMEOUT,
        transport: Optional[httpx.BaseTransport] = None,
        sleep: Callable[[float], Any] = time.sleep,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.api_key = api_key or os.environ.get("PDFEDIT_API_KEY") or None
        self.base_url = (
            base_url or os.environ.get("PDFEDIT_BASE_URL") or DEFAULT_BASE_URL
        ).rstrip("/")
        self._sleep = sleep
        self._clock = clock
        self._http = httpx.Client(timeout=timeout, transport=transport)

    # -- endpoints --------------------------------------------------------

    def edit(self, body: Body) -> dict:
        """`POST /v1/edit`: replace, redact, insert or fill, in place.

        A 202 is **not** an error: with `options.async` (or when the gateway
        decides a document is too big to edit inline) the answer is
        `{"status": "queued", "job_id": ...}`, and the job it names is
        followed with `wait_for_job`. Test it with `is_queued`.
        """
        return self._post_json("/v1/edit", body)

    def edit_file(
        self,
        path: Union[str, os.PathLike],
        edits: Any,
        options: Any = None,
    ) -> dict:
        """Edit a PDF on this machine: upload it, then `edit` it by `file_id`.

        The bytes travel out of band (`POST /v1/files` -> presigned PUT) and
        only the id goes in the request body -- a 20 MB PDF is never base64
        in JSON. For bytes already in hand, call `upload_file` directly.

        Raises:
            PdfEditError: `invalid_request` if the file cannot be read, and
                whatever the gateway or the storage answered otherwise.
        """
        file_id = self.upload_file(self._read(path))
        body: dict = {"source": {"file_id": file_id}, "edits": edits}
        if options is not None:
            body["options"] = options
        return self.edit(body)

    def text(self, body: Body) -> dict:
        """`POST /v1/text`: the document's spans, filtered and paginated."""
        return self._post_json("/v1/text", body)

    def preview(self, body: Body) -> bytes:
        """`POST /v1/preview`: one page rendered as PNG bytes."""
        request = self._http.build_request(
            "POST",
            f"{self.base_url}/v1/preview",
            json=to_wire(body),
            headers=self._headers(Accept="image/png"),
        )
        return self._send(request).content

    def batch(self, body: Body) -> dict:
        """`POST /v1/batch`: one template, many records. Always a job (202)."""
        return self._post_json("/v1/batch", body)

    def job(self, job_id: str) -> dict:
        """`GET /v1/jobs/{job_id}`: status, and the sync body once done.

        The HTTP status is 200 even for a failed job -- the poll succeeded,
        and the outcome is in `body["status"]`.
        """
        return self._get_json(f"/v1/jobs/{urllib.parse.quote(job_id, safe='')}")

    def wait_for_job(
        self,
        job_id: str,
        timeout: float = WAIT_FOR_JOB_DEFAULTS["timeout"],
        initial_delay: float = WAIT_FOR_JOB_DEFAULTS["initial_delay"],
        max_delay: float = WAIT_FOR_JOB_DEFAULTS["max_delay"],
        backoff_factor: float = WAIT_FOR_JOB_DEFAULTS["backoff_factor"],
    ) -> dict:
        """Poll a job until its status is `done`, `partial` or `failed`.

        The first poll happens immediately; after each non-terminal answer
        the client sleeps `initial_delay` and multiplies that by
        `backoff_factor` up to `max_delay` -- 0.5 s, 1 s, 2 s, 4 s, 8 s,
        8 s ... by default, so a job that finishes in a second is noticed in
        a second and a five-minute batch costs a handful of requests.

        Returns:
            The final poll's body, failed jobs included: a job that ran and
            failed is an answer, not an exception.

        Raises:
            PdfEditTimeoutError: the budget ran out while the job was still
                moving. The job is not cancelled.
            PdfEditError: whatever a failing poll answered.
        """
        started = self._clock()
        # At least a millisecond: the delay grows by multiplication, so a 0
        # (or negative) initial delay would stay 0 and turn the backoff into
        # a tight poll loop for the whole budget.
        delay = max(MIN_POLL_DELAY, initial_delay)

        while True:
            body = self.job(job_id)
            status = body.get("status") if isinstance(body, Mapping) else None
            if is_terminal_job_status(status):
                return body

            # Checked *before* sleeping: a client that slept past its own
            # budget and only then noticed would blow the caller's timeout
            # rather than keep it.
            if self._clock() - started + delay >= timeout:
                raise PdfEditTimeoutError(job_id, str(status), timeout, body=body)

            self._sleep(delay)
            delay = min(delay * backoff_factor, max_delay)

    # -- files ------------------------------------------------------------

    def upload_file(self, data: bytes, content_type: str = "application/pdf") -> str:
        """`POST /v1/files` plus the presigned PUT: bytes in, `file_id` out.

        The id is what `source.file_id` takes, and it is reusable -- upload
        once, then `text`, `preview` and `edit` the same document without
        re-sending it.
        """
        reserved = self._post_json("/v1/files", {})
        headers = {"Content-Type": content_type, **(reserved.get("headers") or {})}
        self._send(
            self._http.build_request(
                "PUT", reserved["upload_url"], content=data, headers=headers
            )
        )
        return reserved["file_id"]

    def download(self, url: str) -> bytes:
        """Download a URL the gateway handed back (`output.url`, a preview).

        Sent without the API key: those URLs carry their own signature and
        may point straight at object storage.
        """
        return self._send(self._http.build_request("GET", url)).content

    # -- internals --------------------------------------------------------

    def _headers(self, **extra: str) -> dict:
        headers = dict(extra)
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _send(self, request: httpx.Request) -> httpx.Response:
        """One request, with the envelope turned into a `PdfEditError`."""
        response = self._http.send(request)
        if not response.is_success:
            raise PdfEditError.from_response(response)
        return response

    def _post_json(self, path: str, body: Body) -> dict:
        request = self._http.build_request(
            "POST",
            f"{self.base_url}{path}",
            json=to_wire(body),
            headers=self._headers(Accept="application/json"),
        )
        return self._send(request).json()

    def _get_json(self, path: str) -> dict:
        request = self._http.build_request(
            "GET",
            f"{self.base_url}{path}",
            headers=self._headers(Accept="application/json"),
        )
        return self._send(request).json()

    @staticmethod
    def _read(path: Union[str, os.PathLike]) -> bytes:
        try:
            return Path(path).read_bytes()
        except OSError as exc:
            raise PdfEditError(
                "invalid_request",
                f"Cannot read '{path}': {exc.strerror or exc}",
                UNREADABLE_PATH_HINT,
                400,
            ) from exc

    # -- lifecycle --------------------------------------------------------

    def close(self) -> None:
        """Close the underlying connection pool. Safe to call twice."""
        self._http.close()

    def __enter__(self) -> "Client":
        return self

    def __exit__(self, *exc_info: Any) -> None:
        self.close()
