#!/usr/bin/env python3
"""Generate and sync framework skeletons.

Registry entry: src-tauri/resources/framework-registry/<id>.json
Generator:      scripts/framework_generators/<name>.py
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from framework_generators import load as load_generators
from framework_generators._lib import GEN, write_tpl

ROOT = SCRIPTS.parent
REGISTRY = ROOT / "src-tauri/resources/framework-registry"
FRAMEWORKS = ROOT / "src-tauri/resources/frameworks"
ENVIRONMENTS = ROOT / "src-tauri/resources/environments"

GENERATORS, SYNC_READY = load_generators()


def load_manifest() -> dict[str, Any]:
    meta = json.loads((REGISTRY / "manifest.meta.json").read_text(encoding="utf-8"))
    frameworks = {
        p.stem: json.loads(p.read_text(encoding="utf-8"))
        for p in sorted(REGISTRY.glob("*.json"))
        if p.name != "manifest.meta.json"
    }
    if not frameworks:
        raise SystemExit(f"No entries in {REGISTRY}")
    return {"skeletonVersion": meta["skeletonVersion"], "frameworks": frameworks}


def dest_dir(fw_id: str) -> Path:
    user = os.environ.get("RUNSPACE_USER_FRAMEWORKS_DIR")
    base = Path(user) if user else FRAMEWORKS
    return base / fw_id


def requested_ids(manifest: dict[str, Any]) -> list[str]:
    raw = os.environ.get("RUNSPACE_FRAMEWORKS", "").strip()
    if not raw:
        return sorted(manifest["frameworks"])
    known = set(manifest["frameworks"])
    ids = [p for p in re.split(r"[\s,]+", raw) if p]
    unknown = [p for p in ids if p not in known]
    if unknown:
        raise SystemExit(f"Unknown framework skeleton: {', '.join(unknown)}")
    return ids


def needed_ids(manifest: dict[str, Any]) -> list[str]:
    ids = requested_ids(manifest)
    if os.environ.get("RUNSPACE_FORCE_FRAMEWORK_SYNC") == "1":
        return ids
    return [fid for fid in ids if not (dest_dir(fid) / "skeleton.version").is_file()]


def sync_excludes(fw_id: str) -> list[str]:
    """From environments/<id>.json skeleton — same rules as runtime sync in the app."""
    path = ENVIRONMENTS / f"{fw_id}.json"
    if not path.is_file():
        return [".git/"]
    skeleton = json.loads(path.read_text(encoding="utf-8")).get("skeleton") or {}
    excludes = [".git/"]
    for name in skeleton.get("sync_exclude_dirs", []):
        excludes.append(name if name.endswith("/") else f"{name}/")
    excludes.extend(skeleton.get("sync_exclude_files", []))
    return excludes


def apply_sync(src: Path, cfg: dict[str, Any]) -> None:
    sync = cfg.get("sync") or {}
    for item in sync.get("regex", []):
        path = src / item["file"]
        if not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        content = re.sub(item["pattern"], item["replace"], content, flags=re.M)
        path.write_text(content, encoding="utf-8")
    prepend = sync.get("prependIfMissing")
    if prepend:
        path = src / prepend["file"]
        if path.is_file() and prepend.get("marker") not in path.read_text(encoding="utf-8"):
            path.write_text(prepend["text"] + path.read_text(encoding="utf-8"), encoding="utf-8")
    for rel, tpl in (sync.get("files") or {}).items():
        write_tpl(src / rel, f"sync/{tpl}", cfg)


def rsync(src: Path, dest: Path, excludes: list[str] | None = None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if shutil.which("rsync"):
        args = ["rsync", "-a", "--delete"]
        for ex in excludes or []:
            args.extend(["--exclude", ex])
        subprocess.run([*args, f"{src}/", f"{dest}/"], check=True)
    else:
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(src, dest, dirs_exist_ok=True)


def generate(fw_id: str, cfg: dict[str, Any]) -> None:
    kind = cfg["generator"]
    fn = GENERATORS.get(kind)
    if not fn:
        known = ", ".join(sorted(GENERATORS))
        raise SystemExit(f"No generator '{kind}' for {fw_id} (available: {known})")
    print(f"Generating {fw_id} ({kind})...")
    fn(fw_id, GEN / fw_id, cfg)


def sync_one(fw_id: str, src: Path, dest: Path, version: str, cfg: dict[str, Any]) -> bool:
    ready_fn = SYNC_READY.get(cfg["generator"])
    if not ready_fn or not ready_fn(src, cfg):
        return False
    apply_sync(src, cfg)
    rsync(src, dest, sync_excludes(fw_id))
    (dest / "skeleton.version").write_text(f"{version}\n", encoding="utf-8")
    return True


def main() -> int:
    manifest = load_manifest()
    GEN.mkdir(parents=True, exist_ok=True)
    version = str(manifest["skeletonVersion"])

    to_build = needed_ids(manifest)
    if not to_build:
        print("Framework skeletons already present; skipping generation.")
        return 0

    print("Preparing:", ", ".join(to_build))
    for fw_id in to_build:
        generate(fw_id, manifest["frameworks"][fw_id])

    synced = [
        fw_id for fw_id in requested_ids(manifest)
        if sync_one(fw_id, GEN / fw_id, dest_dir(fw_id), version, manifest["frameworks"][fw_id])
    ]
    if not synced:
        print("No framework skeletons found to sync.", file=sys.stderr)
        return 1
    print(f"Synced {', '.join(synced)} skeletons (version {version}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
