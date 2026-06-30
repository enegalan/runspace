"""Auto-discovered framework generators."""
from __future__ import annotations

import importlib
import pkgutil
from collections.abc import Callable
from pathlib import Path
from typing import Any

GenerateFn = Callable[[str, Path, dict[str, Any]], None]
SyncReadyFn = Callable[[Path, dict[str, Any]], bool]


def load() -> tuple[dict[str, GenerateFn], dict[str, SyncReadyFn]]:
    import framework_generators as package

    gens: dict[str, GenerateFn] = {}
    ready: dict[str, SyncReadyFn] = {}
    for info in pkgutil.iter_modules(package.__path__):
        if info.name.startswith("_"):
            continue
        mod = importlib.import_module(f"framework_generators.{info.name}")
        generate = getattr(mod, "generate", None)
        sync_ready = getattr(mod, "sync_ready", None)
        if not callable(generate):
            raise ImportError(f"framework_generators/{info.name}.py must export generate()")
        if not callable(sync_ready):
            raise ImportError(f"framework_generators/{info.name}.py must export sync_ready()")
        key = info.name.replace("_", "-")
        gens[key] = generate
        ready[key] = sync_ready
    return gens, ready
