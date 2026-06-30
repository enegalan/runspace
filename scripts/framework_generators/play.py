from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "target/runspace-classpath").is_file():
        return
    rm_tree(src)
    (src / "project").mkdir(parents=True)
    (src / "build.sbt").write_text(textwrap.dedent(f"""\
        name := "runspace-play-sandbox"
        scalaVersion := "{cfg['scalaVersion']}"
        libraryDependencies += "org.playframework" %% "play" % "{cfg['playVersion']}"
    """), encoding="utf-8")
    (src / "project/plugins.sbt").write_text(f'addSbtPlugin("org.playframework" % "sbt-plugin" % "{cfg["playVersion"]}")\n', encoding="utf-8")
    (src / "project/build.properties").write_text(f"sbt.version={cfg['sbtVersion']}\n", encoding="utf-8")
    run(["sbt", "-batch", "update", "compile"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "target").is_dir()
