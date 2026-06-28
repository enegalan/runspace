'use strict';

process.env.RUNSPACE_FRAMEWORK_ROOT = '{{skeleton_root}}';
process.env.RUNSPACE_WORKSPACE = '{{workspace_path}}';
process.env.RUNSPACE_ENTRY_PATH = '{{entry_file}}';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const skeletonRoot = '{{skeleton_root}}';
const workspacePath = '{{workspace_path}}';
const entryFile = '{{entry_file}}';

function ensureSymlink(linkPath, targetPath) {
  if (fs.existsSync(linkPath)) {
    return;
  }

  fs.symlinkSync(
    targetPath,
    linkPath,
    process.platform === 'win32' ? 'junction' : 'dir'
  );
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const packageJsonPath = path.join(workspacePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  fs.copyFileSync(path.join(skeletonRoot, 'package.json'), packageJsonPath);
}

ensureSymlink(
  path.join(workspacePath, 'node_modules'),
  path.join(skeletonRoot, 'node_modules')
);

const appDir = path.join(workspacePath, 'app');
ensureDir(appDir);

const entryExt = path.extname(entryFile) || '.jsx';
const pagePath = path.join(appDir, `page${entryExt}`);
fs.copyFileSync(entryFile, pagePath);

const layoutPath = path.join(appDir, `layout${entryExt}`);
if (!fs.existsSync(layoutPath)) {
  fs.writeFileSync(
    layoutPath,
    "export default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}\n"
  );
}

const nextBin = path.join(
  skeletonRoot,
  'node_modules',
  'next',
  'dist',
  'bin',
  'next'
);

const result = spawnSync(process.execPath, [nextBin, 'dev'], {
  cwd: workspacePath,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
