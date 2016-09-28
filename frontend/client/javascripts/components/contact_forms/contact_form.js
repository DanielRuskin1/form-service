"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

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
          <MessageForm handleMessageSubmit={this.handleMessageSubmit} >
          </MessageForm> 
        </div> 
      </div>
    );
  },
  handleMessageSubmit: function(message) {
    const self = this;

    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.messagesSendPost({}, {
        message: {
          contactFormUuid: self.props.uuid,
          subject: message.subject,
          from: message.from,
          message: message.message
        }
      });
    }).then(function() {
      alert("Done!");
    }).catch(function(error) {
      alert("Error!", error.message);
    });
  }
});
