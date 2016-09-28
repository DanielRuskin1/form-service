"use strict";

const React = require("react");

module.exports = React.createClass({
  getInitialState: function() {
    return {
      name: "",
      ownerEmail: ""
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

    const name = this.state.name.trim();
    const ownerEmail = this.state.ownerEmail.trim();

    this.props.onContactFormSubmit({
      name: name,
      ownerEmail: ownerEmail
    });
    this.setState({
      name: "",
      ownerEmail: ""
    });
  },
  render: function() {
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
      </form>
    );
  }
});
