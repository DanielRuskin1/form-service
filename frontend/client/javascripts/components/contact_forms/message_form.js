"use strict";

const GetApiGatewayClient = require("../../helpers/get_api_gateway_client");

const React = require("react");

const Result = require("./result");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      subject: "",
      from: "",
      message: "",
      pending: false,
      lastRequestData: null
    };
  },
  handleSubjectChange: function(e) {
    this.setState({
      subject: e.target.value
    });
  },
  handleFromChange: function(e) {
    this.setState({
      from: e.target.value
    });
  },
  handleMessageChange: function(e) {
    this.setState({
      message: e.target.value
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();

    const self = this;

    const subject = this.state.subject.trim();
    const from = this.state.from.trim();
    const message = this.state.message.trim();

    // Reset state to pending + no error before submitting the request
    self.setState({ pending: true, lastRequestData: null });
    GetApiGatewayClient(self.props.region, self.props.credentials).then(function(client) {
      return client.messagesSendPost({}, {
        message: {
          contactFormUuid: self.props.contactFormUuid,
          subject: subject,
          from: from,
          message: message
        }
      });
    }).then(function(data) {
      self.setState({ pending: false, lastRequestData: data });
    }).catch(function(error) {
      self.setState({ pending: false, lastRequestData: error });
    });

    this.setState({
      subject: "",
      from: "",
      message: ""
    });
  },
  render: function() {
    const uniqueErrorKey = this.props.contactFormUuid + "errors";

    // Only render result if there has been an attempted request
    var resultArray = [];
    if(this.state.pending || this.state.lastRequestData !== null) {
      resultArray.unshift(
        <Result result={this.state.lastRequestData} uniqueErrorKey={uniqueErrorKey} />
      );
    }

    return (
      <form className="messageForm" onSubmit={this.handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="From"
            value={this.state.from}
            onChange={this.handleFromChange}
          />
          <input
            type="text"
            placeholder="Subject"
            value={this.state.subject}
            onChange={this.handleSubjectChange}
          />
          <textarea
            type="text"
            placeholder="Message"
            value={this.state.message}
            onChange={this.handleMessageChange}
          />
        </div>
        <input type="submit" value="Send" />

        {resultArray}
      </form>
    );
  }
});
