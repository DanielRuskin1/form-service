"use strict";

const ReactDOM = require("react-dom");
const React = require("react");

// Sets global on window
require("aws-sdk");

const GoogleSignin = require("./components/google_signin");
const ContactFormBox = require("./components/contact_forms/contact_form_box");
const Result = require("./components/contact_forms/result");

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

    var signinResult = "";
    if (this.state.showSigninResult) {
      signinResult = <Result resultType="googleSignin" result={this.state.signinData} uniqueErrorKey="googleSigninError" />;
    }

    return (
      <div className="contactFormBox">
        <h1>Contact Forms</h1>
        {button}
        {contactFormBox}
        {signinResult}
      </div>
    );
  },
  getInitialState: function() {
    return {
      showButton: true,
      showContactFormBox: false,
      showSigninResult: false,
      signinData: null
    };
  },
  handleAuthorizationSuccess: function(response) {
    // Hide login form, show contact form box with auth token
    this.setState({ showButton: false });
    this.setState({ googleAuthToken: response.tokenObj.id_token, showContactFormBox: true });
  },
  handleAuthorizationFailure: function(response) {
    this.setState({ showButton: false });
    this.setState({ showSigninResult: true, signinData: response });
  }
});

ReactDOM.render(<App />, document.getElementById("content"));
