"use strict";

const React = require("react");

const ContactFormList = require("./contact_form_list");
const ContactFormForm = require("./contact_form_form");

module.exports = React.createClass({
  updateContactFormList: function() {
    return this.contactFormList.loadContactFormsFromServer();
  },
  render: function() {
    return (
      <div>
        <ContactFormForm region={this.props.region} credentials={this.props.credentials} onCreate={this.updateContactFormList} />
        <ContactFormList region={this.props.region} credentials={this.props.credentials} pollInterval={this.props.pollInterval} ref={(contactFormList) => this.contactFormList = contactFormList} />
      </div>
    );
  }
});
