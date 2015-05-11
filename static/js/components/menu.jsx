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
                var flashMessagesMenu = <FlashMessagesMenu baseUrl={this.props.baseUrl} params={this.props.params} />;
                flashMessagesMenu = undefined;  /* quick switch to activate or deactivate */

                var projectMenu = undefined;

                if (Utils.isLoggedIn())
                {
                    return <div><ul className="nav navbar-nav">
                        <li><A href="#/organizations">Organizations</A></li>
                        <li><A href="#/repositories">Repositories</A></li>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        {projectMenu}
                        <li><A href="#/settings"><i className="fa fa-gears"></i></A></li>
                        <li><A href="#/logout">Logout</A></li>
                    </ul>
                    </div>;
                }
                else
                {
                    return <div>
                        <ul className="nav navbar-nav">
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li><A href="#/login">Login</A></li>
                            {flashMessagesMenu}
                        </ul>
                    </div>;
                }
            }
        });

        return Menu;
});
