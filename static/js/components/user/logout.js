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

            return React.createElement("div", {className: "container"}, 
                        React.createElement("div", {className: "row"}, 
                            React.createElement("div", {className: "col-xs-4 col-xs-offset-4"}, 
                                React.createElement("div", {className: "well bs-component"}, 
                                    React.createElement("h3", null, "Logout successful")
                                )
                            )
                        )
                    )
        },

    });

    return Logout;

});
