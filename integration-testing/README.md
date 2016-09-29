# Integration Testing

The integration testing part of this project is powered by Nightwatch.  

## Project Structure

There are a few key folders in the frontend part of the project:

1. The root folder stores some other miscellaneous files related to the integration testing suite (e.g. Nightwatch config file).
2. `dist` stores the version of the React.JS project to be tested.  Files in this folder are not committed to version control.
3. `node_modules` stores the dependencies for the project.  Files in this folder are not committed to version control.
4. `test` stores the actual test suite.
5. `test_output` stores the test results.  Files in this folder are not committed to version control.

## Running Integration Tests

1. Deploy the backend to dev
2. Create a frontend build with the dev SDK
3. Copy the `frontend/dist` folder into the `integration-testing` folder
4. Run `npm run test` while in the integration-testing directory.
