using System.Diagnostics;

Environment.SetEnvironmentVariable("RUNSPACE_FRAMEWORK_ROOT", @"{{skeleton_root}}");
Environment.SetEnvironmentVariable("RUNSPACE_ENTRY_PATH", @"{{entry_file}}");

var startInfo = new ProcessStartInfo
{
    FileName = @"{{dotnet_path}}",
    WorkingDirectory = @"{{skeleton_root}}",
    UseShellExecute = false,
};
startInfo.ArgumentList.Add("run");
startInfo.ArgumentList.Add("--file");
startInfo.ArgumentList.Add(@"{{entry_file}}");

using var process = Process.Start(startInfo)
    ?? throw new InvalidOperationException("Failed to start dotnet");
process.WaitForExit();
Environment.Exit(process.ExitCode);
