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
        "js/components/sprint/board",
        "js/components/user/login",
        "js/flash_messages",
        "jquery"
        ],
        function (React,
                  Utils,
                  Header,
                  Menu,
                  SprintBoard,
                  Login,
                  FlashMessagesService,
                  $
                  )
        {
        'use'+' strict';

        var MainApp = React.createClass({

        displayName: 'MainApp',

        getInitialState: function () {
            return {params: {}};
        },

        getDefaultProps : function (){
            return {data : undefined};
        },

        componentWillMount : function(){
            this.flashMessagesService = FlashMessagesService.getInstance();
        },

        componentDidMount : function(){
    
            if (Utils.isLoggedIn()){
                $(".navbar-brand").attr("href", "#/projects");
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

            var header = <Header params={this.props.params}
                                 data={this.props.data}
                                 app={this} />;
            React.renderComponent(header,
              document.getElementById('header')
            );

            var menu = <Menu params={this.props.params}
                             data={this.props.data}
                             app={this} />;
            React.renderComponent(menu,
              document.getElementById('menu')
            );


            var dashboard = function(screen) {
                if (Utils.isLoggedIn())
                    return React.DOM.div;
                return React.DOM.div;
            };
            var props = this.props,
                propsData = props.data;

            var screens = {
                '_default' : {
                    callback : dashboard
                },
                'login' : {
                    component : Login,
                    baseUrl : "#/login",
                    },
                'board' : {
                    component : SprintBoard,
                    baseUrl : "#/board",
                    },
            };


            var screen = $.extend({},screens['_default']);
            if (props.screen in screens)
                screen = $.extend({},screens[props.screen]);

            var Component = screen.component;
            if (screen.callback !== undefined){
                Component = screen.callback(screen);
            }

            return <Component
                app={this}
                baseUrl={screen.baseUrl}
                data={propsData}
                params={props.params}/>;
        }
    });

    return MainApp;
});
