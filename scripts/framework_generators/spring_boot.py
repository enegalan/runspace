from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "pom.xml").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    params = urllib.parse.urlencode({
        "type": "maven-project", "language": "java", "bootVersion": cfg["bootVersion"],
        "baseDir": ".", "groupId": "com.runspace", "artifactId": "spring-boot-sandbox",
        "name": "runspace-spring-boot-sandbox", "packageName": "com.runspace.sandbox",
        "javaVersion": cfg["javaVersion"], "dependencies": cfg.get("dependencies", "web"),
    })
    extract_zip(fetch_zip(f"https://start.spring.io/starter.zip?{params}"), src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "pom.xml").is_file()
