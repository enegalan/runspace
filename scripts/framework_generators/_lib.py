"""Shared helpers for framework generators."""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import textwrap
import urllib.parse
import zipfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
TPL = ROOT / "scripts/templates"
GEN = Path(os.environ.get("RUNSPACE_SKELETON_GEN", "/tmp/runspace-skeleton-gen"))


def run(cmd: list[str], *, cwd: Path | None = None, check: bool = True) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=check)


def rm_tree(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)


def render(text: str, cfg: dict[str, Any]) -> str:
    out = text.replace("{versionConstraint}", str(cfg.get("versionConstraint", "")))
    for key, value in cfg.items():
        if isinstance(value, str):
            out = out.replace(f"{{{key}}}", value)
    return out


def write_tpl(dest: Path, tpl_rel: str, cfg: dict[str, Any]) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(render((TPL / tpl_rel).read_text(encoding="utf-8"), cfg), encoding="utf-8")


def write_generated(src: Path, cfg: dict[str, Any]) -> None:
    for rel, tpl in (cfg.get("generateFiles") or {}).items():
        write_tpl(src / rel, f"generate/{tpl}", cfg)
    if cfg.get("appTemplate"):
        write_tpl(src / "app.py", f"generate/{cfg['appTemplate']}", cfg)


def fetch_zip(url: str) -> Path:
    path = GEN / "download.zip"
    subprocess.run(["curl", "-sSfLo", str(path), url], check=True)
    return path


def extract_zip(zip_path: Path, dest: Path) -> None:
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(dest)
    zip_path.unlink(missing_ok=True)
