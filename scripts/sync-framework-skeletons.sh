#!/usr/bin/env bash
set -euo pipefail

# Syncs generated framework skeletons into src-tauri/resources/frameworks/.
# Prefer: npm run prepare:frameworks (generates + syncs automatically).

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${1:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
ASPNET_CORE_SRC="$GEN/aspnet-core"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
ASPNET_CORE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/aspnet-core"

RSYNC_EXCLUDES=(
    --exclude vendor/
    --exclude node_modules/
    --exclude .git/
    --exclude database/database.sqlite
    --exclude bootstrap/cache/*.php
    --exclude storage/logs/
    --exclude storage/framework/cache/data/
    --exclude storage/framework/sessions/
    --exclude storage/framework/views/
    --exclude var/cache/
    --exclude var/log/
    --exclude var/data*.db
)

SKELETON_VERSION="${SKELETON_VERSION:-7}"
synced=()

if [[ -d "$LARAVEL_SRC/vendor" ]]; then
    mkdir -p "$LARAVEL_DEST"

    python3 - <<'PY' "$LARAVEL_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/laravel-sandbox"
data["description"] = "Internal Laravel sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Laravel composer.lock after manifest edits..."
    (cd "$LARAVEL_SRC" && composer update --lock --no-install --no-interaction)

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
    echo "$SKELETON_VERSION" > "$LARAVEL_DEST/skeleton.version"
    synced+=("Laravel")
fi

if [[ -d "$SYMFONY_SRC/vendor" ]]; then
    mkdir -p "$SYMFONY_DEST"

    python3 - <<'PY' "$SYMFONY_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/symfony-sandbox"
data["description"] = "Internal Symfony sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Symfony composer.lock after manifest edits..."
    (cd "$SYMFONY_SRC" && composer update --lock --no-install --no-interaction)

    if [[ -f "$SYMFONY_SRC/.env" ]]; then
        python3 - <<'PY' "$SYMFONY_SRC/.env"
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(
    r'^APP_SECRET=.*$',
    'APP_SECRET=runspace-symfony-sandbox-secret-not-for-production',
    content,
    flags=re.M,
)
content = re.sub(
    r'^DATABASE_URL=.*$',
    'DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"',
    content,
    flags=re.M,
)
with open(path, "w") as f:
    f.write(content)
PY
    fi

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -f "$ASPNET_CORE_SRC/RunspaceAspNetSandbox.csproj" ]]; then
    mkdir -p "$ASPNET_CORE_DEST"

    cat > "$ASPNET_CORE_SRC/RunspaceEntryHost.cs" <<'CS'
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
CS

    cat > "$ASPNET_CORE_SRC/Program.cs" <<'CS'
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
CS

    rsync -a --delete \
        --exclude bin/ \
        --exclude obj/ \
        --exclude .git/ \
        "$ASPNET_CORE_SRC/" "$ASPNET_CORE_DEST/"
    echo "$SKELETON_VERSION" > "$ASPNET_CORE_DEST/skeleton.version"
    synced+=("ASP.NET Core")
fi

if [[ ${#synced[@]} -eq 0 ]]; then
    echo "No framework skeletons found to sync in $GEN." >&2
    exit 1
fi

echo "Synced ${synced[*]} skeletons (version $SKELETON_VERSION)."
