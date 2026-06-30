from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

# cookie 0.16.x fails to build against time >= 0.3.48 (rwf2/cookie-rs#251).
TIME_PIN = "=0.3.47"


def generate(fw_id: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "Cargo.lock").is_file():
        return
    if not shutil.which("cargo"):
        raise SystemExit("cargo is required")
    rm_tree(src)
    name = f"runspace-{fw_id}-sandbox"
    crate, version = cfg.get("cargoPackage", fw_id), cfg["versionConstraint"]
    src.mkdir(parents=True)
    (src / "src/bin").mkdir(parents=True)
    (src / "Cargo.toml").write_text(textwrap.dedent(f"""\
        [package]
        name = "{name}"
        version = "0.1.0"
        edition = "2021"
        publish = false
        [dependencies]
        {crate} = "{version}"
        time = "{TIME_PIN}"
        tokio = {{ version = "1", features = ["macros", "rt-multi-thread", "net"] }}
        [[bin]]
        name = "runspace-entry"
        path = "src/bin/runspace_entry.rs"
    """), encoding="utf-8")
    (src / "build.rs").write_text(
        'fn main() {\n  let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| '
        'format!("{}/src/stub_entry.rs", std::env::var("CARGO_MANIFEST_DIR").unwrap()));\n  '
        'println!("cargo:rustc-env=RUNSPACE_ENTRY_PATH={entry}");\n}\n', encoding="utf-8")
    (src / "src/stub_entry.rs").write_text('fn main() { println!("Runspace sandbox"); }\n', encoding="utf-8")
    (src / "src/bin/runspace_entry.rs").write_text('include!(env!("RUNSPACE_ENTRY_PATH"));\n', encoding="utf-8")
    env = {**os.environ, "RUNSPACE_ENTRY_PATH": str(src / "src/stub_entry.rs")}
    subprocess.run(["cargo", "build", "--quiet", "--bin", "runspace-entry"], cwd=src, env=env, check=True)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "Cargo.lock").is_file()
