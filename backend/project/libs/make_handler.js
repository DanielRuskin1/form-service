"use strict";

module.exports = function(domain) {
  // Helper to make a handler with the given function
  // Returns the same function, except with some helpful features:
  // 1. Sets up the database before call
  // 2. Sets callbackWaitsForEmptyEventLoop to false, such that
  //    AWS Lambda doesn't for the event loop to empty before terming the function (after a result is passed back).
  // 3. Runs the handler in the context of a Domain (https://nodejs.org/api/domain.html).
  //    This is necessary for errors to be handled with some SDKs (e.g. AWS).
  //    When interactions with these libraries results in an error, it will be emitted to the domain;
  //    the error will then be handled by the error_handling library.
  const exports = function(handler) {
    return function(event, context, finishCallback) {
      context.callbackWaitsForEmptyEventLoop = false;

      domain.run(function() {
        handler.apply(this, [event, context, finishCallback]);
      });
    };
  };

  return exports;
};
