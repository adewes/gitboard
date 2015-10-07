/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","jquery","bootstrap"],function (React,$,Bootstrap) {
    'use strict';

    var BootstrapModal = React.createClass({
      // The following two methods are the only places we need to
      // integrate with Bootstrap or jQuery!
      displayName: 'BootstrapModal',

      close: function() {
        this.setState({hidden : true});
      },

      open: function() {
        this.setState({hidden : false});
      },

      getInitialState : function(){
        return {hidden : this.props.hidden !== undefined ? this.props.hidden : true}
      },

      getDefaultProps : function(){
        return {closable : true,disabled : false};
      },

      componentWillReceiveProps : function(props){
        if (props.hidden && props.hidden != this.state.hidden)
            this.setState({hidden : props.hidden});
      },

      render: function() {
        if (this.state.hidden)
            return React.createElement("div", {ref: "modal"});

        var confirmButton;
        var cancelButton;

        if (this.props.confirm) {
          confirmButton = (
            React.createElement("button", {
              onClick: this.handleConfirm, 
              disabled: this.props.disabled, 
              className: "btn btn-primary"}, 
              this.props.confirm
            )
          );
        }

        var closeButton;

        if (this.props.closable){
          closeButton = React.createElement("button", {
            type: "button", 
            className: "close", 
            disabled: this.props.disabled, 
            onClick: this.handleCancel}, 
              "×"
          )
        }

        if (this.props.cancel) {
          cancelButton = (
            React.createElement("button", {className: "btn", disabled: this.props.disabled, onClick: this.handleCancel}, 
              this.props.cancel
            )
          );
        }

        var footer;

        if (this.props.onCancel || this.props.onConfirm) {
          footer = React.createElement("div", {className: "modal-footer"}, 
            cancelButton, 
            confirmButton
          )
        }
        var content;

        if (this.props.getContent)
            content = this.props.getContent();
        else
            content = this.props.children;

        return (
          React.createElement("div", {className: "modal show", ref: "modal"}, 
            React.createElement("div", {className: "modal-dialog"}, 
              React.createElement("div", {className: "modal-content"}, 
                React.createElement("div", {className: "modal-header"}, 
                  closeButton, 
                  React.createElement("h3", null, this.props.title)
                ), 
                React.createElement("div", {className: "modal-body"}, 
                    content
                ), 
                footer
              )
            ), 
            React.createElement("div", {className: "modal-backdrop in", onClick: this.props.closable ? this.handleCancel : function(e){e.preventDefault();}})
          )
        );
      },

      handleCancel: function(e) {
        if (this.props.onCancel)
          this.props.onCancel(e);
        e.preventDefault();
        this.close();
      },

      handleConfirm: function(e) {
        if (this.props.onConfirm)
          this.props.onConfirm(e);
        e.preventDefault();
      }
    });

    return BootstrapModal;
});
