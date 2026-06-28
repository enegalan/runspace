<?php
putenv('RUNSPACE_FRAMEWORK_ROOT={{skeleton_root}}');
putenv('RUNSPACE_ENTRY_PATH={{entry_file}}');
$framework_root = getenv('RUNSPACE_FRAMEWORK_ROOT');
require $framework_root . '/vendor/autoload.php';
if (is_file($framework_root . '/wp-config.php')) {
    if (!defined('WP_INSTALLING')) {
        define('WP_INSTALLING', true);
    }
    require $framework_root . '/wordpress/wp-load.php';
}
include getenv('RUNSPACE_ENTRY_PATH');
