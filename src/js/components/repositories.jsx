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
        "jquery"
        ],
        function (React,Utils,LoaderMixin,$) {
        'use'+' strict';

        var RepositoryItem = React.createClass({

            render : function(){
                return <div className="col-md-3"><div className="panel panel-primary organization-item">
                  <A href={"#/milestones/"+this.props.repository.full_name}>
                    <div className="panel-body">
                        <h5>{this.props.repository.name}</h5>
                    </div>
                    </A>
                </div></div>;
            }
        });

        var Repositories = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                r = [{
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        success : function(data,xhr){
                            this.setState({user : data});
                        }.bind(this),
                    }];
                if (state.user !== undefined || props.data.organizationId !== undefined)
                    r.push({
                            name : 'repositories',
                            endpoint : props.data.organizationId !== undefined ? 
                                        this.apis.organization.getRepositories : 
                                        this.apis.user.getRepositories,
                            params : [props.data.organizationId || state.user.login,
                                      {per_page : 100}],
                            success : function(data,xhr){

                                var repos_array = [];
                                for(var i in data) {
                                    if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                        repos_array[+i] = data[i];
                                    }
                                }
                                this.setState({repositories : repos_array});
                            }.bind(this)
                        });
                return r;
            },

            displayName: 'Repositories',

            render: function () {
                var repositoryItems = this.state.repositories.map(function(repository){
                    return <RepositoryItem repository={repository} />;
                }.bind(this))

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
