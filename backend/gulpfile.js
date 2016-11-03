const gulp = require("gulp");
const prompt = require("gulp-prompt");
const uuid = require("node-uuid");
const fs = require("fs");
const rename = require("gulp-rename");
const getEnv = require("../common/get_env");

gulp.task("setup_before_initial_deploy", (callback) => {
  gulp.src("")
    .pipe(prompt.prompt([
      {
        type: "input",
        name: "development_identity_pool_id",
        message: "What is your development identity pool ID?"
      },
      {
        type: "input",
        name: "production_identity_pool_id",
        message: "What is your production identity pool ID?"
      }
    ], function(res) {
      // Generate database passwords (random)
      const databasePasswords = {
        development: uuid.v4(),
        production: uuid.v4()
      };

      // Generate/save serverless config
      const serverlessConfig = {
        "dev": {
          "prefix": "formservicedev",
          "identityPoolId": res.development_identity_pool_id,
          "databaseUsername": "masteruser",
          "databasePassword": databasePasswords.development,
          "databasePort": "5432"
        },
        "prod": {
          "prefix": "formserviceprod",
          "identityPoolId": res.production_identity_pool_id,
          "databaseUsername": "masteruser",
          "databasePassword": databasePasswords.production,
          "databasePort": "5432"
        }
      };

      fs.writeFile("serverless.env.json", JSON.stringify(serverlessConfig), function (error) {
        if (error) {
          callback(error);
        } else {
          // Write blank dev/prod/test lambda configs for now
          // (these will be filled in after the initial deploy)
          fs.writeFile("config/config.json.dev", JSON.stringify({}), function (error) {
            if (error) {
              callback(error);
            } else {
              fs.writeFile("config/config.json.prod", JSON.stringify({}), function (error) {
                if (error) {
                  callback(error);
                } else {
                  fs.writeFile("config/config.json.test", JSON.stringify({}), function (error) {
                    if (error) {
                      callback(error);
                    } else {
                      callback();
                    }
                  });
                }
              });
            }
          });
        }
      });
    }));
});

gulp.task("setup_after_initial_deploy", (callback) => {
  gulp.src("")
    .pipe(prompt.prompt([
      {
        type: "input",
        name: "development_rollbar_api_key",
        message: "What is your development Rollbar API key?"
      },
      {
        type: "input",
        name: "production_rollbar_api_key",
        message: "What is your production Rollbar API key?"
      },
      {
        type: "input",
        name: "development_ses_email",
        message: "What email did you verify in SES in development?"
      },
      {
        type: "input",
        name: "production_ses_email",
        message: "What email did you verify in SES in production?"
      },
      {
        type: "input",
        name: "development_rds_host",
        message: "What is your development RDS instance host (without the port)?"
      },
      {
        type: "input",
        name: "production_rds_host",
        message: "What is your production RDS instance host (without the port)?"
      }
    ], function(res) {
      // Get serverless config (so we can get the database creds)
      const serverlessEnv = JSON.parse(fs.readFileSync("serverless.env.json"));

      // Generate lambda config files
      const lambdaConfigs = {
        "development": {
          "DATABASE_NAME": "formservicedev",
          "DATABASE_HOST": res.development_rds_host,
          "DATABASE_PORT": serverlessEnv.dev.databasePort,
          "DATABASE_USERNAME": serverlessEnv.dev.databaseUsername,
          "DATABASE_PASSWORD": serverlessEnv.dev.databasePassword,
          "ROLLBAR_API_KEY": res.development_rollbar_api_key,
          "ROLLBAR_ENABLED": "TRUE",
          "SENDER_EMAIL": res.development_ses_email
        },
        "production": {
          "DATABASE_NAME": "formserviceprod",
          "DATABASE_HOST": res.production_rds_host,
          "DATABASE_PORT": serverlessEnv.prod.databasePort,
          "DATABASE_USERNAME": serverlessEnv.prod.databaseUsername,
          "DATABASE_PASSWORD": serverlessEnv.prod.databasePassword,
          "ROLLBAR_API_KEY": res.production_rollbar_api_key,
          "ROLLBAR_ENABLED": "TRUE",
          "SENDER_EMAIL": res.production_ses_email
        },
        "test": {
          "DATABASE_NAME": "formservicetest",
          "DATABASE_HOST": "localhost",
          "DATABASE_PORT": "5432",
          "DATABASE_USERNAME": "postgres",
          "DATABASE_PASSWORD": "test123!",
          "ROLLBAR_API_KEY": "TEST_API_KEY",
          "ROLLBAR_ENABLED": "FALSE",
          "SENDER_EMAIL": "TEST_EMAIL"
        }
      };

      // Save lambda config files
      fs.writeFile("config/config.json.dev", JSON.stringify(lambdaConfigs.development), function (error) {
        if (error) {
          callback(error);
        } else {
          fs.writeFile("config/config.json.prod", JSON.stringify(lambdaConfigs.production), function (error) {
            if (error) {
              callback(error);
            } else {
              fs.writeFile("config/config.json.test", JSON.stringify(lambdaConfigs.test), function (error) {
                if (error) {
                  callback(error);
                } else {
                  callback();
                }
              });
            }
          });
        }
      });
    }));
});

// Deletes the config.json file from the project env folder, so it doesn"t stick around after the deploy finishes.
gulp.task("delete_build_config_file", (callback) => {
  fs.unlink("project/env/config.json", function(error) {
    // ENOENT = file not found = normal
    if (error === null || error.code === "ENOENT") {
      callback();
    } else {
      callback(error);
    }
  });
});

// Copy the config file to the client (so it can be deployed along with the other source)
gulp.task("copy_build_config_file", () => {
  return gulp.src("config/config.json." + getEnv(["dev", "prod", "test"]))
    .pipe(rename("config.json"))
    .pipe(gulp.dest("project/env"));
});
