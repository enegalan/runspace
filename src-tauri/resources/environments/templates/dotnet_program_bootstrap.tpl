using System.Diagnostics;

Environment.SetEnvironmentVariable("RUNSPACE_FRAMEWORK_ROOT", "{{skeleton_root}}");
Environment.SetEnvironmentVariable("RUNSPACE_ENTRY_PATH", "{{entry_file}}");

var skeletonRoot = "{{skeleton_root}}";
var entryPath = "{{entry_file}}";
var dotnetPath = "{{dotnet_path}}";
var programCs = Path.Combine(skeletonRoot, "Program.cs");
var backupPath = Path.Combine(skeletonRoot, ".runspace_program.cs.bak");

if (File.Exists(backupPath))
{
    File.Copy(backupPath, programCs, overwrite: true);
    File.Delete(backupPath);
}

File.Move(programCs, backupPath);
var exitCode = 1;
try
{
    File.Copy(entryPath, programCs, overwrite: true);

    var startInfo = new ProcessStartInfo(dotnetPath)
    {
        WorkingDirectory = skeletonRoot,
        UseShellExecute = false,
    };
    startInfo.ArgumentList.Add("run");
    startInfo.ArgumentList.Add("--no-launch-profile");

    using var process = Process.Start(startInfo)!;
    await process.WaitForExitAsync();
    exitCode = process.ExitCode;
}
finally
{
    if (File.Exists(backupPath))
    {
        File.Copy(backupPath, programCs, overwrite: true);
        File.Delete(backupPath);
    }
}

Environment.Exit(exitCode);
