from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *


def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "Cargo.lock").is_file():
        return
    if not shutil.which("cargo"):
        raise SystemExit("cargo is required")
    rm_tree(src)
    name = f"runspace-{fw_id}-sandbox"
    src.mkdir(parents=True)
    crate = cfg.get("cargoCrate") or cfg.get("cargoPackage") or cfg.get("crate", fw_id)
    version = cfg.get("versionConstraint") or cfg.get("version")
    run(["cargo", "init", "--name", name, "--bin"], cwd=src)
    run(["cargo", "add", f"{crate}@{version}"], cwd=src)
    for extra in cfg.get("cargoExtras", []):
        run(["cargo", "add", *extra.split()], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Cargo.lock").is_file()
