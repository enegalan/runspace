package main

import (
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	skeletonRoot := "{{skeleton_root}}"
	entryPath := "{{entry_file}}"
	workspacePath := "{{workspace_path}}"
	goPath := "{{go_path}}"

	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot)
	os.Setenv("RUNSPACE_ENTRY_PATH", entryPath)
	os.Setenv("RUNSPACE_WORKSPACE", workspacePath)

	if err := syncModuleFiles(skeletonRoot, workspacePath); err != nil {
		os.Exit(1)
	}

	download := exec.Command(goPath, "mod", "download")
	download.Dir = workspacePath
	download.Env = os.Environ()
	download.Stdout = os.Stdout
	download.Stderr = os.Stderr
	if err := download.Run(); err != nil {
		os.Exit(1)
	}

	run := exec.Command(goPath, "run", entryPath)
	run.Dir = workspacePath
	run.Env = os.Environ()
	run.Stdout = os.Stdout
	run.Stderr = os.Stderr
	run.Stdin = os.Stdin
	if err := run.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
	}
}

func syncModuleFiles(skeletonRoot, workspacePath string) error {
	for _, name := range []string{"go.mod", "go.sum"} {
		src := filepath.Join(skeletonRoot, name)
		dst := filepath.Join(workspacePath, name)
		if err := copyFile(src, dst); err != nil {
			return err
		}
	}
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}

	return out.Close()
}
