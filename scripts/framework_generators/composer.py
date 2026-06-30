from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._composer import finalize_sandbox
from framework_generators._lib import *

def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "vendor").is_dir():
        return
    if not shutil.which("composer"):
        raise SystemExit("composer is required")
    rm_tree(src)
    args = ["composer", "create-project"]
    if cfg.get("stability") == "dev":
        args.extend(["-s", "dev"])
    if "ignore-platform-reqs" in cfg.get("composerFlags", ""):
        args.append("--ignore-platform-reqs")
    project, version = cfg["createProject"], cfg["versionConstraint"]
    run([*args, project, str(src), version, "--no-interaction"])
    for pkg in cfg.get("extraPackages", []):
        run(["composer", "require", pkg, "--no-interaction"], cwd=src)
    finalize_sandbox(fw_id, src, cfg)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "vendor").is_dir()
