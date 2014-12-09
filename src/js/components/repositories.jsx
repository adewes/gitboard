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
        "js/components/mixins/loader",
        "jquery"
        ],
        function (React,Utils,LoaderMixin,$) {
        'use'+' strict';

        var RepositoryItem = React.createClass({

            render : function(){
                return <div className="col-md-3"><div className="panel panel-primary organization-item">
                  <a href={"#/milestones/"+this.props.repository.full_name}>
                    <div className="panel-body">
                        <h5>{this.props.repository.name}</h5>
                    </div>
                    </a>
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
