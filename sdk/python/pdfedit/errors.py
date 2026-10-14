"""The gateway's error envelope as an exception.

Every failure the API reports is `{"error": {"code", "message", "hint?"}}`
and `code` is the stable part -- the string a
caller branches on (`quota_exceeded`, `signed_document`, `rate_limited`),
while `message` is prose and `hint` is the sentence to show a human.
`PdfEditError` keeps all three plus the HTTP status.

A body that is *not* that envelope still has to arrive as a `PdfEditError`:
a load balancer's HTML 502 would otherwise surface as a `JSONDecodeError`,
losing the status code, which is the one piece of information a retry
decision needs. Hence `code` falls back to `http_<status>`.

The same two classes as the TypeScript SDK's `src/errors.ts`, with the same
codes, so an error handler ports between the two by renaming.
"""
from __future__ import annotations

from typing import Any, Optional

import httpx

#: `code` of the client-side timeout `Client.wait_for_job` raises. Not one of
#: the gateway's codes (a closed vocabulary) and it carries no `status`, precisely so a caller can tell "we
#: stopped waiting" from anything the server said.
TIMEOUT_CODE = "job_timeout"


class PdfEditError(Exception):
    """A failure the PDF Edit API reported, or a non-JSON response for one.

    Attributes:
        code: The envelope's `code`, or `http_<status>` when the body carried
            no envelope, or `job_timeout` for a wait that ran out.
        message: The envelope's `message`, or the HTTP status line.
        hint: The envelope's `hint`, when the gateway sent one.
        status: The HTTP status, or None for a client-side failure.
        edit: The envelope's `edit` -- the index of the offending edit, when
            the gateway pointed at one.
        body: The parsed response body, when it was JSON at all. A failed
            edit keeps its `changes`/`failed`/`unmatched` lists there.
    """

    def __init__(
        self,
        code: str,
        message: str,
        hint: Optional[str] = None,
        status: Optional[int] = None,
        *,
        edit: Any = None,
        body: Any = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.hint = hint
        self.status = status
        self.edit = edit
        self.body = body

    def __str__(self) -> str:
        """`code: message (hint)` -- what a CLI or a tool result shows."""
        text = f"{self.code}: {self.message}"
        return f"{text} ({self.hint})" if self.hint else text

    def __repr__(self) -> str:
        return (
            f"{type(self).__name__}(code={self.code!r}, message={self.message!r}, "
            f"hint={self.hint!r}, status={self.status!r})"
        )

    @classmethod
    def from_response(cls, response: httpx.Response) -> "PdfEditError":
        """Parse a non-2xx response into an error.

        The status line is the floor: a body that is not JSON, or is JSON
        without an `error` object, leaves `code` as `http_<status>` rather
        than raising a parse error of its own.
        """
        code = f"http_{response.status_code}"
        message = f"{response.status_code} {response.reason_phrase}".strip()
        hint: Optional[str] = None
        edit: Any = None
        body: Any = None

        try:
            body = response.json()
        except ValueError:
            body = None  # not JSON (a proxy page, a truncated body)

        envelope = body.get("error") if isinstance(body, dict) else None
        if isinstance(envelope, dict):
            if isinstance(envelope.get("code"), str):
                code = envelope["code"]
            if isinstance(envelope.get("message"), str):
                message = envelope["message"]
            if isinstance(envelope.get("hint"), str):
                hint = envelope["hint"]
            edit = envelope.get("edit")

        return cls(code, message, hint, response.status_code, edit=edit, body=body)


class PdfEditTimeoutError(PdfEditError):
    """`wait_for_job` gave up before the job reached a terminal status.

    Not a failure of the job: it may still finish. `job_id` and `last_status`
    are carried so the caller can keep polling (or quote the id to support)
    instead of having to re-derive them.
    """

    def __init__(
        self,
        job_id: str,
        last_status: str,
        timeout: float,
        *,
        body: Any = None,
    ) -> None:
        super().__init__(
            TIMEOUT_CODE,
            f"Job {job_id} was still {last_status!r} after {timeout:g}s",
            f"the job is still running; poll client.job({job_id!r}) or raise timeout",
            body=body,
        )
        self.job_id = job_id
        self.last_status = last_status
        self.timeout = timeout
