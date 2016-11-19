# Backend

The backend for this project is powered entirely by AWS.  Almost all resources are created automatically by Cloudformation, from resources specified in the `custom_resources` folder.

## Infrastructure

The infrastructure created by this project roughly boils down to the below diagram.  Some trivial elements (e.g. elastic IPs) are omitted from the diagram for simplicity.

![Image](https://github.com/DanielRuskin1/form-service/blob/master/backend/infrastructure_diagram.png)

## Project Structure

There are a few key folders in the backend part of the project:

1. The root folder stores the Serverless configuration files, as well as some other miscellaneous files related to the backend (e.g. dependency config file, deployment tasks, linting).
2. `config` stores the configuration files for your deployment, including credentials.  Files in this folder are not committed to version control.
3. `custom_resources` stores the Cloudformation templates for the project infrastructure.
4. `node_modules` stores the dependencies for the project.  Files in this folder are not committed to version control.
5. `project` contains the files that are included in the actual deployment.  Most files in this folder are uploaded to AWS Lambda; for more specifics, see the relevant config in `serverless.yml`.
6. `scripts` contains some helpful scripts for using/deploying/testing the project.
7. `test` contains the backend test suite.

## Running Tests

To run backend unit tests, you will first need to setup a local Postgres database.  Setup the database with these properties:

Host/Port: localhost:5432
Username: postgres
Password: test123!
Database Name: formservicetest

Once this database is up and running, you can run tests with `npm run test`.  Make sure you are in the `backend` directory when running this command.

## Deploying

### Initial Deployment

#### Step 1: Create Manual Resources

[Create two Cognito federated identity pools in the `us-west-2` region](https://us-west-2.console.aws.amazon.com/cognito/federated), one for development, and one for production. When asked to setup IAM roles, do not do so.  Take note of the identity pool ID; this will be shown in the console if you hit the "Edit Identity Pool" button.  This ID will be used later to facilitate user signins.

Setup Google signin on your new federated identity pools by following the "Javascript" section [here](http://docs.aws.amazon.com/cognito/latest/developerguide/google.html).  Only complete the `Set Up Google` and `Configure the External Provider in the Amazon Cognito Console` sections.  Make sure to create separate applications for your development and prod identity pools.

Follow these two guides to setup un-sandboxed SES functionality on your account: [one](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses.html) and [two](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html).

[Create a Rollbar account](https://rollbar.com).  Create two projects: one for development, and one for production.  Make sure to take note of the API keys for each project; this will be used later.

#### Step 2: Deploy Automatic Resources

Run `npm install` while in the `backend` directory to install deployment dependencies.  Run `npm install` while in the `backend/project` directory to install the Lambda dependencies.

Create an Amazon IAM user with administrator access and an access key/secret pair.  The administrator access rights are not ideal, but are unfortunately required for Serverless to work at the moment.  This aspect of the deployment process is currently being worked on, and will be changed in the very near future.

Run `npm run setup` while in the `backend` directory.  Setup your key/secret pair if prompted.

Update your Cognito configurations with the below steps:

1. Navigate [here](https://us-west-2.console.aws.amazon.com/cognito/federated) and select your identity pool for the appropriate environment.
2. Hit the `Edit Identity Pool` button in the upper-right corner.
3. Under `Authenticated role`, select the role beginning with `form-service-dev-CognitoAuthRole` (or `form-service-prod-CognitoAuthRole` if deploying to production).
4. Save your changes

#### Step 3: Setup the Database

In the AWS Lambda console, manually run the dev and prod `setupDatabase` functions.  This will ensure that the databases have all tables/fields setup correctly.

#### Step 4: Test your API

You're all set to test out your API; you can do so by setting up and using the frontend.

### All Future Deployments

Once all of the initial setup above is finished, you can deploy the backend in the future by running `npm run deploy`.

### Cleaning Up

Once you're done with your deployment, follow these steps to cleanup.  Be careful: this will delete all data stored in the database.

1. Run `node_modules/serverless/bin/serverless remove --stage ENV`, replacing ENV with the stage you want to cleanup (dev or prod).
2. Manually delete the `form-service-dev` and `form-service-prod` Cloudformation stacks in the [Cloudformation web panel](https://console.aws.amazon.com/cloudformation/home), if they are still present.  Wait until the completion finishes.
3. If the completion fails, this is due to buggy behavior in Lambda and Cloudformation.  You will need to:
  1. Manually delete your VPC in the [VPC web panel](https://us-west-2.console.aws.amazon.com/vpc/home) (this is necessary due to buggy behavior in Cloudformation).  If you receive a message about ENIs, wait 2-3 hours and try again.
  2. Re-trigger deletion in the Cloudformation web panel.
4. Remove your Cognito identity pools on the Cognito web panel, as well as the associated Google applications.
5. Revert any SES changes on your account (i.e. delete your verified email, request a send limit decrease).

## Special Notes

### `scripts` directory

All files in the `scripts` directory assume they are being run from the `backend` directory due to [limitations in Linux](http://mywiki.wooledge.org/BashFAQ/028).  Although we could theoretically pass in a config arg for where the script is being run from, the current approach was chosen for simplicity.

The best approach for running scripts is to use `npm run` while in the `backend` directory; this is the only approach guaranteed to work.

### RDS Security Group

You may notice that the RDS instance security group contains an egress rule to `127.0.0.1/32`.  This is necessary to prevent a default rule from being created, which allows ALL outgoing traffic.  See [this post](https://forums.aws.amazon.com/message.jspa?messageID=413748) for more context.
