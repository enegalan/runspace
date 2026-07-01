from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "go.mod").is_file():
        return
    if not shutil.which("go"):
        raise SystemExit("go is required")
    rm_tree(src)
    src.mkdir(parents=True)
    write_generated(src, cfg)
    package = cfg.get("goPackage", cfg.get("goModule", "runspace/sandbox"))
    module = cfg.get("goModule", f"runspace/{fw_id}-sandbox")
    if module == package:
        module = f"runspace/{fw_id}-sandbox"
    run(["go", "mod", "init", module], cwd=src)
    run(["go", "get", f"{package}@{cfg['versionConstraint']}"], cwd=src)
    run(["go", "mod", "vendor" if cfg.get("goVendor") else "tidy"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    path = src / "go.sum"
    return path.is_file() and path.stat().st_size > 0
