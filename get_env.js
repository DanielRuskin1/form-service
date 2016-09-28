"use strict";

const getArg = require("./get_arg");

// Helper to get env command line parameter.
module.exports = function(validEnvs) {
  const env = getArg("env");

  if (validEnvs.indexOf(env) == -1) {
    throw "Env is invalid!";
  } else {
    return env;
  }
};
