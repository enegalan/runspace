<?php
putenv('RUNSPACE_FRAMEWORK_ROOT={{skeleton_root}}');
putenv('RUNSPACE_ENTRY_PATH={{entry_file}}');
require getenv('RUNSPACE_FRAMEWORK_ROOT') . '/vendor/autoload.php';
include getenv('RUNSPACE_ENTRY_PATH');
