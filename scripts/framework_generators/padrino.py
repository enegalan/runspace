from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "Gemfile.lock").is_file():
        return
    project = "runspace_padrino_sandbox"
    rm_tree(src)
    rm_tree(GEN / project)
    run(["padrino", "g", "project", project, "-b", "-i", "-a", "sqlite", "-d", "activerecord"], cwd=GEN)
    shutil.move(str(GEN / project), str(src))


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Gemfile.lock").is_file()
