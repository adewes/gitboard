/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react",
        "js/utils",
        "js/components/header",
        "js/components/menu",
        "jquery"
        ],
        function (React,
                  Utils,
                  Header,
                  Menu,
                  $
                  )
        {
        'use'+' strict';

        var MainApp = React.createClass({

        displayName: 'MainApp',

        componentDidMount : function(){
    
            if (Utils.isLoggedIn()){
                $(".navbar-brand").attr("href", "#/repositories");
            }

            var bodyIsTool = $("body").hasClass("app");
            if (!bodyIsTool)
              $("body").addClass("app");

        },

        render: function () {

            /*
            Parameters that we pass in:
            app       : a reference to this class instance
            params    : the URL parameters received for this request
            data      : the router data received by director.js
            user      : the current user
            baseUrl   : the base URL for the given component
            */

            var header = React.createElement(Header, {params: this.props.params, 
                                 data: this.props.data, 
                                 app: this});
            React.renderComponent(header,
              document.getElementById('header')
            );

            var menu = React.createElement(Menu, {params: this.props.params, 
                             data: this.props.data, 
                             app: this});
            React.renderComponent(menu,
              document.getElementById('menu')
            );

            var props = this.props,
                propsData = props.data;

            if (!Utils.isLoggedIn() && ! props.anonOk){
                console.log("Not logged in!");
                Utils.redirectTo("#/login");
            }

            var Component = this.props.component;
            if (this.props.callback){
                Component = this.props.callback(this.props);
            }

            return React.createElement(Component, {
                app: this, 
                baseUrl: screen.baseUrl, 
                data: propsData, 
                params: props.params});
        }
    });

    return MainApp;
});
