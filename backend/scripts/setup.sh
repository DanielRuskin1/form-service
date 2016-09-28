# Necessary to make pipes fail the script
set -e
set -o pipefail

# Setup
gulp lint &&
  gulp setup_before_initial_deploy &&
  echo dev | sh scripts/deploy.sh &&
  echo prod | sh scripts/deploy.sh &&
  gulp setup_after_initial_deploy &&
  echo dev | sh scripts/deploy.sh &&
  echo prod | sh scripts/deploy.sh
