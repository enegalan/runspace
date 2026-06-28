Environment.SetEnvironmentVariable("RUNSPACE_FRAMEWORK_ROOT", "{{skeleton_root}}");
Environment.SetEnvironmentVariable("RUNSPACE_ENTRY_PATH", "{{entry_file}}");

var startInfo = new System.Diagnostics.ProcessStartInfo
{
    FileName = "{{dotnet_path}}",
    Arguments = "run --project \"{{skeleton_root}}\"",
    WorkingDirectory = "{{skeleton_root}}",
    UseShellExecute = false,
};

using var process = System.Diagnostics.Process.Start(startInfo)
    ?? throw new System.InvalidOperationException("Failed to start the Nancy host.");
process.WaitForExit();
Environment.Exit(process.ExitCode);
