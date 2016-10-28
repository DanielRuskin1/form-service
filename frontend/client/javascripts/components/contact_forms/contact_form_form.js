"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

const React = require("react");

const Result = require("./result");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      name: "",
      ownerEmail: "",
      pending: false,
      lastRequestData: null
    };
  },
  handleNameChange: function(e) {
    this.setState({
      name: e.target.value
    });
  },
  handleOwnerEmailChange: function(e) {
    this.setState({
      ownerEmail: e.target.value
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();

    const self = this;

    const name = this.state.name.trim();
    const ownerEmail = this.state.ownerEmail.trim();

    // Reset state to pending + no error before submitting the request
    self.setState({ pending: true, lastRequestData: null });
    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.contactFormsPost({}, {
        contactForm: {
          name: name,
          ownerEmail: ownerEmail
        }
      });
    }).then(function(data) {
      // Make sure list is up-to-date before showing success
      self.props.onCreate().then(function() {
        self.setState({ pending: false, lastRequestData: data });
      });
    }).catch(function(error) {
      self.setState({ pending: false, lastRequestData: error });
    });

    self.setState({
      name: "",
      ownerEmail: ""
    });
  },
  render: function() {
    // Only render result if there has been an attempted request
    var result = "";
    if(this.state.pending || this.state.lastRequestData !== null) {
      result = <Result resultType="api" result={this.state.lastRequestData} uniqueErrorKey="contactFormFormErrors" />;
    }

    return (
      <form className="contactFormForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Contact Form Name"
          value={this.state.name}
          onChange={this.handleNameChange}
        />
        <input
          type="text"
          placeholder="Contact Form Email"
          value={this.state.ownerEmail}
          onChange={this.handleOwnerEmailChange}
        />
        <input type="submit" value="Create" />

        {result}
      </form>
    );
  }
});
