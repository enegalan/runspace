from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "pom.xml").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    params = urllib.parse.urlencode({"g": cfg["groupId"], "a": cfg["artifactId"], "e": cfg["extensions"]})
    extract_zip(fetch_zip(f"https://code.quarkus.io/api/download?{params}"), src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "pom.xml").is_file()
