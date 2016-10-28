"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

const React = require("react");

const ContactForm = require("./contact_form");
const Result = require("./result");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      error: false
    };
  },
  loadContactFormsFromServer: function() {
    const self = this;

    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.contactFormsGet();
    }).then(function(contactFormResponse) {
      self.setState({
        error: false,
        lastRequestData: contactFormResponse,
        data: contactFormResponse.data.data.contactForms
      });
    }).catch(function(error) {
      self.setState({
        error: true,
        lastRequestData: error
      });
    });
  },
  componentDidMount: function() {
    this.loadContactFormsFromServer();
    setInterval(this.loadContactFormsFromServer, this.props.pollInterval);
  },
  render: function() {
    const self = this;

    if(self.state.error) {
      return (
        <div className="contactFormList">
          <Result result={self.state.lastRequestData} uniqueErrorKey="contactFormListErrors" />
        </div>
      );
    } else {
      const contactFormNodes = self.state.data.map(function(contactForm) {
        return (
          <ContactForm region={self.props.region} credentials={self.props.credentials} name={contactForm.name} ownerEmail={contactForm.ownerEmail} uuid={contactForm.uuid} key={contactForm.uuid}>
          </ContactForm>
        );
      });
      return (
        <div className="contactFormList">
          {contactFormNodes}
        </div>
      );
    }
  }
});
