"""`pdfedit/models.py` must equal a fresh run of the generator.

The CI guard for "one schema, three places": if `openapi/openapi.json`
changes and nobody re-ran `python sdk/python/generate.py`, this fails and
prints the command to run.

It is skipped -- not failed -- when `datamodel-code-generator` is not
installed, so a CI job that only installs the runtime dependency does not
fail spuriously. `pip install -e 'sdk/python[dev]'` installs it.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

SDK_ROOT = Path(__file__).resolve().parents[1]
if str(SDK_ROOT) not in sys.path:  # pragma: no cover -- conftest does this
    sys.path.insert(0, str(SDK_ROOT))

import generate  # noqa: E402


def _normalised(text: str) -> str:
    """Line endings are not news: the file is committed with `\\n`."""
    return text.replace("\r\n", "\n")


def test_the_openapi_schema_is_where_generate_expects_it():
    assert generate.OPENAPI_PATH.is_file(), generate.OPENAPI_PATH
    assert generate.OUTPUT_PATH.is_file(), generate.OUTPUT_PATH


def test_models_py_is_not_stale():
    pytest.importorskip(
        "datamodel_code_generator",
        reason="datamodel-code-generator is not installed; "
        "install sdk/python[dev] to check the generated models",
    )

    committed = _normalised(generate.OUTPUT_PATH.read_text(encoding="utf-8"))
    fresh = _normalised(generate.generate_source())

    assert committed == fresh, (
        "sdk/python/pdfedit/models.py is stale with respect to "
        "openapi/openapi.json -- regenerate it with "
        "`python sdk/python/generate.py`"
    )


def test_the_generated_file_says_how_it_was_generated():
    text = generate.OUTPUT_PATH.read_text(encoding="utf-8")

    assert "DO NOT EDIT" in text
    assert "python sdk/python/generate.py" in text
    assert generate.command_line() in text
    assert "--disable-timestamp" in generate.command_line()
