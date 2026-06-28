import os
import sys

os.environ['RUNSPACE_FRAMEWORK_ROOT'] = '{{skeleton_root}}'
os.environ['RUNSPACE_ENTRY_PATH'] = '{{entry_file}}'

sys.path.insert(0, os.path.join('{{skeleton_root}}', 'vendor'))

from streamlit.web import cli as stcli

sys.argv = [
    'streamlit',
    'run',
    os.environ['RUNSPACE_ENTRY_PATH'],
    '--server.headless',
    'true',
]
stcli.main()
