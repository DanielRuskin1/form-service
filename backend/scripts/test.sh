gulp lint &&
  gulp delete_build_config_file &&
  gulp copy_build_config_file --env=test &&
  node_modules/.bin/mocha test/*

# Delete config file even if other parts of command fail
gulp delete_build_config_file
