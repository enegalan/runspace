framework_root = "{{skeleton_root}}"
entry_path = "{{entry_file}}"

System.put_env("RUNSPACE_FRAMEWORK_ROOT", framework_root)
System.put_env("RUNSPACE_ENTRY_PATH", entry_path)

paths =
  Path.wildcard(Path.join(framework_root, "_build/dev/lib/*/ebin")) ++
    Path.wildcard(Path.join(framework_root, "deps/*/ebin"))

Enum.each(paths, &Code.append_path/1)

Code.require_file(entry_path)
