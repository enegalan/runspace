"""Shared helpers for composer-based generators (not auto-loaded)."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def finalize_sandbox(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    from framework_generators._lib import run

    data = json.loads((src / "composer.json").read_text(encoding="utf-8"))
    data["name"] = f"runspace/{fw_id}-sandbox"
    data["description"] = f"Internal {fw_id} sandbox for Runspace"
    (src / "composer.json").write_text(json.dumps(data, indent=4) + "\n", encoding="utf-8")
    flags = ["update", "--lock", "--no-install", "--no-interaction"]
    if "ignore-platform-reqs" in cfg.get("composerFlags", ""):
        flags.append("--ignore-platform-reqs")
    run(["composer", *flags], cwd=src)
