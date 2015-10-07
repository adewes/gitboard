/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

/*
Copyright (c) 2015 - Andreas Dewes

This file is part of Gitboard.

Gitboard is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

define(["react","js/utils","js/flash_messages","jquery"],function (React,Utils,FlashMessagesService,$) {
    'use'+' strict';

    var FlashMessagesMixin = {

        componentWillMount : function(){
            this.flashMessagesService = FlashMessagesService.getInstance();
            this.flashMessagesService.subscribe(this.updateStatus);
        },

        componentDidMount : function(){
          this.timerId = setInterval(function(){this.forceUpdate()}.bind(this),1000);
        },

        getInitialState : function(){
            return {messages : [] };
        },

        componentWillUnmount : function(){
            this.flashMessagesService.unsubscribe(this.updateStatus);
            clearInterval(this.timerId);
        },

        updateStatus : function(subject,property,value){
            if (subject === this.flashMessagesService){
                if (property === 'newMessage'){
                  var newMessages = this.state.messages.slice(0);
                  newMessages.push(value);
                  this.setState({messages : newMessages,viewed: false});
                }
            }
        },

    };

    var FlashMessagesMenu = React.createClass({

        displayName: 'FlashMessagesMenu',

        mixins : [FlashMessagesMixin],

        markAsViewed : function(){
            this.setState({viewed : true});
        },

        getInitialState : function(){
            return {viewed : false};
        },

        render : function(){
          messageItems = this.state.messages.slice(-5).map(
              function(msg){
                var title = "Message";
                switch (msg.data.type){
                    case "warning":
                        title = "Warning";break;
                    case "error":
                    case "danger":
                        title = "Error";break;
                    case "info":
                        title = "Info";break;
                }
                if (msg.data.sticky === undefined){
                    var elapsedTime = (new Date()).getTime() - msg.receivedAt.getTime();
                    var prepareUnmount = false;
                    if (elapsedTime > msg.duration+4000)
                      return undefined;
                    if (elapsedTime > msg.duration+1000){
                      prepareUnmount = true;
                    }
                }
                return React.createElement("li", null, React.createElement(A, {href: ""}, React.createElement("h4", null, title), msg.data.description));
              }.bind(this)
            );
          messageItems = messageItems.filter(function(item){if (item !== undefined)return true;return false;}).reverse();
          if (messageItems.length){
            var messageStatus = "fa-envelope";
            var color = "yellow";
            if (this.state.viewed == true){
                messageStatus = "fa-envelope-o";
                color = "#fff";
            }
            return React.createElement("li", {className: "col-lg-8 dropdown flash-messages-menu"}, 
                React.createElement(A, {href: "#", className: "dropdown-toggle", "data-toggle": "dropdown", onClick: this.markAsViewed}, React.createElement("i", {className: "fa "+messageStatus, style: {color:color}})), 
                React.createElement("ul", {className: "dropdown-menu pull-right", role: "menu"}, 
                  messageItems
                )
              );
          }
          else{
            return React.createElement("li", null);
          }
        }
    });

    var FlashMessageItem = React.createClass({

        displayName: 'FlashMessageItem',

        render : function() {


            //<A className="alert-link" href="" onClick={this.fadeOut}>{this.props.message.data.description}<i className="fa fa-times" /></A>
            return React.createElement("div", {className: "flash alert alert-"+(this.props.message.data.type !== undefined ? this.props.message.data.type : "info")}, 
                      React.createElement("div", {className: "container"}, 
                        React.createElement("div", {className: "row"}, 
                          React.createElement("p", {key: this.props.message.id, className: "col-lg-8 pull-left"}, 
                            React.createElement(A, {className: "alert-link", href: "", onClick: this.fadeOut}, this.props.message.data.description, " ", React.createElement("i", {className: "fa fa-times"}))
                          )
                        )
                      )
                    )
        },

        componentDidMount : function(){
          try{
            var node = this.getDOMNode();
            $(node).hide();
            $(node).slideDown(400);
          }
          catch (e){

          }
        },

        componentWillReceiveProps : function(props){
          if (props.prepareUnmount && this.isMounted())
            this.fadeOut();
        },

        fadeOut : function(){
          if (! this.isMounted())
            return;
          try{
            var node = this.getDOMNode();
            $(node).slideUp(400);
          }
          catch (e){
          }
          return false;
        },

    });

    var FlashMessagesHeader = React.createClass({

        displayName: 'FlashMessagesHeader',

        mixins : [FlashMessagesMixin],

        render : function(){
          messageItems = this.state.messages.map(
              function(msg){
                var elapsedTime = (new Date()).getTime() - msg.receivedAt.getTime();
                var prepareUnmount = false;
                if (elapsedTime > msg.duration+4000)
                  return undefined;
                if (elapsedTime > msg.duration+1000){
                  prepareUnmount = true;
                }
                return React.createElement(FlashMessageItem, {key: msg.id, message: msg, prepareUnmount: prepareUnmount});
              }.bind(this)
            );
          messageItems = messageItems.filter(function(item){if (item !== undefined)return true;return false;});
          if (messageItems.length){
            return React.createElement("div", {className: "flash-messages"}, 
                        messageItems
                    );
          }
          else{
            return React.createElement("div", null);
          }
        }

    });

    return {FlashMessagesMenu : FlashMessagesMenu , FlashMessagesHeader : FlashMessagesHeader };

});


