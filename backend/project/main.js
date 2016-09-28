"use strict";

const Application = require("./application");

// Sets up the database.  Must be run manually after all resources are setup for the first time.
module.exports.setupDatabase = Application.libraries.makeHandler(function(event, context, finishCallback) {
  Application.libraries.sequelize.sync().then(function() {
    Application.libraries.finishExecution(finishCallback, 200, null, null);
  });
});

// Creates a ContactForm and persists it to the database.
module.exports.createContactForm = Application.libraries.makeHandler(function(event, context, finishCallback) {
  const callerId = event.context["cognito-identity-id"];
  const contactFormObject = event["body-json"].contactForm || {};

  const contactFormCreateParams = {
    name: contactFormObject.name,
    ownerCognitoId: callerId, 
    ownerEmail: contactFormObject.ownerEmail
  };

  Application.models.ContactForm.create(contactFormCreateParams).then(function(newContactForm) {
    // Finish the request with a success
    Application.libraries.finishExecution(finishCallback, 200, null, { contactForm: newContactForm });
  }).catch(function(contactFormCreateError){
    // Finish the request with an error
    if (contactFormCreateError instanceof Application.libraries.Sequelize.ValidationError) {
      const validationErrors = Application.libraries.convertValidationErrors(contactFormCreateError.errors);
      Application.libraries.finishExecution(finishCallback, 400, { validation: validationErrors }, null);
    } else {
      throw contactFormCreateError;
    }
  });
});

// Deletes a ContactForm from the database
module.exports.deleteContactForm = Application.libraries.makeHandler(function(event, context, finishCallback) {
  const callerId = event.context["cognito-identity-id"];
  const contactFormObject = event["body-json"].contactForm || {};

  const searchParams = {
    uuid: contactFormObject.uuid,
    ownerCognitoId: callerId
  };

  Application.models.ContactForm.findOne({ where: searchParams }).then(function(contactForm) {
    if (contactForm === null) {
      Application.libraries.finishExecution(finishCallback, 400, { validation: [{ field: "contactFormUuid", message: "is invalid" }] }, null);
    } else {
      return contactForm.destroy().then(function() {
        Application.libraries.finishExecution(finishCallback, 200, null, null);
      });
    }
  }).catch(function(contactFormDeleteError){
    if (contactFormDeleteError instanceof Application.libraries.Sequelize.DatabaseError) {
      if (contactFormDeleteError.message.indexOf("invalid input syntax for uuid") > -1) {
        // Provided UUID has an invalid syntax
        Application.libraries.finishExecution(finishCallback, 400, { validation: [{ field: "contactFormUuid", message: "is invalid" }] }, null);
      } else {
        throw contactFormDeleteError;
      }
    } else {
      throw contactFormDeleteError;
    }
  });
});

// Lists the current user's contact forms
module.exports.listContactForms = Application.libraries.makeHandler(function(event, context, finishCallback) {
  const callerId = event.context["cognito-identity-id"];

  Application.models.ContactForm.findAll({ where: { ownerCognitoId: callerId } }).then(function(contactForms) {
    Application.libraries.finishExecution(finishCallback, 200, null, { contactForms: contactForms });
  });
});

// Creates a Message to be processed
module.exports.sendMessage = Application.libraries.makeHandler(function(event, context, finishCallback) {
  const messageObject = event["body-json"].message || {};

  const messageCreateParams = {
    contactFormUuid: messageObject.contactFormUuid,
    subject: messageObject.subject,
    from: messageObject.from,
    message: messageObject.message
  };

  Application.models.Message.create(messageCreateParams).then(function(newMessage) {
    // Finish the request with a success
    Application.libraries.finishExecution(finishCallback, 200, null, { message: newMessage });
  }).catch(function(messageCreateError){
    // Finish the request with an error
    if (messageCreateError instanceof Application.libraries.Sequelize.ValidationError) {
      // Validation error
      const validationErrors = Application.libraries.convertValidationErrors(messageCreateError.errors);
      Application.libraries.finishExecution(finishCallback, 400, { validation: validationErrors }, null);
    } else if (messageCreateError instanceof Application.libraries.Sequelize.ForeignKeyConstraintError) {
      // Provided UUID does not map to a ContactForm
      Application.libraries.finishExecution(finishCallback, 400, { validation: [{ field: "contactFormUuid", message: "is invalid" }] }, null);
    } else if (messageCreateError instanceof Application.libraries.Sequelize.DatabaseError) {
      if (messageCreateError.message.indexOf("invalid input syntax for uuid") > -1) {
        // Provided UUID has an invalid syntax
        Application.libraries.finishExecution(finishCallback, 400, { validation: [{ field: "contactFormUuid", message: "is invalid" }] }, null);
      } else {
        throw messageCreateError;
      }
    } else {
      throw messageCreateError;
    }
  });
});

// Processes all Messages in the queue
module.exports.processMessages = Application.libraries.makeHandler(function(event, context, finishCallback) {
  const ses = new Application.libraries.AWS.SES();

  Application.models.Message.findAll({ where: { processed: false }, include: [Application.models.ContactForm] }).then(function(messages) {
    // Put together an array of calls to send the email, and update the message to reflect processing
    const calls = [];
    messages.forEach(function(message) {
      const subjectString = "You've received a message in your " + message.contact_form.name + " contact form!";
      const messageString = [
        subjectString,
        "Subject: " + message.subject,
        "From: " + message.from,
        "Message: " + message.message
      ].join("\n\n");

      const params = {
        Destination: {
          ToAddresses: [
            message.contact_form.ownerEmail
          ]
        },
        Message: { 
          Body: {
            Text: {
              Data: messageString
            }
          },
          Subject: { 
            Data: subjectString
          }
        },
        Source: process.env.SENDER_EMAIL
      };

      calls.push(function(callback) {
        ses.sendEmail(params, function(sendError) {
          if (sendError) {
            return callback(sendError);
          } else {
            message.update({ processed: true }).then(function() {
              return callback(null);
            }).catch(function(updateError) {
              return callback(updateError);
            });
          }
        });
      });
    });
  
    // Run all of the calls in parallel, raising an error if any failed
    Application.libraries.async.series(calls, function(error) {
      if (error) {
        throw error;
      } else {
        Application.libraries.finishExecution(finishCallback, 200, null, null);
      }
    });
  });
});
