from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "lib/main.dart").is_file():
        return
    rm_tree(src)
    run(["flutter", "create", "--project-name", cfg["projectName"],
        "--template", cfg.get("template", "app"), str(src)])


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "lib/main.dart").is_file()
