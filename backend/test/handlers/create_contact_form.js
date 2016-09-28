"use strict";

const Helper = require("./helper");

describe("Main", function() {
  describe("#createContactForm", function() {
    it("should create a contact form", function(done) {
      const event = {
        "context": {
          "cognito-identity-id": "IdentityID"
        },
        "body-json": {
          "contactForm": {
            "name": "Daniel's Contact Form",
            "ownerEmail": "daniel@druskin.co"
          }
        }
      };

      Helper.Main.createContactForm(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // Response was successful
        Helper.assert.equal(responseParsed.statusCode, 200);

        // Contact form was created
        const searchParams = {
          uuid: responseParsed.data.contactForm.uuid
        };
        Helper.Application.models.ContactForm.findOne({ where: searchParams }).then(function(contactForm) {
          Helper.assert.equal(contactForm.uuid, responseParsed.data.contactForm.uuid);
          Helper.assert.equal(contactForm.ownerCognitoId, "IdentityID");
          Helper.assert.equal(contactForm.name, "Daniel's Contact Form");
          Helper.assert.equal(contactForm.ownerEmail, "daniel@druskin.co");

          done();
        });
      });
    });

    it("should return a 400 error for invalid parameters", function(done) {
      const event = {
        "context": {
          "cognito-identity-id": "IdentityID"
        },
        "body-json": {
          "contactForm": {
            "name": "Daniel's Contact Form",
            "ownerEmail": "daniel"
          }
        }
      };

      Helper.Main.createContactForm(event, {}, function(response) {
        const responseParsed = JSON.parse(response);

        // 400 with correct errors
        Helper.assert.equal(responseParsed.statusCode, 400);
        Helper.assert.deepEqual(responseParsed.errors, { 
          validation: [
            { field: "ownerEmail", message: "Validation isEmail failed" }
          ]
        });

        done();
      });
    });
  });
});
