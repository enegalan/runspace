//go:build ignore

package main

import (
	"os"
	"os/exec"
)

func main() {
	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", "{{skeleton_root}}")
	os.Setenv("RUNSPACE_WORKSPACE", "{{workspace_path}}")
	os.Setenv("RUNSPACE_ENTRY_PATH", "{{entry_file}}")

	cmd := exec.Command(
		"{{go_path}}",
		"run",
		"-modfile={{skeleton_root}}/go.mod",
		"{{entry_file}}",
	)
	cmd.Dir = "{{workspace_path}}"
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	skeletonRoot := `{{skeleton_root}}`
	entryPath := `{{entry_file}}`
	goPath := `{{go_path}}`

	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot)
	os.Setenv("RUNSPACE_ENTRY_PATH", entryPath)

	cmd := exec.Command(goPath, "run", "-mod=vendor", entryPath)
	cmd.Dir = skeletonRoot
	cmd.Env = os.Environ()

	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
		panic(err)
	}
}
