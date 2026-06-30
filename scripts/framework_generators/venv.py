from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *
from framework_generators._pip import venv_freeze_requirements, venv_install


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "requirements.txt").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    venv_install(src, cfg)
    venv_freeze_requirements(src)
    write_generated(src, cfg)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "requirements.txt").is_file()
