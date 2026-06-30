from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "rebar.lock").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    pkg = cfg["rebarPackage"]
    (src / "rebar.config").write_text(
        f'{{erl_opts, [debug_info]}}.\n{{deps, [{{{pkg}, "{cfg["versionConstraint"]}"}}]}}.\n', encoding="utf-8")
    run(["rebar3", "compile"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "rebar.lock").is_file()
