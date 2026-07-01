from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "mix.lock").is_file():
        return
    if not shutil.which("mix"):
        raise SystemExit("mix (Elixir) is required")
    rm_tree(src)
    run(["mix", "local.hex", "--force"])
    run(["mix", "archive.install", "hex", "phx_new", "--force"])
    run(["mix", "phx.new", str(src), "--no-install", "--app", "runspace_phoenix", "--database", "sqlite3", "--no-mailer"])
    run(["mix", "deps.get"], cwd=src)
    run(["mix", "compile"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "mix.lock").is_file()
