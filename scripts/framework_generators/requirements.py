from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "requirements.txt").is_file():
        return
    pkg = cfg.get("pipPackage", "")
    version = cfg.get("versionConstraint", "")
    rm_tree(src)
    src.mkdir(parents=True)
    (src / "requirements.txt").write_text(f"{pkg}{version}\n", encoding="utf-8")


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "requirements.txt").is_file()
