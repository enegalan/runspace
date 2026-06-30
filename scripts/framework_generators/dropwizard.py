from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "pom.xml").is_file():
        return
    work = GEN / "dropwizard-gen"
    rm_tree(work)
    work.mkdir()
    run(["mvn", "-B", "archetype:generate",
        "-DarchetypeGroupId=io.dropwizard.archetypes", "-DarchetypeArtifactId=java-simple",
        f"-DarchetypeVersion={cfg['archetypeVersion']}",
        "-DgroupId=com.runspace", "-DartifactId=sandbox", "-Dversion=1.0-SNAPSHOT",
        "-Dpackage=com.runspace.sandbox", "-Dname=RunspaceSandbox", "-DinteractiveMode=false"], cwd=work)
    shutil.move(str(work / "sandbox"), str(src))
    rm_tree(work)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "pom.xml").is_file()
