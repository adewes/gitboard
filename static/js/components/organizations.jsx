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
        "js/components/mixins/loader",
        "js/components/mixins/github_error_handler",
        "jquery"
        ],
        function (React,Utils,LoaderMixin,GithubErrorHandlerMixin,$) {
        'use'+' strict';


        var OrganizationItem = React.createClass({

            render : function(){
                console.log(this.props.organization);
                var description;
                if (this.props.organization.description)
                    description = <p>{this.props.organization.description}</p>;
                else
                    description = <p>no description available</p>;
                return <div className="col-md-3"><div className="panel panel-primary organization-item">
                  <img className="avatar" width="64" height="64" src={this.props.organization.avatar_url+'&s=64'} />
                  <A href={Utils.makeUrl("/repositories/"+this.props.organization.login)}>
                    <div className="panel-body">
                        <h4>{this.props.organization.login}</h4>
                        {description}
                    </div>
                    </A>
                </div></div>;
            }
        });

        var Organizations = React.createClass({

            mixins : [LoaderMixin,GithubErrorHandlerMixin],

            resources : function(props){
                return [{
                    name : 'organizations',
                    endpoint : this.apis.organization.getOrganizations,
                    params : [{per_page : 100}],
                    success : function(data,xhr){
                        var arr = [];
                        for(var i in data) {
                            if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                arr[+i] = data[i];
                            }
                        }
                        this.setState({organizations : arr});
                    }.bind(this)
                }];
            },

            displayName: 'Organizations',

            render: function () {
                var organizationItems = this.state.organizations.map(function(organization){
                    return <OrganizationItem organization={organization} />;
                }.bind(this))

                return <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                        <h3>Your organizations</h3>
                        </div>
                    </div>
                    <div className="row">
                        {organizationItems}
                    </div>
                </div>;
            }
        });

        return Organizations;
});
