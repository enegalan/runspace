//go:build ignore

package main

import (
	"os"
	"os/exec"
)

func main() {
	skeletonRoot := "{{skeleton_root}}"
	entryFile := "{{entry_file}}"

	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot)
	os.Setenv("RUNSPACE_ENTRY_PATH", entryFile)

	cmd := exec.Command("{{go_path}}", "run", "-mod=vendor", entryFile)
	cmd.Env = append(os.Environ(), "GOMOD="+skeletonRoot+"/go.mod")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	skeletonRoot := `{{skeleton_root}}`
	entryPath := `{{entry_file}}`
	goPath := `{{go_path}}`

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
