"use strict";

const Helper = require("./helper");

describe("Main", function() {
  describe("#listContactForms", function() {
    it("should list the contact forms", function(done) {
      // Create a contact form to use during the test
      const createContactFormParams = { 
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        const event = {
          "context": {
            "cognito-identity-id": "IdentityID"
          }
        };

        Helper.Main.listContactForms(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // Response was successful
          Helper.assert.equal(responseParsed.statusCode, 200);

          // Contact form was returned
          // Use deepEqual to compare objects.
          Helper.assert.deepEqual(responseParsed.data, {
            contactForms: [
              {
                uuid: newContactForm.uuid,
                name: newContactForm.name,
                ownerCognitoId: newContactForm.ownerCognitoId,
                ownerEmail: newContactForm.ownerEmail,
                createdAt: newContactForm.createdAt.toJSON(), // Time is lost during stringify/parse cycle, so force back to JSON-ifiied string
                updatedAt: newContactForm.updatedAt.toJSON(),
                deletedAt: newContactForm.deletedAt // Null
              }
            ]
          });

          done();
        });
      });
    });

    it("should not return someone else's contact form", function(done) {
      // Create a contact form to use during the test
      const createContactFormParams = { 
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        // Fetch contact forms with a different identity
        const event = {
          "context": {
            "cognito-identity-id": "SecondIdentityID"
          }
        };

        Helper.Main.listContactForms(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // Response was successful, but did not have any contact forms
          Helper.assert.equal(responseParsed.statusCode, 200);
          Helper.assert.deepEqual(responseParsed.data, { contactForms: [] });

          done();
        });
      });
    });
  });
});
