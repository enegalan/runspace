from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / ".bundle").is_dir():
        return
    rm_tree(src)
    tmp = GEN / "runspace_hanami"
    rm_tree(tmp)
    run(["hanami", "new", "runspace_hanami", "--database=sqlite"], cwd=GEN)
    shutil.move(str(tmp), str(src))
    run(["bundle", "config", "set", "--local", "path", "vendor/bundle"], cwd=src)
    run(["bundle", "install"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / ".bundle").is_dir()
