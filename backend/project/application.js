"use strict";

const application = {};

// Domain (needed for some error handling)
application.domain = require("domain").create();

// Env variables
require("./env/env")();

// Libraries
application.libraries = {};
application.libraries.rollbar = require("./libs/rollbar")();
require("./libs/error_handling")(application, application.domain); // Require this as soon as possible, to avoid any errors not resulting in Rollbar notifications
application.libraries.async = require("./libs/async")();
application.libraries.AWS = require("./libs/aws_sdk")();
application.libraries.Sequelize = require("./libs/sequelize")();
application.libraries.sequelize = require("./libs/sequelize_instance")(application.libraries.Sequelize);
application.libraries.finishExecution = require("./libs/finish_execution")();
application.libraries.convertValidationErrors = require("./libs/convert_validation_errors")();
application.libraries.makeHandler = require("./libs/make_handler")(
  application.domain,
  application.libraries.sequelize
);

// Models
application.models = {};
application.models.ContactForm = require("./models/contact_form")(
  application.libraries.sequelize,
  application.libraries.Sequelize
);
application.models.Message = require("./models/message")(
  application.libraries.sequelize,
  application.libraries.Sequelize,
  application.models.ContactForm
);

module.exports = application;
