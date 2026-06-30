from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *
from framework_generators._pip import install_site_packages


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "site-packages").is_dir():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    install_site_packages(src, cfg)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "site-packages").is_dir()
