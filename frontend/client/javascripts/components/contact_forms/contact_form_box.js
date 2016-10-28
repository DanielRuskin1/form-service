"use strict";

const React = require("react");

const ContactFormList = require("./contact_form_list");
const ContactFormForm = require("./contact_form_form");

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <ContactFormForm region={this.props.region} credentials={this.props.credentials} />
        <ContactFormList region={this.props.region} credentials={this.props.credentials} pollInterval={this.props.pollInterval} />
      </div>
    );
  }
});
