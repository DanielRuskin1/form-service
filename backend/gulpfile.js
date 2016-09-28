const gulp = require("gulp");
const prompt = require("gulp-prompt");
const uuid = require("node-uuid");
const fs = require("fs");
const yaml = require("js-yaml");
const rename = require("gulp-rename");
const getEnv = require("../get_env");
const eslint = require("gulp-eslint");

// Lint the codebase
gulp.task("lint", () => {
  return gulp.src(["project/**/*.js", "scripts/**/*.js", "!node_modules", "!node_modules/**", "!project/node_modules", "!project/node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

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
        "vars": {},
        "stages": {
          "dev": {
            "vars": {
              "stage": "dev",
              "prefix": "formservicedev",
              "identity_pool_id": res.development_identity_pool_id,
              "database_username": "masteruser",
              "database_password": databasePasswords.development,
              "database_port": "5432"
            }, 
            "regions": {
              "us-west-2": {
                "vars": {}
              }
            }
          },
          "prod": {
            "vars": {
              "stage": "prod",
              "prefix": "formserviceprod",
              "identity_pool_id": res.production_identity_pool_id,
              "database_username": "masteruser",
              "database_password": databasePasswords.production,
              "database_port": "5432"
            }, 
            "regions": {
              "us-west-2": {
                "vars": {}
              }
            }
          }
        }
      };

      fs.writeFile("serverless.env.yml", yaml.safeDump(serverlessConfig), function (error) {
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
        message: "What What is your development RDS instance host (without the port)?"
      },
      {
        type: "input",
        name: "production_rds_host",
        message: "What What is your production RDS instance host (without the port)?"
      }
    ], function(res) {
      // Get serverless config (so we can get the database creds)
      const serverlessEnv = yaml.safeLoad(fs.readFileSync("serverless.env.yml"));

      // Generate lambda config files
      const lambdaConfigs = {
        "development": {
          "DATABASE_NAME": "formservicedev",
          "DATABASE_HOST": res.development_rds_host,
          "DATABASE_PORT": serverlessEnv.stages.dev.vars.database_port,
          "DATABASE_USERNAME": serverlessEnv.stages.dev.vars.database_username,
          "DATABASE_PASSWORD": serverlessEnv.stages.dev.vars.database_password,
          "ROLLBAR_API_KEY": res.development_rollbar_api_key,
          "SENDER_EMAIL": res.development_ses_email
        },
        "production": {
          "DATABASE_NAME": "formserviceprod",
          "DATABASE_HOST": res.production_rds_host,
          "DATABASE_PORT": serverlessEnv.stages.prod.vars.database_port,
          "DATABASE_USERNAME": serverlessEnv.stages.prod.vars.database_username,
          "DATABASE_PASSWORD": serverlessEnv.stages.prod.vars.database_password,
          "ROLLBAR_API_KEY": res.production_rollbar_api_key,
          "SENDER_EMAIL": res.production_ses_email
        },
        "test": {
          "DATABASE_NAME": "formservicetest",
          "DATABASE_HOST": "localhost",
          "DATABASE_PORT": "5432",
          "DATABASE_USERNAME": "postgres",
          "DATABASE_PASSWORD": "test123!",
          "ROLLBAR_API_KEY": "TEST_API_KEY",
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
