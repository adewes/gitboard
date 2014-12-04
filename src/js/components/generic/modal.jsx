/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","bootstrap","jquery"],function (React,Bootstrap,$) {
    'use'+' strict';

    var BootstrapButton = React.createClass({
      displayName: 'BootstrapButton',
      render: function() {
        // transferPropsTo() is smart enough to merge classes provided
        // to this component.
        return this.transferPropsTo(
          <a href="javascript:;" role="button" className="btn">
            {this.props.children}
          </a>
        );
      }
    });

    var BootstrapModal = React.createClass({
      // The following two methods are the only places we need to
      // integrate with Bootstrap or jQuery!
      displayName: 'BootstrapModal',
      componentDidMount: function() {
        // When the component is added, turn it into a modal
        $(this.getDOMNode())
          .modal({keyboard: false, show: this.props.show || false})
      },
      componentWillUnmount: function() {
        $(this.getDOMNode()).off('hidden', this.handleHidden);
      },

      close: function() {
        $(this.getDOMNode()).modal('hide');
        this.setState({hidden : true});
      },

      open: function() {
        $(this.getDOMNode()).modal('show');
        this.setState({hidden : false});
      },

      getInitialState : function(){
        return {hidden : true}
      },

      render: function() {
        var confirmButton = null;
        var cancelButton = null;

        if (this.props.confirm) {
          confirmButton = (
            <BootstrapButton
              onClick={this.handleConfirm}
              className="btn-primary">
              {this.props.confirm}
            </BootstrapButton>
          );
        }
        if (this.props.cancel) {
          cancelButton = (
            <BootstrapButton onClick={this.handleCancel}>
              {this.props.cancel}
            </BootstrapButton>
          );
        }

        var footer = '';

        if (this.props.onCancel !== undefined || this.props.onConfirm !== undefined)
        {
          footer = <div className="modal-footer">
            {cancelButton}
            {confirmButton}
          </div>
        }
        var content = undefined;
        if (this.state.hidden == false){
            if (this.props.getContent !== undefined)
                content = this.props.getContent();
            else
                content = this.props.children;
        }

        return (
          <div className="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="close"
                    onClick={this.handleCancel}
                    dangerouslySetInnerHTML={{__html: '&times'}}/>
                  <h3>{this.props.title}</h3>
                </div>
                <div className="modal-body">
                    {content}
                </div>
                {footer}
              </div>
            </div>
          </div>
        );
      },
      handleCancel: function() {
        if (this.props.onCancel) {
          this.props.onCancel();
        }
        this.close();
      },
      handleConfirm: function() {
        if (this.props.onConfirm) {
          this.props.onConfirm();
        }
      }
    });

    return BootstrapModal;
});
