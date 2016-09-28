"use strict";

module.exports = function() {
  const exports = require("rollbar");
  exports.init(process.env.ROLLBAR_API_KEY);

  return exports;
};
