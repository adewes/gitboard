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

define(["js/settings",
        "js/utils",
        "js/flash_messages",
        "react"],function (
                    settings,
                    Utils,
                    FlashMessagesService,
                    React
                ) {
    'use strict';

    var Logout = React.createClass({

        displayName: "LogoutComponent",


        componentWillMount : function(){
            Utils.logout();
        },

        render: function () {

            var statusMessage;

            return <div className="container">
                        <div className="row">
                            &nbsp;
                        </div>
                        <div className="row">
                            <div className="col-xs-4 col-xs-offset-4">
                                <div className="well bs-component">
                                    <h3>You have been logged out</h3>
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h5>Security notice</h5>
                                        </div>
                                        <div className="panel-body">
                                            <p>We cannot delete your authorization from Github without your username and password. If you want to delete it, you can do so manually <a href="https://github.com/settings/tokens">here</a> (look for the <strong>gitboard</strong> token)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        },

    });

    return Logout;

});
