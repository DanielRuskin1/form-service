"use strict";

const Helper = require("./helper");

describe("Main", function() {
  describe("#setupDatabase", function() {
    it("it should setup the database", function(done) {
      Helper.Main.setupDatabase({}, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // Response was successful
        Helper.assert.equal(responseParsed.statusCode, 200);

        // Database connections are working
        Helper.Application.models.ContactForm.count().then(function(count) {
          Helper.assert.equal(count, 0);

          done();
        });
      });
    });
  });
});
