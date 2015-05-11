/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","js/utils",
        "js/api/github/user",
        "js/components/generic/flash_messages",
        "js/components/mixins/loader",
        "js/flash_messages",
        "jquery"
        ],
        function (React,Utils,UserApi,FlashMessages,LoaderMixin,FlashMessagesService,$) {
        'use'+' strict';

        var Menu = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                var logout  = function(){
                    Utils.logout();
                    Utils.redirectTo(Utils.makeUrl('#/login'));
                };
                
                if (Utils.isLoggedIn())
                    return [
                    {
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        nonBlocking : true,
                        error : logout
                    }
                    ];
                return [];
            },

            silentLoading : true,

            displayName: 'Menu',
            getInitialState: function () {
                return {user: {admin: false}, project: {roles: {admin: []}}};
            },

            getDefaultProps : function (){
                return {};
            },

            componentWillMount : function(){
                this.userApi = UserApi.getInstance();
                this.flashMessagesService = FlashMessagesService.getInstance();
            },

            render: function () {

                var adminMenu = undefined;

                var FlashMessagesMenu = FlashMessages.FlashMessagesMenu;
                var flashMessagesMenu = React.createElement(FlashMessagesMenu, {baseUrl: this.props.baseUrl, params: this.props.params});
                flashMessagesMenu = undefined;  /* quick switch to activate or deactivate */

                var projectMenu = undefined;

                if (Utils.isLoggedIn())
                {
                    return React.createElement("div", null, React.createElement("ul", {className: "nav navbar-nav"}, 
                        React.createElement("li", null, React.createElement(A, {href: "#/organizations"}, "Organizations")), 
                        React.createElement("li", null, React.createElement(A, {href: "#/repositories"}, "Repositories"))
                    ), 
                    React.createElement("ul", {className: "nav navbar-nav navbar-right"}, 
                        projectMenu, 
                        React.createElement("li", null, React.createElement(A, {href: "#/settings"}, React.createElement("i", {className: "fa fa-gears"}))), 
                        React.createElement("li", null, React.createElement(A, {href: "#/logout"}, "Logout"))
                    )
                    );
                }
                else
                {
                    return React.createElement("div", null, 
                        React.createElement("ul", {className: "nav navbar-nav"}
                        ), 
                        React.createElement("ul", {className: "nav navbar-nav navbar-right"}, 
                            React.createElement("li", null, React.createElement(A, {href: "#/login"}, "Login")), 
                            flashMessagesMenu
                        )
                    );
                }
            }
        });

        return Menu;
});
