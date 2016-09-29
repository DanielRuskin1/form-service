# Form Service

This is an AWS Lambda-powered contact form service.  Website owners can create contact forms using the service, and allow their users to submit messages.

# Project Structure

The project has three parts:

1. The `backend` folder.  This folder contains a [Serverless](https://github.com/serverless/serverless) project, which serves as the backend for the service.
2. The `frontend` folder.  This folder contains a React.JS application, which serves as the frontend for the service.
3. The `integration-testing` folder.  This folder contains a [Nightwatch](https://github.com/nightwatchjs/nightwatch)-powered test suite, which verifies that the backend/frontend work together as expected.
4. The `common` folder.  This folder contains files common to two or more parts of the codebase.

You can find more information on each part of the project in their respective folders.

# License

This project is licensed under the Apache License.  See the `LICENSE` file for more information.
