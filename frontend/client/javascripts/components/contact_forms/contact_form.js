"use strict";

const React = require("react");

const MessageForm = require("./message_form");

module.exports = React.createClass({
  render: function() {
    return (
      <div className="contactForm">
        <strong>Name:</strong> {this.props.name} <br/>
        <strong>Email:</strong> {this.props.ownerEmail} <br/>
        <strong>UUID:</strong> {this.props.uuid}

        <div className="contactFormMessageForm">
          <strong>Send a message!</strong>
          <MessageForm region={this.props.region} credentials={this.props.credentials} contactFormUuid={this.props.uuid} >
          </MessageForm>
        </div>
      </div>
    );
  }
});
