from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "Gemfile.lock").is_file() or (src / ".bundle").is_dir():
        return
    gem, version = cfg.get("gem") or cfg.get("gemPackage"), cfg["versionConstraint"]
    rm_tree(src)
    src.mkdir(parents=True)
    run(["bundle", "init"], cwd=src)
    run(["bundle", "add", gem, "--version", version], cwd=src)
    run(["bundle", "config", "set", "--local", "path", "vendor/bundle"], cwd=src)
    run(["bundle", "install"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Gemfile.lock").is_file() or (src / ".bundle").is_dir()
