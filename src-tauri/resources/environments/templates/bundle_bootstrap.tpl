ENV['RUNSPACE_FRAMEWORK_ROOT'] = '{{skeleton_root}}'
ENV['RUNSPACE_ENTRY_PATH'] = '{{entry_file}}'
ENV['BUNDLE_GEMFILE'] = File.join(ENV['RUNSPACE_FRAMEWORK_ROOT'], 'Gemfile')
ENV['BUNDLE_PATH'] = File.join(ENV['RUNSPACE_FRAMEWORK_ROOT'], 'vendor/bundle')

require 'bundler/setup'
load ENV['RUNSPACE_ENTRY_PATH']
