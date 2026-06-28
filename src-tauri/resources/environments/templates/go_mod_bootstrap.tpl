package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	skeletonRoot := "{{skeleton_root}}"
	entryFile := "{{entry_file}}"
	goBin := "{{go_path}}"
	modfile := filepath.Join(skeletonRoot, "go.mod")

	cmd := exec.Command(goBin, "run", "-mod=vendor", "-modfile", modfile, entryFile)
	cmd.Dir = skeletonRoot
	cmd.Env = os.Environ()
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
