"use strict";

const Helper = require("./helper");

describe("Main", function() {
  describe("#sendMessage", function() {
    beforeEach(function(done) {
      // Create a contact form to use during the test
      const createContactFormParams = {
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        done();
      });
    });

    it("should send a message", function(done) {
      Helper.Application.models.ContactForm.findOne().then(function(contactForm) {
        const event = {
          "body-json": {
            "message": {
              "contactFormUuid": contactForm.uuid,
              "subject": "Hello World",
              "from": "daniel@druskin.co",
              "message": "Hello, world!  What's up?"
            }
          }
        };

        Helper.Main.sendMessage(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // Response was successful
          Helper.assert.equal(responseParsed.statusCode, 200);

          // Message was created
          const searchParams = {
            uuid: responseParsed.data.message.uuid
          };
          Helper.Application.models.Message.findOne({ where: searchParams }).then(function(message) {
            Helper.assert.equal(message.uuid, responseParsed.data.message.uuid);
            Helper.assert.equal(message.subject, "Hello World");
            Helper.assert.equal(message.from, "daniel@druskin.co");
            Helper.assert.equal(message.message, "Hello, world!  What's up?");

            done();
          });
        });
      });
    });

    it("should return a 400 error if the contact form does not exist", function(done) {
      const event = {
        "body-json": {
          "message": {
            "contactFormUuid": "345f714c-443d-4444-8f31-1fc42f2f68b8", // Random, nonexistent uuid
            "subject": "Hello World",
            "from": "daniel@druskin.co",
            "message": "Hello, world!  What's up?"
          }
        }
      };

      Helper.Main.sendMessage(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // 400 with correct errors
        Helper.assert.equal(responseParsed.statusCode, 400);
        Helper.assert.deepEqual(responseParsed.errors, {
          validation: [
            { field: "contactFormUuid", code: "INVALID_REFERENCE" }
          ]
        });

        done();
      });
    });

    it("should return a 400 error if the UUID is invalid", function(done) {
      const event = {
        "body-json": {
          "message": {
            "contactFormUuid": "test",
            "subject": "Hello World",
            "from": "daniel@druskin.co",
            "message": "Hello, world!  What's up?"
          }
        }
      };

      Helper.Main.sendMessage(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // 400 with correct errors
        Helper.assert.equal(responseParsed.statusCode, 400);
        Helper.assert.deepEqual(responseParsed.errors, {
          validation: [
            { field: "contactFormUuid", code: "INVALID_REFERENCE" }
          ]
        });

        done();
      });
    });

    it("should return a 400 error for an invalid email", function(done) {
      Helper.Application.models.ContactForm.findOne().then(function(contactForm) {
        const event = {
          "body-json": {
            "message": {
              "contactFormUuid": contactForm.uuid,
              "subject": "Hello World",
              "from": "daniel",
              "message": "Hello, world!  What's up?"
            }
          }
        };

        Helper.Main.sendMessage(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // 400 with correct errors
          Helper.assert.equal(responseParsed.statusCode, 400);
          Helper.assert.deepEqual(responseParsed.errors, {
            validation: [
              { field: "from", code: "INVALID_EMAIL" }
            ]
          });

          done();
        });
      });
    });

    it("should return a 400 error for too many characters in a field", function(done) {
      Helper.Application.models.ContactForm.findOne().then(function(contactForm) {
        const event = {
          "body-json": {
            "message": {
              "contactFormUuid": contactForm.uuid,
              "subject": "H".repeat(1001),
              "from": "daniel@druskin.co",
              "message": "Hello, world!  What's up?"
            }
          }
        };

        Helper.Main.sendMessage(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // 400 with correct errors
          Helper.assert.equal(responseParsed.statusCode, 400);
          Helper.assert.deepEqual(responseParsed.errors, {
            validation: [
              { field: "subject", code: "TOO_LONG" }
            ]
          });

          done();
        });
      });
    });

    it("should return a 400 error for too few characters in a field", function(done) {
      Helper.Application.models.ContactForm.findOne().then(function(contactForm) {
        const event = {
          "body-json": {
            "message": {
              "contactFormUuid": contactForm.uuid,
              "subject": "",
              "from": "daniel@druskin.co",
              "message": "Hello, world!  What's up?"
            }
          }
        };

        Helper.Main.sendMessage(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // 400 with correct errors
          Helper.assert.equal(responseParsed.statusCode, 400);
          Helper.assert.deepEqual(responseParsed.errors, {
            validation: [
              { field: "subject", code: "TOO_SHORT" }
            ]
          });

          done();
        });
      });
    });
  });
});
