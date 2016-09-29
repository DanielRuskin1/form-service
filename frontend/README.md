# Frontend

The frontend for this project is powered by React.JS.  

## Project Structure

There are a few key folders in the frontend part of the project:

1. The root folder stores some other miscellaneous files related to the frontend (e.g. dependency config file, building tasks, linting).
2. `client` stores the source of the React.JS project.
3. `config` stores the configuration files for your deployment, including credentials.  Files in this folder are not committed to version control.
4. `dist` stores the built version of the React.JS project.  Files in this folder are not committed to version control.
5. `node_modules` stores the dependencies for the project.  Files in this folder are not committed to version control.
6. `scripts` contains some helpful scripts for using/deploying/testing the project.
7. `test` contains the frontend test suite.

## Deploying the frontend

### Initial Deployment

#### Step 1: Setup

Run `npm run setup` while in the `frontend` directory and follow the prompts.  This will create a configuration file with your deployment's settings.  It will not be committed to version control, so you will need to make sure to run this whenever setting up the project.

#### Step 2: Download API Gateway SDK

[Download a copy of your API's Javascript SDK](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html#how-to-generate-sdk-javascript), extract the `lib` folder and `apigClient.js` file, and copy them to the `client/javascripts/vendor/api_gateway_sdk` folder.  Make sure to download the SDK for the stage you want to deploy (dev when deploying dev, prod when deploying prod).

#### Step 3: Build

Run `npm run build` while in the `frontend` directory and follow the prompts.  This will generate a build of the client.

#### Step 4: Deploy

Deploy the `frontend/dist` directory to a webserver of your choice.  [You can even use S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html).

### All Future Deployments

Once all of the initial setup above is finished, you can deploy the frontend in the future by starting at step 2.

### Cleaning Up

To cleanup, simply remove the frontend deployment from your webserver.

## Special Notes

### Special Notes on AWS SDK

We include an AWS SDK in the application to use AWS services from the client, such as authentication.  In order to avoid bloating the client side application, we only include the AWS services we use in the application bundle.  You can add or remove services by editing the `AWS_SERVICES` param in `build.sh`.

### `scripts` directory

All files in the `scripts` directory assume they are being run from the `frontend` directory due to [limitations in Linux](http://mywiki.wooledge.org/BashFAQ/028).  Although we could theoretically pass in a config arg for where the script is being run from, the current approach was chosen for simplicity.

The best approach for running scripts is to use `npm run` while in the `frontend` directory; this is the only approach guaranteed to work.
