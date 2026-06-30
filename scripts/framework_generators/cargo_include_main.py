from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._cargo import cargo_dep
from framework_generators._lib import *


def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "Cargo.lock").is_file():
        return
    if not shutil.which("cargo"):
        raise SystemExit("cargo is required")
    rm_tree(src)
    name = f"runspace-{fw_id}-sandbox"
    run(["cargo", "new", str(src), "--name", name.replace("-", "_"), "--bin"])
    (src / "Cargo.toml").write_text(textwrap.dedent(f"""\
        [package]
        name = "{name}"
        version = "0.1.0"
        edition = "2021"
        build = "build.rs"
        publish = false
        [[bin]]
        name = "runspace_entry"
        path = "src/main.rs"
        [dependencies]
        {cargo_dep(cfg, fw_id)}
        tokio = {{ version = "1", features = ["macros", "rt-multi-thread"] }}
    """), encoding="utf-8")
    (src / "build.rs").write_text(textwrap.dedent("""\
        fn main() {
            let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
                format!("{}/src/stub_entry.rs", std::env::var("CARGO_MANIFEST_DIR").unwrap())
            });
            println!("cargo:rustc-env=RUNSPACE_ENTRY={entry}");
        }
    """), encoding="utf-8")
    (src / "src/stub_entry.rs").write_text('fn main() { println!("Runspace sandbox"); }\n', encoding="utf-8")
    (src / "src/main.rs").write_text('include!(env!("RUNSPACE_ENTRY"));\n', encoding="utf-8")
    run(["cargo", "build", "--quiet"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Cargo.lock").is_file()
