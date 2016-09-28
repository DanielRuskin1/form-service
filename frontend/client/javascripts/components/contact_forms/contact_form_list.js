"use strict";

const React = require("react");

const ContactForm = require("./contact_form");

module.exports = React.createClass({
  render: function() {
    const self = this;

    const contactFormNodes = self.props.data.map(function(contactForm) {
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
});
