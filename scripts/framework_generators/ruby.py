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
    (src / "Gemfile").write_text(f'source "https://rubygems.org"\ngem "{gem}", "{version}"\n', encoding="utf-8")
    run(["bundle", "config", "set", "--local", "path", "vendor/bundle"], cwd=src)
    run(["bundle", "install"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Gemfile.lock").is_file() or (src / ".bundle").is_dir()
