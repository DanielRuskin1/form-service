"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

const React = require("react");

const ContactFormList = require("./contact_form_list");
const ContactFormForm = require("./contact_form_form");

module.exports = React.createClass({
  loadContactFormsFromServer: function() {
    const self = this;

    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.contactFormsGet();
    }).then(function(contactFormResponse) {
      self.setState({
        data: contactFormResponse.data.data.contactForms
      });
    }).catch(function(error) {
      alert("Error!", error.message);
    });
  },
  handleContactFormSubmit: function(contactForm) {
    const self = this;

    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.contactFormsPost({}, {
        contactForm: contactForm
      });
    }).catch(function(error) {
      alert("Error!", error.message);
    });
  },
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    this.loadContactFormsFromServer();
    setInterval(this.loadContactFormsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div>
        <ContactFormForm onContactFormSubmit={this.handleContactFormSubmit} />
        <ContactFormList region={this.props.region} credentials={this.props.credentials} data={this.state.data} />
      </div>
    );
  }
});
