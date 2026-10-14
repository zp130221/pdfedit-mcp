"""`to_wire`: dataclasses, enums and dicts into the gateway's JSON."""
from __future__ import annotations

import pdfedit
from pdfedit import to_wire


def test_unset_dataclass_fields_are_omitted():
    assert to_wire(pdfedit.SourceModel(url="https://x.test/a.pdf")) == {
        "url": "https://x.test/a.pdf"
    }


def test_the_async_keyword_field_goes_out_under_its_alias():
    wire = to_wire(pdfedit.GatewayOptions(async_=True))

    assert wire["async"] is True
    assert "async_" not in wire


def test_enums_become_their_values_recursively():
    request = pdfedit.PreviewRequest(
        source=pdfedit.SourceModel(file_id="f_1"),
        page=3,
        scale=pdfedit.Scale.integer_3,
        highlight=[[10.0, 20.0, 30.0, 40.0]],
    )

    assert to_wire(request) == {
        "source": {"file_id": "f_1"},
        "page": 3,
        "scale": 3,
        "highlight": [[10.0, 20.0, 30.0, 40.0]],
    }


def test_plain_dicts_pass_through_minus_their_nones():
    assert to_wire({"source": {"file_id": "f_1", "password": None}, "limit": 10}) == {
        "source": {"file_id": "f_1"},
        "limit": 10,
    }


def test_dataclasses_and_dicts_mix():
    assert to_wire(
        {"source": pdfedit.SourceModel(file_id="f_1"), "edits": [{"op": "delete", "find": "x"}]}
    ) == {"source": {"file_id": "f_1"}, "edits": [{"op": "delete", "find": "x"}]}


def test_scalars_and_strings_are_left_alone():
    assert to_wire("Acme") == "Acme"
    assert to_wire(7) == 7
    assert to_wire(True) is True
    assert to_wire(None) is None
    assert to_wire([1, "two", None]) == [1, "two", None]
