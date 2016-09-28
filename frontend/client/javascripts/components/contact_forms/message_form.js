"use strict";

const React = require("react");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      subject: "",
      from: "",
      message: ""
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

    const subject = this.state.subject.trim();
    const from = this.state.from.trim();
    const message = this.state.message.trim();

    this.props.handleMessageSubmit({
      subject: subject,
      from: from,
      message: message
    });
    this.setState({
      subject: "",
      from: "",
      message: ""
    });
  },
  render: function() {
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
      </form>
    );
  }
});
