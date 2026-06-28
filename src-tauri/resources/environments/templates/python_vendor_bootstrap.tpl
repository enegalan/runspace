import os
import runpy
import sys

os.environ["RUNSPACE_FRAMEWORK_ROOT"] = "{{skeleton_root}}"
os.environ["RUNSPACE_ENTRY_PATH"] = "{{entry_file}}"

vendor_path = os.path.join("{{skeleton_root}}", "vendor")
if vendor_path not in sys.path:
    sys.path.insert(0, vendor_path)

runpy.run_path("{{entry_file}}", run_name="__main__")
