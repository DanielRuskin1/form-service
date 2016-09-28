"use strict";

module.exports = function() {
  // Setup env variables
  const config = require("./config.json");
  Object.keys(config).forEach((key) => {
    const value = config[key];
    process.env[key] = value;
  });
};
