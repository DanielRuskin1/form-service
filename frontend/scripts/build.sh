# Get user env
echo "What env would you like to build (dev or prod)?"
read build_env

# Only include AWS services that we use
export AWS_SERVICES=cognitoidentity

# Build
gulp delete_existing_build &&
  gulp setup_folder_structure &&
  # gulp lint && 
  gulp delete_build_config_file &&
  gulp copy_build_config_file --env=$build_env &&
  gulp run_browserify --env=$build_env &&
  gulp copy_api_gateway_sdk &&
  gulp build_css --env=$build_env &&
  gulp copy_html

# Cleanup separately from above command chain (in case it fails)
gulp delete_build_config_file
