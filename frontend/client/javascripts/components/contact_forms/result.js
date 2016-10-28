"use strict";

const React = require("react");

const FormError = require("./form_error");

module.exports = React.createClass({
  render: function() {
    if(this.props.result) {
      if(this.props.result.status === 200) {
        return (
          <div className="resultSuccessBox">
            <strong>Success!</strong>
          </div>
        );
      } else {
        // Get list of error strings (determined based on error codes)
        const errorsToShow = [];
        if(this.props.result.data) {
          const rawErrors = this.props.result.data.errors;

          for(const errorType in rawErrors) {
            for(const errorIndex in rawErrors[errorType]) {
              const errorObject = rawErrors[errorType][errorIndex];

              var messageToShow = null;
              switch(errorObject.code) {
              case "INVALID_EMAIL":
                messageToShow = "Invalid email address.";
                break;
              case "BLANK_VALUE":
                messageToShow = "Value cannot be blank.";
                break;
              case "INVALID_REFERENCE":
                throw "Invalid reference error!";
              case "TOO_SHORT":
                messageToShow = "Value is too short.";
                break;
              case "TOO_LONG":
                messageToShow = "Value is too long.";
                break;
              default:
                throw "Unknown error code!";
              }

              var fieldToShow = null;
              switch(errorObject.field) {
              case "ownerEmail":
                fieldToShow = "email address";
                break;
              case "name":
                fieldToShow = "name";
                break;
              case "from":
                fieldToShow = "from";
                break;
              case "subject":
                fieldToShow = "subject";
                break;
              case "message":
                fieldToShow = "message";
                break;
              default:
                throw "Unknown field name!";
              }

              errorsToShow.unshift("Error on " + fieldToShow + ": " + messageToShow);
            }
          }
        } else {
          errorsToShow.unshift("Unknown error!");
        }

        // Create formError objects from strings
        const errorComponentsToShow = [];
        for(const errorIndex in errorsToShow) {
          const errorToShow = errorsToShow[errorIndex];
          const key = this.props.uniqueErrorKey + errorIndex;

          errorComponentsToShow.unshift(
            <FormError message={errorToShow} key={key}>
            </FormError>
          );
        }

        return (
          <div className="resultErrorBox">
            <strong>An error occurred!</strong>
            {errorComponentsToShow}
          </div>
        );
      }
    } else {
      return (
        <div className="pendingBox">
          <strong>Processing...</strong>
        </div>
      );
    }
  }
});
