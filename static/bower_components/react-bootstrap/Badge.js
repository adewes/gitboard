define(function (require, exports, module) {var React = require('react');
var joinClasses = require('./utils/joinClasses');
var ValidComponentChildren = require('./utils/ValidComponentChildren');
var classSet = require('./utils/classSet');

var Badge = React.createClass({displayName: 'Badge',
  propTypes: {
    pullRight: React.PropTypes.bool
  },

  render: function () {
    var classes = {
      'pull-right': this.props.pullRight,
      'badge': (ValidComponentChildren.hasValidComponent(this.props.children)
        || (typeof this.props.children === 'string'))
    };
    return (
      React.createElement("span", React.__spread({}, 
        this.props, 
        {className: joinClasses(this.props.className, classSet(classes))}), 
        this.props.children
      )
    );
  }
});

module.exports = Badge;

});
