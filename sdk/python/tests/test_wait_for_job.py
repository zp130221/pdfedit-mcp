"""`wait_for_job`: the 202 -> poll loop, its backoff, and its budget."""
from __future__ import annotations

import httpx
import pytest
import respx

import pdfedit
from conftest import BASE_URL

QUEUED = {"status": "queued", "job_id": "job_1"}
RUNNING = {"status": "running", "job_id": "job_1"}
DONE = {"status": "done", "job_id": "job_1", "output": {"file_id": "f_out"}}


def _poll(*bodies):
    """A `/v1/jobs/job_1` route answering `bodies` in order."""
    responses = [httpx.Response(200, json=body) for body in bodies]
    return respx.get(f"{BASE_URL}/v1/jobs/job_1").mock(side_effect=responses)


def test_the_documented_defaults():
    assert pdfedit.WAIT_FOR_JOB_DEFAULTS == {
        "timeout": 90.0,
        "initial_delay": 0.5,
        "max_delay": 8.0,
        "backoff_factor": 2.0,
    }


@respx.mock
def test_a_202_edit_is_followed_to_completion(client, sleeps):
    respx.post(f"{BASE_URL}/v1/edit").mock(return_value=httpx.Response(202, json=QUEUED))
    _poll(QUEUED, RUNNING, DONE)

    accepted = client.edit({"source": {"file_id": "f_a"}, "edits": [], "options": {"async": True}})
    assert pdfedit.is_queued(accepted)

    assert client.wait_for_job(accepted["job_id"]) == DONE
    assert sleeps == [0.5, 1.0]


@respx.mock
def test_the_delay_grows_exponentially_up_to_max_delay(client, sleeps):
    _poll(*([RUNNING] * 6 + [DONE]))

    client.wait_for_job("job_1", initial_delay=0.5, max_delay=4.0)

    # Doubling, then flat at the cap -- never a tight loop, never a long gap.
    assert sleeps == [0.5, 1.0, 2.0, 4.0, 4.0, 4.0]
    assert all(later >= earlier for earlier, later in zip(sleeps, sleeps[1:]))
    assert sleeps[1] > sleeps[0]


@respx.mock
def test_the_backoff_factor_is_configurable(client, sleeps):
    _poll(*([RUNNING] * 3 + [DONE]))

    client.wait_for_job("job_1", initial_delay=1.0, max_delay=100.0, backoff_factor=3.0)

    assert sleeps == [1.0, 3.0, 9.0]


@respx.mock
def test_a_zero_initial_delay_still_backs_off(client, sleeps):
    """`initial_delay=0` must not multiply to a tight poll loop forever."""
    _poll(*([RUNNING] * 4 + [DONE]))

    client.wait_for_job("job_1", initial_delay=0.0)

    assert sleeps == [0.001, 0.002, 0.004, 0.008]
    assert all(delay > 0 for delay in sleeps)
    assert sleeps[1] > sleeps[0]


@respx.mock
def test_the_first_poll_is_immediate(client, sleeps):
    _poll(DONE)

    assert client.wait_for_job("job_1") == DONE
    assert sleeps == []


@respx.mock
def test_a_terminal_failure_is_returned_not_raised(client, sleeps):
    failed = {
        "status": "failed",
        "job_id": "job_1",
        "error": {"code": "edit_failed", "message": "nothing matched"},
    }
    _poll(RUNNING, failed)

    result = client.wait_for_job("job_1")

    # The poll itself succeeded (the gateway answers 200 for a failed job);
    # the outcome is in the body, which is where a polling caller looks.
    assert result["status"] == "failed"
    assert sleeps == [0.5]


@respx.mock
def test_a_partial_job_is_terminal(client):
    _poll({"status": "partial", "job_id": "job_1"})

    assert client.wait_for_job("job_1")["status"] == "partial"


@respx.mock
def test_waiting_gives_up_before_sleeping_past_the_budget(client, sleeps):
    route = _poll(*([RUNNING] * 20))

    with pytest.raises(pdfedit.PdfEditTimeoutError) as raised:
        # The fixture's clock advances one second per reading.
        client.wait_for_job("job_1", timeout=3.0, initial_delay=0.5, max_delay=4.0)

    error = raised.value
    assert isinstance(error, pdfedit.PdfEditError)
    assert error.code == pdfedit.TIMEOUT_CODE == "job_timeout"
    assert error.status is None
    assert error.job_id == "job_1"
    assert error.last_status == "running"
    assert error.timeout == 3.0
    assert "job_1" in error.message
    # It stopped rather than sleeping past the deadline.
    assert sleeps == [0.5]
    assert route.call_count == 2


@respx.mock
def test_an_error_while_polling_is_raised(client):
    respx.get(f"{BASE_URL}/v1/jobs/job_1").mock(
        return_value=httpx.Response(404, json={"error": {"code": "not_found", "message": "gone"}})
    )

    with pytest.raises(pdfedit.PdfEditError) as raised:
        client.wait_for_job("job_1")

    assert raised.value.code == "not_found"
    assert not isinstance(raised.value, pdfedit.PdfEditTimeoutError)
