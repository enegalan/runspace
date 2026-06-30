from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if not shutil.which("dotnet"):
        raise SystemExit(".NET SDK is required")
    if (src / "obj/project.assets.json").is_file():
        return
    rm_tree(src)
    project = cfg.get("projectName", f"Runspace{fw_id.title()}Sandbox")
    run(["dotnet", "new", cfg["dotnetTemplate"], "-o", str(src), "-n", project, "--no-restore"])
    run(["dotnet", "restore"], cwd=src)
    for pkg in [cfg.get("scriptingPackage"), *(cfg.get("dotnetPackages") or [])]:
        if pkg:
            run(["dotnet", "add", "package", pkg], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "obj/project.assets.json").is_file()
