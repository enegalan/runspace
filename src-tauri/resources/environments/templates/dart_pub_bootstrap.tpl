import 'dart:io';

void main() {
  final skeletonRoot = '{{skeleton_root}}';
  final entryPath = '{{entry_file}}';

  final result = Process.runSync(
    Platform.executable,
    ['run', entryPath],
    workingDirectory: skeletonRoot,
  );
  stdout.write(result.stdout);
  stderr.write(result.stderr);
  exit(result.exitCode);
}
