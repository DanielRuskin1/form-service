"use strict";

module.exports = function() {
  const exports = {};

  exports.invalidEmailError = function(field) {
    return { field: field, code: "INVALID_EMAIL" };
  };
  exports.blankValueError = function(field) {
    return { field: field, code: "BLANK_VALUE" };
  };
  exports.invalidReferenceError = function(field) {
    return { field: field, code: "INVALID_REFERENCE" };
  };
  exports.invalidLengthError = function(model, transactionParams, field) {
    const validationParams = model.rawAttributes[field].validate.len;
    if (transactionParams[field] === null || transactionParams[field].length < validationParams[0]) {
      return { field: field, code: "TOO_SHORT" };
    } else if (transactionParams[field].length > validationParams[1]) {
      return { field: field, code: "TOO_LONG" };
    } else {
      throw "Unknown invalid length error! " + JSON.stringify(transactionParams);
    }
  };

  // Takes in a list of Sequelize errors, and converts them into error codes.
  // Throws other errors (i.e. internal warnings).
  exports.fromSequelizeErrors = function(model, transactionParams, errors) {
    return errors.map(function(element) {
      if (element.type === "Validation error") {
        if (element.message === "Validation isEmail failed") {
          return exports.invalidEmailError(element.path);
        } else if (element.path === "contactFormUuid" && element.message === "is invalid") {
          return exports.invalidReferenceError(element.path);
        } else if (element.message === "Validation len failed") {
          return exports.invalidLengthError(model, transactionParams, element.path);
        } else {
          throw "Unknown error: " + JSON.stringify(element);
        }
      } else if (element.type == "notNull Violation") {
        return exports.blankValueError(element.path);
      } else {
        // Don't expose other errors (i.e. internal warnings) to users
        throw "Unknown error: " + JSON.stringify(element);
      }
    });
  };

  return exports;
};
