"use strict";

const Helper = require("./helper");

describe("Main", function() {
  describe("#deleteContactForm", function() {
    it("should delete a contact form", function(done) {
      // Create a contact form to use during the test
      const createContactFormParams = { 
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        // Delete the contact form to verify the function works
        const event = {
          "context": {
            "cognito-identity-id": "IdentityID"
          },
          "body-json": {
            "contactForm": {
              "uuid": newContactForm.uuid
            }
          }
        };

        Helper.Main.deleteContactForm(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // Response was successful
          Helper.assert.equal(responseParsed.statusCode, 200);

          // Contact form was deleted
          const searchParams = {
            uuid: newContactForm.uuid
          };
          
          Helper.Application.models.ContactForm.findOne({ where: searchParams }).then(function(contactForm) {
            Helper.assert.equal(contactForm, null);

            done();
          });
        });
      });
    });

    it("should return a 400 error if the contact form does not exist", function(done) {
      const event = {
        "context": {
          "cognito-identity-id": "IdentityID"
        },
        "body-json": {
          "contactForm": {
            "uuid": "345f714c-443d-4444-8f31-1fc42f2f68b8", // Random, nonexistent uuid
          }
        }
      };

      Helper.Main.deleteContactForm(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // 400 with correct errors
        Helper.assert.equal(responseParsed.statusCode, 400);
        Helper.assert.deepEqual(responseParsed.errors, { 
          validation: [
            { field: "contactFormUuid", message: "is invalid" }
          ]
        });

        done();
      });
    });

    it("should return a 400 error if the UUID is invalid", function(done) {
      const event = {
        "context": {
          "cognito-identity-id": "IdentityID"
        },
        "body-json": {
          "contactForm": {
            "uuid": "test"
          }
        }
      };

      Helper.Main.deleteContactForm(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // 400 with correct errors
        Helper.assert.equal(responseParsed.statusCode, 400);
        Helper.assert.deepEqual(responseParsed.errors, { 
          validation: [
            { field: "contactFormUuid", message: "is invalid" }
          ]
        });

        done();
      });
    });

    it("should return a 400 error if the contact form belongs to someone else", function(done) {
      // Create a contact form to use during the test
      const createContactFormParams = { 
        name: "Hello World",
        ownerCognitoId: "IdentityID",
        ownerEmail: "daniel@druskin.co"
      };

      Helper.Application.models.ContactForm.create(createContactFormParams).then(function(newContactForm) {
        // Delete the contact form with a different identity
        const event = {
          "context": {
            "cognito-identity-id": "SecondIdentityID"
          },
          "body-json": {
            "contactForm": {
              "uuid": newContactForm.uuid
            }
          }
        };

        Helper.Main.deleteContactForm(event, {}, function(response) {
          const responseParsed = JSON.parse(response);

          // 400 with correct errors
          Helper.assert.equal(responseParsed.statusCode, 400);
          Helper.assert.deepEqual(responseParsed.errors, { 
            validation: [
              { field: "contactFormUuid", message: "is invalid" }
            ]
          });

          done();
        });
      });
    });
  });
});
