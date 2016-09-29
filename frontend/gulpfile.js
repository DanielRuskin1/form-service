const gulp = require("gulp");
const rename = require("gulp-rename");
const rimraf = require("rimraf");
const prompt = require("gulp-prompt");
const mkdirp = require("mkdirp");
const eslint = require("gulp-eslint");
const fs = require("fs");
const Browserify = require("browserify");
const through = require("through2");
const getEnv = require("../common/get_env");
const cssMin = require("gulp-cssmin");

//* SETUP WORKFLOW

// Setup the config files
gulp.task("setup", (callback) => {
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
      },
      {
        type: "input",
        name: "development_google_client_id",
        message: "What is your development google client ID?"
      },
      {
        type: "input",
        name: "production_google_client_id",
        message: "What is your production google client ID?"
      },
      {
        type: "input",
        name: "region",
        message: "What region are you in?"
      }
    ], function(res) {
      const dev_config = {
        "identityPoolId": res.development_identity_pool_id,
        "region": res.region,
        "googleClientId": res.development_google_client_id
      };
      const prod_config = {
        "identityPoolId": res.production_identity_pool_id,
        "region": res.region,
        "googleClientId": res.production_google_client_id
      };

      // Write dev config
      fs.writeFile("config/config.json.dev", JSON.stringify(dev_config), function (error) {
        if (error) {
          callback(error);
        } else {
          // Now that dev is written, write prod config
          fs.writeFile("config/config.json.prod", JSON.stringify(prod_config), function (error) {
            if (error) {
              callback(error);
            } else {
              // Dev and prod configs are written; finish the task.
              callback();
            }
          });
        }
      });
    }));
});

//* BUILD WORKFLOW
//* NEVER RUN THESE DIRECTLY.  Instead, use the build.sh file.

// Delete the existing build
gulp.task("delete_existing_build", (callback) => {
  rimraf("dist", {}, function(error) {
    if (error) {
      callback(error);
    } else {
      callback();
    }
  });
});

// Sets up the build folder structure
gulp.task("setup_folder_structure", (callback) => {
  try {
    mkdirp.sync("dist");
    mkdirp.sync("dist/javascripts");
    mkdirp.sync("dist/javascripts/vendor");
    mkdirp.sync("dist/javascripts/vendor/api_gateway_sdk");
    mkdirp.sync("dist/stylesheets");

    callback();
  } catch(error) {
    callback(error);
  }
});

// Lint the codebase
gulp.task("lint", () => {
  return gulp.src(["client/javascripts/**/*.js", "*.js", "!client/javascripts/vendor", "!client/javascripts/vendor/**", "tests/**/*.js"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Deletes the config.json file from the client folder, so it doesn"t stick around after the deploy finishes.
gulp.task("delete_build_config_file", (callback) => {
  fs.unlink("client/javascripts/config.json", function(error) {
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
  return gulp.src("config/config.json." + getEnv(["dev", "prod"]))
    .pipe(rename("config.json"))
    .pipe(gulp.dest("client/javascripts"));
});

// Runs browserify on the application
// env command line arg is required
gulp.task("run_browserify", (callback) => {
  // debug param is needed for minifyify
  const browserify = Browserify("client/javascripts/index.js", { debug: true });

  // Get the env
  const env = getEnv(["dev", "prod"]);

  // Map env to the Node replacement values
  var nodeEnv;
  if (env === "dev") {
    nodeEnv = "development";
  } else if (env === "prod") {
    nodeEnv = "production";
  } else {
    throw "Env is invalid!";
  }

  // Replace process.env.NODE_ENV references
  browserify.transform(function () {
    return through(function (buf, enc, next) {
      var stringValue = buf.toString("utf8");
      stringValue = stringValue.replace(/process.env.NODE_ENV/g, "\"" + nodeEnv + "\"");

      this.push(stringValue);
      next();
    });
  }, { global: true });

  // Minify result, but only in prod (maintain stack traces in dev)
  // app.js.map will be created by these lines
  if (env === "prod") {
    browserify.plugin("minifyify", { map: "javascripts/app.js.map", output: "dist/javascripts/app.js.map" });
  }

  // Support babel
  browserify.transform("babelify", { presets: ["react"], compact: true });

  // Build to file
  // app.js will be created by these lines
  const bundleFs = fs.createWriteStream("dist/javascripts/app.js");
  browserify.bundle().pipe(bundleFs);

  bundleFs.on("finish", function () {
    callback();
  });
});

// Copy the API Gateway SDK to the build folder
gulp.task("copy_api_gateway_sdk", function() {
  return gulp.src("client/javascripts/vendor/api_gateway_sdk/**/*")
    .pipe(gulp.dest("dist/javascripts/vendor/api_gateway_sdk"));
});

// Minifies and copies CSS to the dist directory
// env command line arg is required
gulp.task("build_css", function() {
  var stream = gulp.src("client/stylesheets/**/*.css");
  const env = getEnv(["dev", "prod"]);

  // Minify in prod
  if (env === "prod") {
    stream = stream.pipe(cssMin());
  }

  stream = stream.pipe(gulp.dest("dist/stylesheets"));

  return stream;
});

// Copy the HTML to the build folder
gulp.task("copy_html", function() {
  return gulp.src("client/index.html")
    .pipe(gulp.dest("dist"));
});
