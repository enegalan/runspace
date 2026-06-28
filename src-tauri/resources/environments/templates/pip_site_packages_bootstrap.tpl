import os
import runpy
import sys

os.environ['RUNSPACE_FRAMEWORK_ROOT'] = '{{skeleton_root}}'
os.environ['RUNSPACE_ENTRY_PATH'] = '{{entry_file}}'

sys.path.insert(0, os.path.join('{{skeleton_root}}', 'site-packages'))

runpy.run_path('{{entry_file}}', run_name='__main__')
