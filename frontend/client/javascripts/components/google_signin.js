"use strict";

const GoogleLogin = require("react-google-login").default;

const React = require("react");

module.exports = React.createClass({
  render: function() {
    return (
      <GoogleLogin
        clientId={this.props.clientId}
        buttonText="Login"
        onSuccess={this.props.onSuccess}
        onFailure={this.props.onFailure} />
    );
  },
});
