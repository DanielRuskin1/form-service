"use strict";

module.exports = function() {
  // Helper to send a function result to AWS Lambda (i.e. when all processing is finished)
  const exports = function(finishCallback, statusCode, errors, data) {
    const response = {};

    response.statusCode = statusCode;
    if (errors !== null) { response.errors = errors; }
    if (data !== null) { response.data = data; }

    finishCallback(JSON.stringify(response));
  };

  return exports;
};
