from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *
from framework_generators._pip import vendor_from_venv, venv_install


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "vendor").is_dir():
        return
    pkg = cfg.get("pipPackage", "")
    version = cfg.get("versionConstraint", "")
    rm_tree(src)
    src.mkdir(parents=True)
    (src / "requirements.txt").write_text(f"{pkg}{version}\n", encoding="utf-8")
    venv_install(src, cfg)
    vendor_from_venv(src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "vendor").is_dir()
