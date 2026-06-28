var skeletonRoot = @"{{skeleton_root}}";
var entryPath = @"{{entry_file}}";
var dotnet = @"{{dotnet_path}}";

using var proc = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
{
    FileName = dotnet,
    Arguments = $"run --project \"{skeletonRoot}\"",
    WorkingDirectory = skeletonRoot,
    UseShellExecute = false,
    Environment =
    {
        ["RUNSPACE_FRAMEWORK_ROOT"] = skeletonRoot,
        ["RUNSPACE_ENTRY_PATH"] = entryPath,
    },
})!;

proc.WaitForExit();
Environment.Exit(proc.ExitCode);
