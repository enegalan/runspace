from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "build/runspace-deps.ready").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    ktor = TPL / "ktor-skeleton"
    for name in ("build.gradle.kts", "settings.gradle.kts", "gradle.properties"):
        shutil.copy(ktor / name, src / name)
    run(["gradle", "wrapper", f"--gradle-version={cfg['gradleVersion']}"], cwd=src)
    run(["./gradlew", "runspaceResolveDeps", "--quiet", "--console=plain"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "build/runspace-deps.ready").is_file()
