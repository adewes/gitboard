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

            this.renderDependentComponents();
        },

        renderDependentComponents : function(){

            var header = <Header params={this.props.params}
                            data={this.props.data}
                            app={this} />;

            var menu = <Menu params={this.props.params}
                             data={this.props.data}
                             app={this} />;

            //call React.render outside of the render function below.
            //Calling it from within the render function is not supported by React
            //and might break in a future version.
            React.render(header,
              document.getElementById('header')
            );

            React.render(menu,
              document.getElementById('menu')
            );
        },

        componentDidUpdate: function() {
            this.renderDependentComponents();
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

            var props = this.props,
                propsData = props.data;

            if (!Utils.isLoggedIn() && ! props.anonOk){
                Utils.redirectTo(Utils.makeUrl("/login"));
            }

            var Component = this.props.component;
            if (this.props.callback){
                Component = this.props.callback(this.props);
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
