"use strict";

module.exports = function() {
  // Takes in a list of Sequelize validation errors, and converts them into user-friendly values.
  // Throws other errors (i.e. internal warnings).
  const exports = function(errors) {
    const validationErrors = errors.map(function(element) {
      if (["Validation error", "notNull Violation"].indexOf(element.type) > -1) {
        return { field: element.path, message: element.message };
      } else {
        // Only handle validations here, don't expose other errors (i.e. internal warnings) to users
        throw "Unknown error: " + JSON.stringify(element);
      }
    }); 

    return validationErrors;
  };

  return exports;
};
