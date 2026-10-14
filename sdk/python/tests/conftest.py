"""Test wiring: import the SDK from the source tree, never from site-packages.

The repository root also holds a `pdfedit/` directory (the engine), so the
tests cannot rely on `import pdfedit` resolving to the right thing by luck:
`sdk/python` goes on the front of `sys.path`, and any `pdfedit` already
imported from elsewhere is evicted first.
"""
from __future__ import annotations

import sys
from pathlib import Path

SDK_ROOT = Path(__file__).resolve().parents[1]

for name in [n for n in list(sys.modules) if n == "pdfedit" or n.startswith("pdfedit.")]:
    module = sys.modules[name]
    origin = getattr(module, "__file__", None)
    if origin is None or SDK_ROOT not in Path(origin).resolve().parents:
        del sys.modules[name]

if str(SDK_ROOT) in sys.path:
    sys.path.remove(str(SDK_ROOT))
sys.path.insert(0, str(SDK_ROOT))

import pytest  # noqa: E402

import pdfedit  # noqa: E402

#: Where the tests point the client, so no test depends on the default.
BASE_URL = "https://gw.test"


@pytest.fixture(autouse=True)
def _no_ambient_env(monkeypatch):
    """Neither variable leaks in from the developer's shell."""
    monkeypatch.delenv("PDFEDIT_API_KEY", raising=False)
    monkeypatch.delenv("PDFEDIT_BASE_URL", raising=False)


@pytest.fixture
def sleeps():
    """Every delay `wait_for_job` asked for, in order, without waiting."""
    return []


@pytest.fixture
def client(sleeps):
    """A client whose clock and sleep are fake, so polling tests are instant."""
    ticks = iter(range(0, 10_000))

    with pdfedit.Client(
        api_key="sk_test",
        base_url=BASE_URL,
        sleep=sleeps.append,
        clock=lambda: float(next(ticks)),
    ) as instance:
        yield instance
