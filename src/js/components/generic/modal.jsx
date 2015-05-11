/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","jquery","bootstrap"],function (React,$,Bootstrap) {
    'use'+' strict';

    var BootstrapButton = React.createClass({
      displayName: 'BootstrapButton',
      render: function() {
        // transferPropsTo() is smart enough to merge classes provided
        // to this component.
        return this.transferPropsTo(
          <A role="button" className="btn">
            {this.props.children}
          </A>
        );
      }
    });

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

      componentDidUpdate : function(){
        if (!this.isMounted())
            return;
      },

      render: function() {

        if (this.state.hidden)
            return <div ref="modal"/>;

        var confirmButton;
        var cancelButton;

        if (this.props.confirm) {
          confirmButton = (
            <BootstrapButton
              onClick={this.handleConfirm}
              disabled={this.props.disabled}
              className="btn-primary">
              {this.props.confirm}
            </BootstrapButton>
          );
        }

        var closeButton;

        if (this.props.closable){
          closeButton = <button
            type="button"
            className="close"
            disabled={this.props.disabled}
            onClick={this.handleCancel}
            dangerouslySetInnerHTML={{__html: '&times'}}/>
        }

        if (this.props.cancel) {
          cancelButton = (
            <BootstrapButton disabled={this.props.disabled} onClick={this.handleCancel}>
              {this.props.cancel}
            </BootstrapButton>
          );
        }


        var footer = '';

        if (this.props.onCancel || this.props.onConfirm)
        {
          footer = <div className="modal-footer">
            {cancelButton}
            {confirmButton}
          </div>
        }
        var content;

        if (this.props.getContent)
            content = this.props.getContent();
        else
            content = this.props.children;

        return (
          <div className="modal show" ref="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  {closeButton}
                  <h3>{this.props.title}</h3>
                </div>
                <div className="modal-body">
                    {content}
                </div>
                {footer}
              </div>
            </div>
            <div className="modal-backdrop in" onClick={this.props.closable ? this.handleCancel : function(e){e.preventDefault();}}></div>
          </div>
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
