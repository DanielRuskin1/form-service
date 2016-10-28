"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

const React = require("react");

const ContactForm = require("./contact_form");
const Result = require("./result");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      fetchData: null
    };
  },
  loadContactFormsFromServer: function() {
    const self = this;

    return GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.contactFormsGet();
    }).then(function(contactFormResponse) {
      self.setState({
        fetchData: contactFormResponse
      });
    }).catch(function(error) {
      self.setState({
        fetchData: error
      });
    });
  },
  componentDidMount: function() {
    this.loadContactFormsFromServer();
    setInterval(this.loadContactFormsFromServer, this.props.pollInterval);
  },
  render: function() {
    const self = this;

    if(self.state.fetchData === null || self.state.fetchData.status !== 200) {
      return (
        <div className="contactFormList">
          <Result result={self.state.fetchData} uniqueErrorKey="contactFormListErrors" />
        </div>
      );
    } else {
      const contactFormNodes = self.state.fetchData.data.data.contactForms.map(function(contactForm) {
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
