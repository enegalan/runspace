using RunspaceAspNetSandbox;

var entryPath = Environment.GetEnvironmentVariable("RUNSPACE_ENTRY_PATH");
if (!string.IsNullOrEmpty(entryPath) && File.Exists(entryPath))
{
    await RunspaceEntryHost.RunAsync(entryPath, args);
    return;
}

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello World!");
app.Run();
