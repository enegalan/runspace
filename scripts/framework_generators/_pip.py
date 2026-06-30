"""Shared helpers for pip-based layout generators (not auto-loaded)."""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Any


def python_bin() -> str:
    for name in ("python3", "python"):
        if shutil.which(name):
            return name
    raise SystemExit("python3 is required")


def pip_specs(cfg: dict[str, Any]) -> list[str]:
    pkg = cfg.get("pipPackage", "")
    version = cfg.get("versionConstraint", "")
    specs = []
    if pkg:
        specs.append(f"{pkg}{version}" if version else pkg)
    specs.extend(cfg.get("extraPackages", []))
    return specs


def pip_install_spec(cfg: dict[str, Any]) -> str:
    from framework_generators._lib import render

    pkg = cfg.get("pipPackage", "")
    version = cfg.get("versionConstraint", "")
    if cfg.get("pipInstall"):
        return render(cfg["pipInstall"][0], cfg)
    if version and not version.startswith(("~", "^", ">", "<")):
        return f"{pkg}=={version}"
    return f"{pkg}{version}"


def install_site_packages(src: Path, cfg: dict[str, Any]) -> None:
    from framework_generators._lib import run

    py = python_bin()
    run([py, "-m", "pip", "install", *pip_specs(cfg), "--target", "site-packages",
        "--no-warn-script-location", "--disable-pip-version-check"], cwd=src)


def venv_install(src: Path, cfg: dict[str, Any]) -> None:
    from framework_generators._lib import run

    py = python_bin()
    run([py, "-m", "venv", ".venv"], cwd=src)
    if cfg.get("pipInstall"):
        for spec in cfg["pipInstall"]:
            run([".venv/bin/pip", "install", render_spec(spec, cfg)], cwd=src)
    else:
        run([".venv/bin/pip", "install", pip_install_spec(cfg)], cwd=src)


def render_spec(spec: str, cfg: dict[str, Any]) -> str:
    from framework_generators._lib import render

    return render(spec, cfg)


def venv_freeze_requirements(src: Path) -> None:
    frozen = subprocess.run(
        [".venv/bin/pip", "freeze"], cwd=src, capture_output=True, text=True, check=True,
    )
    (src / "requirements.txt").write_text(frozen.stdout)


def vendor_from_venv(src: Path) -> None:
    from framework_generators._lib import run

    subprocess.run(
        [".venv/bin/pip", "freeze"], cwd=src, check=True,
        stdout=(src / "requirements.lock").open("w"),
    )
    run([".venv/bin/pip", "install", "-r", "requirements.lock", "--target", "vendor"], cwd=src)
