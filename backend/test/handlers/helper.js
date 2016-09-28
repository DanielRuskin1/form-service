"use strict";

module.exports.assert = require("assert");
module.exports.rewire = require("rewire");
module.exports.Main = module.exports.rewire("../../project/main");
module.exports.Application = module.exports.Main.__get__("Application");

// Force drop/re-create all tables before each test
const cleanDatabase = function(done) {
  module.exports.Application.libraries.sequelize.sync({ force: true }).then(function() {
    done();
  });
};
beforeEach(cleanDatabase);
afterEach(cleanDatabase);
