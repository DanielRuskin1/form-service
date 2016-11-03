// No strict mode, because we need to stub out SES (see the second beforeEach).

const Helper = require("./helper");

describe("Main", function() {
  describe("#processMessages", function() {
    beforeEach(function(done) {
      // Create a contact form and message to use during the test
      const createContactFormParams = {
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        const createMessageParams = {
          contactFormUuid: newContactForm.uuid,
          subject: "Hello, world",
          from: "daniel@druskin.co",
          message: "Hey!"
        };

        Helper.Application.models.Message.create(createMessageParams).then(function() {
          done();
        });
      });
    });

    // Stub out sendEmail to do nothing (otherwise we get API errors)
    beforeEach(function() {
      // Stub AWS.SES() to return an object.  The object has the stubbed sendEmail method.
      Helper.Application.libraries.AWS.SES = function() {
        return {
          sendEmail: function(params, callback) {
            // No value in callback call = success
            callback();
          }
        };
      };
    });

    it("should process all messages in the queue", function(done) {
      Helper.Application.models.Message.findOne().then(function(message) {
        Helper.assert.equal(message.processed, false);

        Helper.Main.processMessages({}, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // Response was successful
          Helper.assert.equal(responseParsed.statusCode, 200);

          // Message was processed
          message.reload(function() {
            Helper.assert.equal(message.processed, true);
          });

          done();
        });
      });
    });
  });
});
