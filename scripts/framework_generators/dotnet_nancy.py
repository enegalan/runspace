from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "obj/project.assets.json").is_file():
        return
    if not shutil.which("dotnet"):
        raise SystemExit(".NET SDK is required")
    rm_tree(src)
    src.mkdir(parents=True)
    project = cfg.get("projectName", "RunspaceNancySandbox")
    run(["dotnet", "new", "web", "-n", project, "-o", ".", "--force"], cwd=src)
    for pkg, ver in (("Nancy", cfg["nancyVersion"]), ("Microsoft.AspNetCore.Owin", cfg["owinVersion"]),
                     ("Microsoft.CodeAnalysis.CSharp", cfg["roslynVersion"])):
        run(["dotnet", "add", "package", pkg, "--version", ver], cwd=src)
    run(["dotnet", "restore"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "obj/project.assets.json").is_file()
