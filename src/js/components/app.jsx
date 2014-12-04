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
        "js/components/mixins/loader",
        "js/components/sprintboard",
        "js/components/milestones",
        "js/components/repositories",
        "js/components/organizations",
        "js/components/user/login",
        "js/flash_messages",
        "jquery"
        ],
        function (React,
                  Utils,
                  Header,
                  Menu,
                  LoaderMixin,
                  SprintBoard,
                  Milestones,
                  Repositories,
                  Organizations,
                  Login,
                  FlashMessagesService,
                  $
                  )
        {
        'use'+' strict';

        var MainApp = React.createClass({

        displayName: 'MainApp',

        componentWillMount : function(){
            this.flashMessagesService = FlashMessagesService.getInstance();
        },

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


            var logout = function(screen){
                Utils.logout();
                console.log("Logged out!");
                Utils.redirectTo("#/");
                return React.DOM.div;
            };

            var dashboard = function(screen) {
                if (Utils.isLoggedIn())
                    return React.DOM.div;
                return React.DOM.div;
            };
            var props = this.props,
                propsData = props.data;
            console.log(Utils.isLoggedIn());

            if (!Utils.isLoggedIn() && ! props.anonOk){
                console.log("Not logged in!");
                Utils.redirectTo("#/login");
            }

            var screens = {
                '_default' : {
                    callback : dashboard
                },
                'login' : {
                    component : Login,
                    baseUrl : "#/login",
                    },
                'logout' : {
                    callback : logout,
                    baseUrl : '#/logout',
                },
                'sprintboard' : {
                    component : SprintBoard,
                    baseUrl : "#/sprintboard/"+props.data.repositoryId+'/'+props.data.milestoneId,
                    },
                'repositories' : {
                    component : Repositories,
                    baseUrl : "#/repositories"+(this.props.data.organizationId !== undefined ? '/'+this.props.data.organizationId : ''),
                    },
                'organizations' : {
                    component : Organizations,
                    baseUrl : "#/organizations",
                    },
                'milestones' : {
                    component : Milestones,
                    baseUrl : "#/milestones/"+props.data.repositoryId,
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
