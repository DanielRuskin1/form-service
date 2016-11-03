# Get user env
echo "What env would you like to deploy (dev or prod)?"
read build_env

# Deploy
node_modules/eslint/bin/eslint.js . --ignore-pattern node_modules &&
  node_modules/eslint/bin/eslint.js ../common &&
  gulp delete_build_config_file &&
  gulp copy_build_config_file --env=$build_env &&
  node_modules/serverless/bin/serverless deploy --stage $build_env &&
  gulp delete_build_config_file
