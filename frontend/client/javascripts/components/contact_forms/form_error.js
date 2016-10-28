"use strict";

const React = require("react");

module.exports = React.createClass({
  render: function() {
    return (
      <div className="formError">
        {this.props.message}
      </div>
    );
  }
});
