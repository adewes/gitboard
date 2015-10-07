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

        var RepositoryItem = React.createClass({

            render : function(){
                return <div className="col-md-3">
                    <div className="panel panel-primary repository-item">
                        <A href={Utils.makeUrl("/milestones/"+this.props.repository.full_name)}>
                            <div className="panel-body">
                                <h4>{this.props.repository.name}</h4>
                                <span className="label label-default">{this.props.repository.open_issues} open issues</span>
                            </div>
                        </A>
                    </div>
                </div>;
            }
        });

        var Repositories = React.createClass({

            mixins : [LoaderMixin,GithubErrorHandlerMixin],

            resources : function(props){

                var processRepositories =  function(data,xhr){
                    var repos_array = [];
                    for(var i in data) {
                        if (data[i].open_issues == 0 || data[i].has_issues == false)
                            continue;
                        if(data.hasOwnProperty(i) && !isNaN(+i)) {
                            repos_array[+i] = data[i];
                        }
                    }
                    this.setState({repositories : repos_array});
                }.bind(this);

                if (props.data.organizationId !== undefined || props.data.userId !== undefined)
                    return [{
                            name : 'repositories',
                            endpoint : (props.data.organizationId ? this.apis.organization.getRepositories :
                                                                   this.apis.user.getUserRepositories),
                            params : [props.data.organizationId ? props.data.organizationId : props.data.userId,
                                      {per_page : 100,sort: 'pushed'}],
                            success : processRepositories
                        }];
                else
                    return [{
                            name : 'repositories',
                            endpoint : this.apis.user.getRepositories,
                            params : [{per_page : 100}],
                            success : processRepositories
                    }];
            },

            displayName: 'Repositories',

            render: function () {
                var repositoryItems = this.state.repositories.map(function(repository){
                    return <RepositoryItem repository={repository} />;
                }.bind(this))

                if (repositoryItems.length == 0)
                    repositoryItems = [<p className="alert alert-info">Seems there is nothing to show here.</p>]

                return <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>Your repositories</h3>
                        </div>
                    </div>
                    <div className="row">
                        {repositoryItems}
                    </div>
                </div>;
            }
        });

        return Repositories;
});
