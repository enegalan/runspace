from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *


def _dep(name: str, version: str) -> str:
    return f'  {{{name}, "{version}"}}'


def _rebar_config(cfg: dict[str, Any]) -> str:
    pkg = cfg["rebarPackage"]
    version = cfg["versionConstraint"]
    deps = [_dep(*item) for item in cfg.get("rebarExtraDeps", [])]
    deps.append(_dep(pkg, version))
    lines = ["{erl_opts, [debug_info]}.", "{deps, [", ",\n".join(deps), "]}."]
    overrides = cfg.get("rebarOverrideDeps") or {}
    if overrides:
        override_lines = []
        for app, dep_names in overrides.items():
            dep_atoms = ", ".join(dep_names)
            override_lines.append(f"  {{override, {app}, [{{deps, [{dep_atoms}]}}]}}")
        lines.extend(["{overrides, [", ",\n".join(override_lines), "]}."])
    return "\n".join(lines) + "\n"


def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "rebar.lock").is_file():
        return
    rm_tree(src)
    src.mkdir(parents=True)
    (src / "rebar.config").write_text(_rebar_config(cfg), encoding="utf-8")
    run(["rebar3", "compile"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "rebar.lock").is_file()
