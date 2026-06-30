from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "pom.xml").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    (src / "pom.xml").write_text(textwrap.dedent(f"""\
        <?xml version="1.0" encoding="UTF-8"?>
        <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
          <modelVersion>4.0.0</modelVersion>
          <groupId>com.runspace</groupId>
          <artifactId>vertx-sandbox</artifactId>
          <version>1.0.0-SNAPSHOT</version>
          <properties>
            <vertx.version>{cfg['vertxVersion']}</vertx.version>
            <maven.compiler.source>{cfg['javaVersion']}</maven.compiler.source>
            <maven.compiler.target>{cfg['javaVersion']}</maven.compiler.target>
          </properties>
          <dependencies>
            <dependency><groupId>io.vertx</groupId><artifactId>vertx-core</artifactId><version>${{vertx.version}}</version></dependency>
            <dependency><groupId>io.vertx</groupId><artifactId>vertx-web</artifactId><version>${{vertx.version}}</version></dependency>
          </dependencies>
        </project>
    """), encoding="utf-8")


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "pom.xml").is_file()
