//go:build ignore

package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	skeletonRoot := `{{skeleton_root}}`
	entryFile := `{{entry_file}}`
	workspacePath := `{{workspace_path}}`

	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot)
	os.Setenv("RUNSPACE_ENTRY_PATH", entryFile)
	os.Setenv("RUNSPACE_WORKSPACE", workspacePath)

	modfile := filepath.Join(skeletonRoot, "go.mod")
	cmd := exec.Command(`{{go_path}}`, "run", "-modfile", modfile, entryFile)
	cmd.Dir = workspacePath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
	}
}
