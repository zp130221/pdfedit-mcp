"""Construction, authentication, and one test per endpoint method."""
from __future__ import annotations

import httpx
import pytest
import respx

import pdfedit
from conftest import BASE_URL

EDIT_BODY = {
    "source": {"file_id": "f_abc"},
    "edits": [{"op": "replace", "find": "Acme", "replace": "Globex"}],
}

DONE = {
    "status": "done",
    "job_id": "job_1",
    "changes": [{"edit": 0, "op": "replace", "page": 1}],
    "output": {"file_id": "f_out", "url": "https://gw.test/f_out.pdf", "pages": 2},
}


def test_defaults_come_from_the_environment(monkeypatch):
    monkeypatch.setenv("PDFEDIT_API_KEY", "sk_env")
    monkeypatch.setenv("PDFEDIT_BASE_URL", "https://env.example.com/")

    with pdfedit.Client() as client:
        assert client.api_key == "sk_env"
        # The trailing slash is dropped so paths concatenate cleanly.
        assert client.base_url == "https://env.example.com"


def test_arguments_beat_the_environment(monkeypatch):
    monkeypatch.setenv("PDFEDIT_API_KEY", "sk_env")
    monkeypatch.setenv("PDFEDIT_BASE_URL", "https://env.example.com")

    with pdfedit.Client(api_key="sk_arg", base_url="https://arg.example.com") as client:
        assert client.api_key == "sk_arg"
        assert client.base_url == "https://arg.example.com"


def test_public_default_base_url_when_nothing_is_set():
    with pdfedit.Client() as client:
        assert client.api_key is None
        assert client.base_url == pdfedit.DEFAULT_BASE_URL


def test_a_transport_can_be_injected():
    seen: list[httpx.Request] = []

    def handle(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, json=DONE)

    with pdfedit.Client(
        api_key="sk_t", base_url=BASE_URL, transport=httpx.MockTransport(handle)
    ) as client:
        assert client.edit(EDIT_BODY) == DONE

    assert str(seen[0].url) == f"{BASE_URL}/v1/edit"


@respx.mock
def test_edit_sends_bearer_json_and_returns_the_body(client):
    route = respx.post(f"{BASE_URL}/v1/edit").mock(return_value=httpx.Response(200, json=DONE))

    result = client.edit(EDIT_BODY)

    assert result == DONE
    assert pdfedit.is_queued(result) is False
    request = route.calls.last.request
    assert request.headers["authorization"] == "Bearer sk_test"
    assert request.headers["content-type"] == "application/json"
    assert request.headers["accept"] == "application/json"


@respx.mock
def test_a_client_without_a_key_sends_no_authorization_header():
    with pdfedit.Client(base_url=BASE_URL) as client:
        route = respx.post(f"{BASE_URL}/v1/edit").mock(
            return_value=httpx.Response(200, json=DONE)
        )
        client.edit(EDIT_BODY)

    assert "authorization" not in route.calls.last.request.headers


@respx.mock
def test_edit_accepts_generated_dataclasses(client):
    route = respx.post(f"{BASE_URL}/v1/edit").mock(return_value=httpx.Response(200, json=DONE))

    client.edit(
        pdfedit.EditRequest(
            source=pdfedit.SourceModel(file_id="f_abc"),
            edits=[pdfedit.EditModel(op=pdfedit.Op.redact, find="SSN")],
            options=pdfedit.GatewayOptions(async_=True, redact_metadata=True),
        )
    )

    sent = httpx.Response(200, content=route.calls.last.request.content).json()
    # Enums go out as their wire values, unset fields are omitted entirely,
    # and `async_` is renamed to the `async` the gateway's alias expects.
    assert sent == {
        "source": {"file_id": "f_abc"},
        "edits": [{"op": "redact", "find": "SSN", "fit": "auto", "flatten": False}],
        "options": {
            "async": True,
            "atomic": True,
            "break_signature": False,
            "collateral_threshold": 8,
            "dry_run": False,
            "ocr": "auto",
            "preview": "changes",
            "redact_metadata": True,
            "redact_style": "box",
            "redact_verify_ocr": True,
            "retain": True,
            "strict": False,
            "tidy": True,
            "watermark": "auto",
        },
    }


@respx.mock
def test_edit_treats_202_as_success_not_an_error(client):
    respx.post(f"{BASE_URL}/v1/edit").mock(
        return_value=httpx.Response(202, json={"status": "queued", "job_id": "job_9"})
    )

    result = client.edit(EDIT_BODY)

    assert result == {"status": "queued", "job_id": "job_9"}
    assert pdfedit.is_queued(result) is True


@respx.mock
def test_text(client):
    body = {"spans": [{"text": "Acme", "page": 1}], "page_count": 1}
    route = respx.post(f"{BASE_URL}/v1/text").mock(return_value=httpx.Response(200, json=body))

    assert client.text({"source": {"file_id": "f_abc"}, "query": "Acme"}) == body
    assert route.calls.last.request.headers["authorization"] == "Bearer sk_test"


@respx.mock
def test_preview_returns_png_bytes(client):
    png = b"\x89PNG\r\n\x1a\nfake"
    route = respx.post(f"{BASE_URL}/v1/preview").mock(
        return_value=httpx.Response(200, content=png, headers={"content-type": "image/png"})
    )

    assert client.preview({"source": {"file_id": "f_abc"}, "page": 1}) == png
    assert route.calls.last.request.headers["accept"] == "image/png"


@respx.mock
def test_batch(client):
    queued = {"status": "queued", "job_id": "bat_1"}
    route = respx.post(f"{BASE_URL}/v1/batch").mock(return_value=httpx.Response(202, json=queued))

    result = client.batch(
        {
            "source": {"file_id": "f_tpl"},
            "edits": [{"op": "replace", "find": "{{name}}", "replace": "{{row.name}}"}],
            "records": [{"name": "Ada"}, {"name": "Grace"}],
        }
    )

    assert result == queued
    assert route.calls.last.request.url.path == "/v1/batch"


@respx.mock
def test_job_url_encodes_the_id(client):
    respx.get(f"{BASE_URL}/v1/jobs/job%2F1").mock(return_value=httpx.Response(200, json=DONE))

    assert client.job("job/1") == DONE


@respx.mock
def test_download_sends_no_api_key(client):
    pdf = b"%PDF-1.7 edited"
    route = respx.get("https://storage.test/out/f_out.pdf").mock(
        return_value=httpx.Response(200, content=pdf)
    )

    assert client.download("https://storage.test/out/f_out.pdf") == pdf
    assert "authorization" not in route.calls.last.request.headers


def test_close_is_idempotent_and_the_context_manager_closes():
    client = pdfedit.Client(api_key="sk", base_url=BASE_URL)
    client.close()
    client.close()

    with pdfedit.Client(api_key="sk", base_url=BASE_URL) as instance:
        pass
    with pytest.raises(RuntimeError):
        instance.edit(EDIT_BODY)
