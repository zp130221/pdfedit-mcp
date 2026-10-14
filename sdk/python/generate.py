"""The one place the `pdfedit.models` generation command lives.

`pdfedit/models.py` is not written by hand: it is `datamodel-codegen` run
over `openapi/openapi.json` -- the same schema the gateway serves, the MCP
server's `schemas.gen.ts` and the TypeScript SDK are built from ("one
schema, three places").

Run it from the repository root:

    python sdk/python/generate.py

`tests/test_models_generated.py` imports this module, regenerates into a
temporary file and fails if the committed `pdfedit/models.py` differs, so a
schema change that was not regenerated cannot pass CI.

Two flags matter for that comparison and must not be dropped:

* `--disable-timestamp`, or every run would differ in its header line;
* `--formatters builtin`, so the output does not move with the installed
  black/isort versions (and neither is needed to regenerate).

The model type is `dataclasses.dataclass`: the SDK's only runtime
dependency is `httpx`, and pydantic models would add a second one for no
gain -- the client serialises whatever it is handed (dataclass, dict, or a
mix) and hands back parsed JSON.
"""
from __future__ import annotations

import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

#: `sdk/python/`.
SDK_ROOT = Path(__file__).resolve().parent
#: The repository root, which every path below is quoted relative to.
REPO_ROOT = SDK_ROOT.parents[1]

OPENAPI_PATH = REPO_ROOT / "openapi" / "openapi.json"
OUTPUT_PATH = SDK_ROOT / "pdfedit" / "models.py"

#: `datamodel-codegen`'s arguments, bar `--input`/`--output` (which the
#: staleness test redirects). Quoted verbatim in the generated file's header.
CODEGEN_FLAGS = [
    "--input-file-type",
    "openapi",
    "--output-model-type",
    "dataclasses.dataclass",
    "--target-python-version",
    "3.10",
    "--disable-timestamp",
    "--formatters",
    "builtin",
]


def _relative(path: Path) -> str:
    """`path` as a repo-root-relative POSIX path, for the quoted command."""
    try:
        return path.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:  # pragma: no cover -- only if the tree is moved
        return path.as_posix()


def command_line() -> str:
    """The exact `datamodel-codegen` invocation, as the header quotes it."""
    parts = [
        "datamodel-codegen",
        "--input",
        _relative(OPENAPI_PATH),
        *CODEGEN_FLAGS,
        "--output",
        _relative(OUTPUT_PATH),
    ]
    return " ".join(shlex.quote(part) for part in parts)


def header() -> str:
    """The DO-NOT-EDIT banner prepended to the generated module."""
    return (
        '"""Models generated from the gateway\'s OpenAPI schema. DO NOT EDIT.\n'
        "\n"
        "Regenerate from the repository root with::\n"
        "\n"
        "    python sdk/python/generate.py\n"
        "\n"
        "which prepends this docstring to the output of::\n"
        "\n"
        f"    {command_line()}\n"
        "\n"
        "Hand edits are not merely discouraged: ``tests/test_models_generated.py``\n"
        "re-runs the command above and fails if this file differs from it.\n"
        '"""\n'
    )


def codegen(output: Path, openapi: Path = OPENAPI_PATH) -> None:
    """Run `datamodel-codegen` into `output`."""
    subprocess.run(
        [
            sys.executable,
            "-m",
            "datamodel_code_generator",
            "--input",
            str(openapi),
            *CODEGEN_FLAGS,
            "--output",
            str(output),
        ],
        check=True,
        capture_output=True,
    )


def generate_source(openapi: Path = OPENAPI_PATH) -> str:
    """The full text of `pdfedit/models.py`: the header, then the models.

    Newlines are `\\n` throughout, whatever the platform, so the committed
    file and a fresh run compare byte for byte.
    """
    with tempfile.TemporaryDirectory() as directory:
        output = Path(directory) / "models.py"
        codegen(output, openapi)
        body = output.read_text(encoding="utf-8")
    return header() + "\n" + body.replace("\r\n", "\n")


def main() -> int:
    source = generate_source()
    OUTPUT_PATH.write_text(source, encoding="utf-8", newline="\n")
    print(f"wrote {_relative(OUTPUT_PATH)} ({len(source)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
