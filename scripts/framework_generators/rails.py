from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / ".bundle").is_dir():
        return
    version = cfg["railsVersion"]
    rm_tree(src)
    run(["gem", "install", "rails", "-v", version, "--no-document"])
    run(["rails", "new", str(src),
        "--skip-git", "--database=sqlite3", "--skip-test", "--skip-system-test",
        "--skip-javascript", "--skip-hotwire", "--skip-asset-pipeline",
        "--skip-action-mailbox", "--skip-action-text", "--minimal", "--skip-bundle", "--force"])
    run(["bundle", "config", "set", "--local", "path", "vendor/bundle"], cwd=src)
    run(["bundle", "install"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / ".bundle").is_dir()
