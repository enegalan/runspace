from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "node_modules").is_dir():
        return
    if not shutil.which("npm"):
        raise SystemExit("npm is required")
    rm_tree(src)
    src.mkdir(parents=True)
    version = cfg["versionConstraint"]
    run(["npm", "init", "-y", "--scope=runspace"], cwd=src)
    run(["npm", "pkg", "set", f"name=@runspace/{fw_id}-sandbox",
        f"description=Internal {fw_id} sandbox for Runspace", "private=true"], cwd=src)
    if cfg.get("npmInstall"):
        specs = [render(spec, cfg) for spec in cfg["npmInstall"]]
        run(["npm", "install", *specs, "--save"], cwd=src)
    else:
        run(["npm", "install", f"{cfg['npmPackage']}@{version}", "--save"], cwd=src)
        for pkg in cfg.get("extraNpmPackages", []):
            run(["npm", "install", render(pkg, cfg), "--save"], cwd=src)
    for key, value in (cfg.get("npmPkgSet") or {}).items():
        run(["npm", "pkg", "set", f"{key}={value}"], cwd=src)
    write_generated(src, cfg)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "node_modules").is_dir()
