from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

from framework_generators._lib import *
from framework_generators._pip import install_site_packages, python_bin


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "manage.py").is_file():
        return
    py = python_bin()
    rm_tree(src)
    src.mkdir(parents=True)
    install_site_packages(src, cfg)
    env = {**os.environ, "PYTHONPATH": str(src / "site-packages")}
    subprocess.run([py, "-m", "django", "startproject", cfg["projectName"], "."], cwd=src, env=env, check=True)
    with (src / "requirements.txt").open("w") as handle:
        subprocess.run([py, "-m", "pip", "freeze", "--path", "site-packages"], cwd=src, stdout=handle, check=True)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "manage.py").is_file()
