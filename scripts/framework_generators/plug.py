from __future__ import annotations

from pathlib import Path
from typing import Any

from framework_generators._lib import *

def generate(_: str, src: Path, cfg: dict[str, Any]) -> None:
    if (src / "mix.lock").is_file():
        return
    if not shutil.which("mix"):
        raise SystemExit("mix (Elixir) is required")
    rm_tree(src)
    run(["mix", "new", str(src), "--sup", "--app", "runspace_plug", "--module", "RunspacePlug"])
    mix_exs = (src / "mix.exs").read_text(encoding="utf-8")
    deps = f'defp deps do\n    [{{:plug, "{cfg["plugVersion"]}"}}, {{:bandit, "{cfg["serverVersion"]}"}}]\n  end'
    (src / "mix.exs").write_text(re.sub(r"defp deps do\s*\[\s*\]", deps, mix_exs, count=1), encoding="utf-8")
    run(["mix", "deps.get"], cwd=src)
    run(["mix", "compile"], cwd=src)


def sync_ready(src: Path, _: dict[str, Any]) -> bool:
    return (src / "mix.lock").is_file()
