"""`pdfedit` -- the Python client for the PDF Edit API gateway.

    from pdfedit import Client

    with Client() as client:                    # PDFEDIT_API_KEY
        result = client.edit_file("contract.pdf", [
            {"find": "Acme Inc.", "replace": "Acme, Inc."},
        ])
        print(result["status"], result["output"]["url"])

Every model in the gateway's OpenAPI schema is re-exported here
(`EditRequest`, `EditModel`, `GatewayOptions`, `SourceModel`, ...) and is
generated, never hand-written: see `models.py` and `../generate.py`. The
request methods accept those dataclasses or plain dicts interchangeably.
"""
from __future__ import annotations

from . import models
from .client import (
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    TERMINAL_JOB_STATUSES,
    WAIT_FOR_JOB_DEFAULTS,
    Client,
    is_queued,
    is_terminal_job_status,
    to_wire,
)
from .errors import TIMEOUT_CODE, PdfEditError, PdfEditTimeoutError

__version__ = "0.1.0"

#: Every generated model, re-exported so callers never import `pdfedit.models`
#: directly. Computed rather than listed: the module is regenerated whenever
#: the schema changes, and a hand-kept list would silently fall behind it.
MODELS = tuple(
    sorted(
        name
        for name, member in vars(models).items()
        if not name.startswith("_")
        and isinstance(member, type)
        and member.__module__ == models.__name__
    )
)

globals().update({name: getattr(models, name) for name in MODELS})

__all__ = [
    "Client",
    "DEFAULT_BASE_URL",
    "DEFAULT_TIMEOUT",
    "MODELS",
    "PdfEditError",
    "PdfEditTimeoutError",
    "TERMINAL_JOB_STATUSES",
    "TIMEOUT_CODE",
    "WAIT_FOR_JOB_DEFAULTS",
    "__version__",
    "is_queued",
    "is_terminal_job_status",
    "models",
    "to_wire",
    *MODELS,
]
