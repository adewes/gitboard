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
                if (Utils.isLoggedIn())
                    return [
                    {
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        nonBlocking : true,
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
                        <li><a href="#/organizations">Organizations</a></li>
                        <li><a href="#/repositories">Repositories</a></li>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        {projectMenu}
                        <li><a href="#/settings"><i className="fa fa-gears"></i></a></li>
                        <li><a href="#/logout">Logout</a></li>
                    </ul>
                    </div>;
                }
                else
                {
                    return <div>
                        <ul className="nav navbar-nav">
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li><a href="#/login">Login</a></li>
                            {flashMessagesMenu}
                        </ul>
                    </div>;
                }
            }
        });

        return Menu;
});
