/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","js/utils",
        "js/request_notifier",
        "js/components/generic/flash_messages",
        ],
        function (React,
                  Utils,
                  RequestNotifier,
                  FlashMessages
                  ){
        'use'+' strict';

        var RequestIndicator = React.createClass({

            displayName: 'RequestIndicator',

            getInitialState : function(){
                return {hidden : false};
            },

            hideMessage : function(){
                this.setState({hidden : true});
                return false;
            },

            componentWillReceiveProps : function(props){
                if (props.activeRequestCount !== undefined && props.activeRequestCount == 0)
                    this.setState({hidden : false});
            },

            render : function(){
                if (this.props.connectionError == true)
                    return <p className="request-indicator"><A href="" onClick={this.hideMessage}><span className="fa fa-exclamation-triangle" /> Connection problem! Trying again in {this.props.willRetryIn} s.</A></p>;
                if (this.props.activeRequestCount > 0 && ! this.state.hidden){
                    var dots = "";
                    for (var i=0;i<this.props.activeRequestCount;i++)
                        dots+=".";
                    return <p className="request-indicator"><A href="" onClick={this.hideMessage}><span className="fa fa-spin fa-refresh" /> loading data{dots}</A></p>;
                }
                else
                    return <span />;
            }
        });

        var Header = React.createClass({

            displayName: 'Header',

            componentWillMount : function(){
                this.requestNotifier = RequestNotifier.getInstance();
                Utils.addRequestNotifier(this.requestNotifier);
            },

            getInitialState : function(){
                return {activeRequestCount : 0};
            },

            componentDidMount : function(){
                this.requestNotifier.subscribe(this.updateStatus);
            },

            componentWillUnmount : function(){
                this.requestNotifier.unsubscribe(this.updateStatus);
            },

            updateStatus : function(subject,property,value){
                if (subject === this.requestNotifier){
                    if (property == 'connectionError'){
                            this.setState({connectionError : true,
                                    willRetryIn : value.requestData.data.retryInterval || 1});
                            setTimeout(function(){
                                this.setState({connectionError : false});
                            }.bind(this),4000 );
                    }
                    if (property === 'activeRequestCount'){
                        setTimeout(function(count){
                            if (this.requestNotifier.activeRequestCount() == count)
                                this.setState({activeRequestCount :count});
                        }.bind(this,value),200);
                    }
                }
            },

            render: function () {
                var FlashMessagesHeader = FlashMessages.FlashMessagesHeader;
                var flashMessagesHeader = <FlashMessagesHeader baseUrl={this.props.baseUrl} params={this.props.params} />;

                var requestIndicator = undefined;

                if (this.state.activeRequestCount > 0 || this.state.connectionError)
                    requestIndicator = <RequestIndicator willRetryIn={this.state.willRetryIn} connectionError={this.state.connectionError} activeRequestCount={this.state.activeRequestCount} baseUrl={this.props.baseUrl} params={this.props.params} data={this.props.data} />;
                return <div className="header">
                    {flashMessagesHeader}
                    {requestIndicator}
                </div>;
            }
        });

        return Header;
});
