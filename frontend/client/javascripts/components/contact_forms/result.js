"use strict";

const React = require("react");

const FormError = require("./form_error");

module.exports = React.createClass({
  pendingResult: function() {
    return (
      <div className="pendingBox">
        <strong>Processing...</strong>
      </div>
    );
  },
  successResult: function() {
    return (
      <div className="resultSuccessBox">
        <strong>Success!</strong>
      </div>
    );
  },
  genericErrorResult: function() {
    const errorToShow = "An unknown error occurred!";
    const key = this.props.uniqueErrorKey + "0";

    return (
      <div className="resultErrorBox">
        <strong>An error occurred!</strong>

        <FormError message={errorToShow} key={key} />
      </div>
    );
  },
  specificErrorResult: function(rawErrors) {
    // Create formError objects from raw errors
    const errorComponentsToShow = [];
    for(const errorIndex in rawErrors) {
      const errorToShow = rawErrors[errorIndex];
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
  },
  render: function() {
    switch(this.props.resultType) {
    case "googleSignin":
      // If null, pending.
      // If token present, success.
      // Otherwise, generic error.
      if(this.props.result) {
        if(this.props.result.tokenObj) {
          return this.successResult();
        } else {
          return this.genericErrorResult();
        }
      } else {
        return this.pendingResult();
      }
    case "api":
      // If null, pending.
      // If 200, success.
      // Otherwise, error (either specific if data is present, or generic otherwise).
      if(this.props.result) {
        if(this.props.result.status === 200) {
          return this.successResult();
        } else {
          if(this.props.result.data) {
            // Get list of error strings (determined based on raw error codes)
            const rawErrors = this.props.result.data.errors;
            const errorStrings = [];

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

                errorStrings.unshift("Error on " + fieldToShow + ": " + messageToShow);
              }
            }

            return this.specificErrorResult(errorStrings);
          } else {
            return this.genericErrorResult();
          }
        }
      } else {
        return this.pendingResult();
      }
    default:
      throw "Unknown resultType!";
    }
  }
});
