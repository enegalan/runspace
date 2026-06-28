package main

import (
	"io"
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
	entryPath := "{{entry_file}}"
	workspacePath := "{{workspace_path}}"
	goBinary := "{{go_path}}"

	os.Setenv("RUNSPACE_FRAMEWORK_ROOT", skeletonRoot)
	os.Setenv("RUNSPACE_ENTRY_PATH", entryFile)
	os.Setenv("RUNSPACE_WORKSPACE", workspacePath)
	os.Setenv("GOMOD", filepath.Join(skeletonRoot, "go.mod"))
	os.Setenv("GOFLAGS", "-mod=vendor")

	cmd := exec.Command(goBinary, "run", entryFile)
	cmd.Dir = workspacePath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	entryPath := "{{entry_file}}"
	goPath := "{{go_path}}"

	os.Setenv("RUNSPACE_ENTRY_PATH", entryPath)

	if err := syncModuleFiles(skeletonRoot, workspacePath); err != nil {
		os.Exit(1)
	}

	download := exec.Command(goPath, "mod", "download")
	download.Dir = workspacePath
	download.Env = os.Environ()
	download.Stdout = os.Stdout
	download.Stderr = os.Stderr
	if err := download.Run(); err != nil {

	run := exec.Command(goPath, "run", entryPath)
	run.Dir = workspacePath
	run.Env = os.Environ()
	run.Stdout = os.Stdout
	run.Stderr = os.Stderr
	run.Stdin = os.Stdin
	if err := run.Run(); err != nil {
//go:build ignore



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
	skeletonRoot := `{{skeleton_root}}`
	entryPath := `{{entry_file}}`
	goPath := `{{go_path}}`

	os.Setenv("RUNSPACE_ENTRY_PATH", entryPath)

	cmd := exec.Command(goPath, "run", "-mod=vendor", entryPath)

	if err := cmd.Run(); err != nil {
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
	return nil

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	defer in.Close()

	out, err := os.Create(dst)
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {

	return out.Close()
		panic(err)
