"use strict";

const ReactDOM = require("react-dom");
const React = require("react");

// Sets global on window
require("aws-sdk");

const GoogleSignin = require("./components/google_signin");
const ContactFormBox = require("./components/contact_forms/contact_form_box");

const Config = require("./config");

const App = React.createClass({
  render: function() {
    var button = "";
    if (this.state.showButton) {
      button = <GoogleSignin onSuccess={this.handleAuthorizationSuccess} onFailure={this.handleAuthorizationFailure} clientId={Config.googleClientId} />;
    }

    var contactFormBox = "";
    if (this.state.showContactFormBox) {
      const region = Config.region;
      const credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: Config.identityPoolId,
        Logins: {
          "accounts.google.com": this.state.googleAuthToken
        }
      });
      contactFormBox = <ContactFormBox region={region} credentials={credentials} pollInterval={1000} />;
    }

    return (
      <div className="contactFormBox">
        <h1>Contact Forms</h1>
        {button}
        {contactFormBox}
      </div>
    );
  },
  getInitialState: function() {
    return {
      showButton: true,
      showContactFormBox: false
    };
  },
  handleAuthorizationSuccess: function(response) {
    // Hide login form, show contact form box with auth token
    this.setState({ showButton: false });
    this.setState({ googleAuthToken: response.tokenObj.id_token, showContactFormBox: true });
  },
  handleAuthorizationFailure: function(response) {
    response;
    // TODO
  }
});

ReactDOM.render(<App />, document.getElementById("content"));
