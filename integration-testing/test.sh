# Fail if any commands fail (e.g. linting)
set -e

# Lint the tests (because why not)
node_modules/eslint/bin/eslint.js . --ignore-pattern node_modules --ignore-pattern dist &&
  node_modules/eslint/bin/eslint.js ../common

# Get user data
echo "What is your google account username?  Note that the account cannot have 2FA enabled."
read google_username
echo "What is your google account password?  Note that the account cannot have 2FA enabled."
read google_password

# Start a HTTP server in the dist folder, in the background
pushd dist
nohup python -m SimpleHTTPServer 8000 > /dev/null 2>&1 &
popd

# Wait until server is up
echo "Waiting for webserver to start"
until $(curl --output /dev/null --silent --head --fail http://localhost:8000); do
  printf '.'
  sleep 2
done

# Run the tests
node nightwatch.js --google-username=$google_username --google-password=$google_password

# Kill the HTTP server
kill %1
