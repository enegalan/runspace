import os
import sys

os.environ['RUNSPACE_FRAMEWORK_ROOT'] = '{{skeleton_root}}'
os.environ['RUNSPACE_ENTRY_PATH'] = '{{entry_file}}'

skeleton_root = '{{skeleton_root}}'
entry_file = '{{entry_file}}'

sys.path.insert(0, os.path.join(skeleton_root, 'site-packages'))
sys.path.insert(0, skeleton_root)

with open(entry_file, encoding='utf-8') as _runspace_entry:
    _runspace_code = _runspace_entry.read()
exec(compile(_runspace_code, entry_file, 'exec'), {'__name__': '__main__', '__file__': entry_file})
