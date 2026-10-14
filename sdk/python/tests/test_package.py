"""What the package promises at its top level."""
from __future__ import annotations

import re
from pathlib import Path

import pdfedit

SDK_ROOT = Path(__file__).resolve().parents[1]


def test_the_advertised_surface_is_importable():
    for name in pdfedit.__all__:
        assert hasattr(pdfedit, name), name

    assert pdfedit.Client is not None
    assert issubclass(pdfedit.PdfEditError, Exception)


def test_every_generated_model_is_re_exported():
    expected = {
        "EditRequest",
        "EditModel",
        "GatewayOptions",
        "BatchRequest",
        "BatchOptions",
        "TextRequest",
        "PreviewRequest",
        "SourceModel",
        "EditResponse",
        "QueuedResponse",
        "Op",
    }

    assert expected <= set(pdfedit.MODELS)
    for name in pdfedit.MODELS:
        assert getattr(pdfedit, name) is getattr(pdfedit.models, name)


def test_the_version_matches_pyproject():
    text = (SDK_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    declared = re.search(r'^version = "([^"]+)"', text, re.MULTILINE)

    assert declared and declared.group(1) == pdfedit.__version__
