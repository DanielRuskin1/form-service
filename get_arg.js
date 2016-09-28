"use strict";

// Helper to get command line parameters.
module.exports = function(argName) {
  var env = null;
  process.argv.forEach(function (value) {
    const valueKey = value.split("=")[0];
    const valueVal = value.split("=")[1];
    if (valueKey === ("--" + argName)) {
      env = valueVal;
    }
  });

  return env;
};
