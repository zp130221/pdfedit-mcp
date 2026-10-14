"""The gateway's error envelope, raised as `PdfEditError`."""
from __future__ import annotations

import httpx
import pytest
import respx

import pdfedit
from conftest import BASE_URL

BODY = {"source": {"file_id": "f_a"}, "edits": [{"op": "delete", "find": "x"}]}


@respx.mock
def test_the_envelope_becomes_code_message_hint_status(client):
    respx.post(f"{BASE_URL}/v1/edit").mock(
        return_value=httpx.Response(
            403,
            json={
                "error": {
                    "code": "forbidden_watermark_off",
                    "message": "The free plan cannot disable the watermark",
                    "hint": "upgrade, or drop options.watermark",
                }
            },
        )
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.edit(BODY)

    error = raised.value
    assert error.code == "forbidden_watermark_off"
    assert error.message == "The free plan cannot disable the watermark"
    assert error.hint == "upgrade, or drop options.watermark"
    assert error.status == 403
    assert str(error) == (
        "forbidden_watermark_off: The free plan cannot disable the watermark "
        "(upgrade, or drop options.watermark)"
    )


@respx.mock
def test_the_optional_members_stay_optional(client):
    respx.post(f"{BASE_URL}/v1/text").mock(
        return_value=httpx.Response(
            429, json={"error": {"code": "rate_limited", "message": "Slow down"}}
        )
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.text({"source": {"file_id": "f_a"}})

    assert raised.value.hint is None
    assert raised.value.edit is None
    assert str(raised.value) == "rate_limited: Slow down"


@respx.mock
def test_the_envelopes_edit_index_is_kept(client):
    respx.post(f"{BASE_URL}/v1/edit").mock(
        return_value=httpx.Response(
            422,
            json={
                "error": {"code": "edit_failed", "message": "edit 1 matched nothing", "edit": 1},
                "changes": [],
                "unmatched": [{"edit": 1, "find": "x"}],
            },
        )
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.edit(BODY)

    assert raised.value.edit == 1
    # The whole body is kept: a failed edit still carries the three lists.
    assert raised.value.body["unmatched"] == [{"edit": 1, "find": "x"}]


@respx.mock
def test_a_non_json_body_falls_back_to_the_status_line(client):
    respx.post(f"{BASE_URL}/v1/edit").mock(
        return_value=httpx.Response(502, text="<html><body>Bad Gateway</body></html>")
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.edit(BODY)

    assert raised.value.code == "http_502"
    assert raised.value.status == 502
    assert "502" in raised.value.message
    assert raised.value.hint is None
    assert raised.value.body is None


@respx.mock
def test_json_without_an_envelope_also_falls_back(client):
    respx.post(f"{BASE_URL}/v1/preview").mock(
        return_value=httpx.Response(500, json={"detail": "something else entirely"})
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.preview({"source": {"file_id": "f_a"}})

    assert raised.value.code == "http_500"
    assert raised.value.body == {"detail": "something else entirely"}


def test_the_error_is_an_exception_and_prints_its_fields():
    error = pdfedit.PdfEditError("not_found", "File not found", "check the id", 404)

    assert isinstance(error, Exception)
    assert "not_found" in repr(error)
    assert "check the id" in repr(error)
