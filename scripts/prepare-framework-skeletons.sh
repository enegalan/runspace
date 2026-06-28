#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
NANCY_SRC="$GEN/nancy"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
NANCY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nancy"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
NANCY_VERSION="${RUNSPACE_NANCY_VERSION:-2.0.0}"
NANCY_OWIN_VERSION="${RUNSPACE_NANCY_OWIN_VERSION:-3.1.2}"
NANCY_ROSLYN_VERSION="${RUNSPACE_NANCY_ROSLYN_VERSION:-4.14.0}"

laravel_ready() {
    [[ -f "$LARAVEL_DEST/artisan" ]] &&
        [[ -f "$LARAVEL_DEST/composer.lock" ]] &&
        [[ -f "$LARAVEL_DEST/skeleton.version" ]]
}

symfony_ready() {
    [[ -f "$SYMFONY_DEST/bin/console" ]] &&
        [[ -f "$SYMFONY_DEST/composer.lock" ]] &&
        [[ -f "$SYMFONY_DEST/skeleton.version" ]]
}

express_ready() {
    [[ -f "$EXPRESS_DEST/package.json" ]] &&
        [[ -f "$EXPRESS_DEST/package-lock.json" ]] &&
        [[ -f "$EXPRESS_DEST/skeleton.version" ]]
}

nancy_ready() {
    [[ -f "$NANCY_DEST/RunspaceNancySandbox.csproj" ]] &&
        [[ -f "$NANCY_DEST/Program.cs" ]] &&
        [[ -f "$NANCY_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_nancy=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! nancy_ready; then
    needs_nancy=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_nancy; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer is required to prepare Laravel/Symfony skeletons." >&2
    echo "Install Composer or set its path in Settings, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_express && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express skeleton." >&2
    exit 1
fi

if $needs_nancy && ! command -v dotnet >/dev/null 2>&1; then
    echo "The .NET SDK is required to prepare the Nancy skeleton." >&2
    exit 1
fi

mkdir -p "$GEN"

if $needs_laravel && [[ ! -d "$LARAVEL_SRC/vendor" ]]; then
    echo "Generating Laravel skeleton..."
    rm -rf "$LARAVEL_SRC"
    composer create-project "$LARAVEL_PROJECT" "$LARAVEL_SRC" "$LARAVEL_VERSION" --no-interaction
fi

if $needs_symfony && [[ ! -d "$SYMFONY_SRC/vendor" ]]; then
    echo "Generating Symfony skeleton..."
    rm -rf "$SYMFONY_SRC"
    composer create-project "$SYMFONY_PROJECT" "$SYMFONY_SRC" "$SYMFONY_VERSION" --no-interaction
    (cd "$SYMFONY_SRC" && composer require webapp --no-interaction)
fi

if $needs_express && [[ ! -d "$EXPRESS_SRC/node_modules" ]]; then
    echo "Generating Express skeleton..."
    rm -rf "$EXPRESS_SRC"
    mkdir -p "$EXPRESS_SRC"
    (
        cd "$EXPRESS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/express-sandbox"
        npm pkg set description="Internal Express sandbox for Runspace"
        npm pkg set private=true
        npm install "express@${EXPRESS_VERSION}" --save
    )
fi

if $needs_nancy && [[ ! -f "$NANCY_SRC/obj/project.assets.json" ]]; then
    echo "Generating Nancy skeleton..."
    rm -rf "$NANCY_SRC"
    mkdir -p "$NANCY_SRC"
    (
        cd "$NANCY_SRC"
        dotnet new web -n RunspaceNancySandbox -o . --force
        dotnet add package Nancy --version "${NANCY_VERSION}"
        dotnet add package Microsoft.AspNetCore.Owin --version "${NANCY_OWIN_VERSION}"
        dotnet add package Microsoft.CodeAnalysis.CSharp --version "${NANCY_ROSLYN_VERSION}"
        cat > Program.cs <<'EOF'
using System.Reflection;
using System.Runtime.Loader;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Nancy.Owin;

var entryPath = Environment.GetEnvironmentVariable("RUNSPACE_ENTRY_PATH");
if (!string.IsNullOrWhiteSpace(entryPath) && File.Exists(entryPath))
{
    var refs = ((string?)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES"))
        ?.Split(Path.PathSeparator)
        .Select(path => MetadataReference.CreateFromFile(path))
        .Cast<MetadataReference>()
        .ToArray() ?? Array.Empty<MetadataReference>();

    var compilation = CSharpCompilation.Create(
        $"RunspaceEntry_{Guid.NewGuid():N}",
        new[] { CSharpSyntaxTree.ParseText(File.ReadAllText(entryPath), path: entryPath) },
        refs,
        new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

    using var ms = new MemoryStream();
    var emit = compilation.Emit(ms);
    if (!emit.Success)
    {
        foreach (var diagnostic in emit.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error))
        {
            Console.Error.WriteLine(diagnostic);
        }

        Environment.Exit(1);
    }

    ms.Position = 0;
    AssemblyLoadContext.Default.LoadFromStream(ms);
}

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.AllowSynchronousIO = true;
});
var app = builder.Build();
app.UseOwin(pipeline => pipeline.UseNancy());
app.Run();
EOF
        dotnet restore
    )
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
