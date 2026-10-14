"""`edit_file` / `upload_file`: the presign -> PUT -> edit-by-file_id flow.

The same three steps the MCP server's `resolveSource` performs
(`mcp/pdfedit-mcp/src/files.ts`): PDFs never travel in a request body, a
local file is uploaded out of band and only its `file_id` goes to `/v1/edit`.
"""
from __future__ import annotations

import httpx
import pytest
import respx

import pdfedit
from conftest import BASE_URL

UPLOAD_URL = "https://storage.test/bucket/f_new?sig=abc"
PDF = b"%PDF-1.7\n% a very small document\n"

PRESIGN = {
    "file_id": "f_new",
    "upload_url": UPLOAD_URL,
    "headers": {"Content-Type": "application/pdf", "x-amz-meta-kind": "input"},
    "expires_at": "2026-10-15T00:00:00+00:00",
}
DONE = {"status": "done", "job_id": "job_u", "output": {"file_id": "f_out"}}


@pytest.fixture
def pdf_path(tmp_path):
    path = tmp_path / "contract.pdf"
    path.write_bytes(PDF)
    return path


@respx.mock
def test_edit_file_uploads_then_edits_by_file_id(client, pdf_path):
    presign = respx.post(f"{BASE_URL}/v1/files").mock(
        return_value=httpx.Response(200, json=PRESIGN)
    )
    upload = respx.put(UPLOAD_URL).mock(return_value=httpx.Response(200))
    edit = respx.post(f"{BASE_URL}/v1/edit").mock(return_value=httpx.Response(200, json=DONE))

    assert client.edit_file(
        pdf_path,
        [{"op": "replace", "find": "Acme", "replace": "Globex"}],
        {"watermark": "off"},
    ) == DONE

    # 1. the presign is authenticated and asks for nothing in particular.
    assert presign.called
    presign_request = presign.calls.last.request
    assert presign_request.headers["authorization"] == "Bearer sk_test"
    assert presign_request.content == b"{}"

    # 2. the PUT carries the bytes and the presign's headers -- and no API
    #    key: the URL is already signed and may point at object storage,
    #    where an extra Authorization header breaks the signature.
    upload_request = upload.calls.last.request
    assert upload_request.content == PDF
    assert upload_request.headers["content-type"] == "application/pdf"
    assert upload_request.headers["x-amz-meta-kind"] == "input"
    assert "authorization" not in upload_request.headers

    # 3. the edit refers to the reserved id, never to the path.
    sent = httpx.Response(200, content=edit.calls.last.request.content).json()
    assert sent == {
        "source": {"file_id": "f_new"},
        "edits": [{"op": "replace", "find": "Acme", "replace": "Globex"}],
        "options": {"watermark": "off"},
    }


@respx.mock
def test_edit_file_in_order_without_options(client, pdf_path):
    calls: list[str] = []
    respx.post(f"{BASE_URL}/v1/files").mock(
        side_effect=lambda request: calls.append("presign") or httpx.Response(200, json=PRESIGN)
    )
    respx.put(UPLOAD_URL).mock(
        side_effect=lambda request: calls.append("put") or httpx.Response(201)
    )
    edit = respx.post(f"{BASE_URL}/v1/edit").mock(
        side_effect=lambda request: calls.append("edit") or httpx.Response(200, json=DONE)
    )

    client.edit_file(str(pdf_path), [pdfedit.EditModel(op=pdfedit.Op.delete, find="draft")])

    assert calls == ["presign", "put", "edit"]
    sent = httpx.Response(200, content=edit.calls.last.request.content).json()
    assert "options" not in sent
    assert sent["edits"] == [{"op": "delete", "find": "draft", "fit": "auto", "flatten": False}]


@respx.mock
def test_upload_file_returns_the_reusable_id(client):
    respx.post(f"{BASE_URL}/v1/files").mock(return_value=httpx.Response(200, json=PRESIGN))
    upload = respx.put(UPLOAD_URL).mock(return_value=httpx.Response(200))

    assert client.upload_file(PDF) == "f_new"
    assert upload.calls.last.request.content == PDF


@respx.mock
def test_upload_file_can_override_the_content_type(client):
    presign = dict(PRESIGN, headers=None)
    respx.post(f"{BASE_URL}/v1/files").mock(return_value=httpx.Response(200, json=presign))
    upload = respx.put(UPLOAD_URL).mock(return_value=httpx.Response(200))

    client.upload_file(b"name,amount\nAda,1\n", content_type="text/csv")

    assert upload.calls.last.request.headers["content-type"] == "text/csv"


@respx.mock
def test_edit_file_reports_an_unreadable_path_without_calling_the_gateway(client, tmp_path):
    presign = respx.post(f"{BASE_URL}/v1/files").mock(
        return_value=httpx.Response(200, json=PRESIGN)
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.edit_file(tmp_path / "missing.pdf", [{"op": "delete", "find": "x"}])

    assert raised.value.code == "invalid_request"
    assert raised.value.status == 400
    assert "missing.pdf" in raised.value.message
    assert raised.value.hint
    assert not presign.called


@respx.mock
def test_edit_file_surfaces_a_failed_upload(client, pdf_path):
    respx.post(f"{BASE_URL}/v1/files").mock(return_value=httpx.Response(200, json=PRESIGN))
    respx.put(UPLOAD_URL).mock(return_value=httpx.Response(403, text="<html>expired</html>"))
    edit = respx.post(f"{BASE_URL}/v1/edit").mock(return_value=httpx.Response(200, json=DONE))

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.edit_file(pdf_path, [{"op": "delete", "find": "x"}])

    assert raised.value.status == 403
    assert raised.value.code == "http_403"
    assert not edit.called
