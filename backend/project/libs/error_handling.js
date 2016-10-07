"use strict";

module.exports = function(application, domain) {
  // Automatically notify Rollbar and stop the process on any uncaught exceptions
  const handleError = function(error) {
    // Log
    /* eslint-disable no-console */
    console.error(error);
    /* eslint-enable no-console */

    // Notify rollbar if needed
    if (process.env.ROLLBAR_ENABLED === "TRUE") {
      application.libraries.rollbar.handleError(error, function(notifyError) {
        if (notifyError) {
          /* eslint-disable no-console */
          console.error("Encountered an error while handling an uncaught exception.");
          console.error(notifyError, notifyError.stack.split("\n"));
          /* eslint-enable no-console */
        }

        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  process.on("uncaughtException", handleError);
  process.on("unhandledRejection", handleError);
  domain.on("error", handleError);
};
