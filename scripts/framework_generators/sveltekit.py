from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "node_modules").is_dir():
        return
    rm_tree(src)
    run(["npx", "sv", "create", str(src), "--template", cfg["template"], "--types", cfg["types"],
        "--no-add-ons", "--no-install", "--no-dir-check", "--no-download-check"])
    run(["npm", "pkg", "set", "name=@runspace/sveltekit-sandbox", "private=true"], cwd=src)
    run(["npm", "install", "--no-audit", "--no-fund"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "node_modules").is_dir()
