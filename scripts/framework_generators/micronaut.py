from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "pom.xml").is_file():
        return
    rm_tree(src)
    url = (
        "https://launch.micronaut.io/create/default/runspace-sandbox"
        f"?build=maven&lang=java&test=junit&javaVersion={cfg['javaVersion']}"
        f"&micronautVersion={cfg['micronautVersion']}&packageName=com.runspace.sandbox"
    )
    extract = GEN / "micronaut-extract"
    rm_tree(extract)
    extract.mkdir()
    extract_zip(fetch_zip(url), extract)
    shutil.move(str(extract / "runspace-sandbox"), str(src))
    rm_tree(extract)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "pom.xml").is_file()
