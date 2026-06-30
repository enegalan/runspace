using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace RunspaceAspNetSandbox;

public static class RunspaceEntryHost
{
    public static async Task RunAsync(string entryPath, string[] args)
    {
        var source = await File.ReadAllTextAsync(entryPath);
        var options = ScriptOptions.Default
            .AddReferences(
                typeof(Program).Assembly,
                typeof(WebApplication).Assembly)
            .AddImports(
                "System",
                "Microsoft.AspNetCore.Builder",
                "Microsoft.AspNetCore.Http",
                "Microsoft.AspNetCore.Hosting",
                "Microsoft.Extensions.DependencyInjection",
                "Microsoft.Extensions.Hosting");
        await CSharpScript.RunAsync(source, options);
    }
}
