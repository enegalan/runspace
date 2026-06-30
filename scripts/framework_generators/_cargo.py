"""Shared helpers for cargo-based generators (not auto-loaded)."""
from __future__ import annotations

import json
from typing import Any


def cargo_dep(cfg: dict[str, Any], fallback: str) -> str:
    if cfg.get("cargoDependency"):
        return str(cfg["cargoDependency"])
    crate = cfg.get("cargoCrate") or cfg.get("cargoPackage") or cfg.get("crate", fallback)
    version = cfg.get("versionConstraint") or cfg.get("version", "")
    if cfg.get("features"):
        return f'{crate} = {{ version = "{version}", features = {json.dumps(cfg["features"])} }}'
    return f'{crate} = "{version}"'
