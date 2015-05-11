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

        var RepositoryItem = React.createClass({displayName: "RepositoryItem",

            render : function(){
                return React.createElement("div", {className: "col-md-3"}, React.createElement("div", {className: "panel panel-primary organization-item"}, 
                  React.createElement(A, {href: "#/milestones/"+this.props.repository.full_name}, 
                    React.createElement("div", {className: "panel-body"}, 
                        React.createElement("h5", null, this.props.repository.name)
                    )
                    )
                ));
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
                    return React.createElement(RepositoryItem, {repository: repository});
                }.bind(this))

                return React.createElement("div", {className: "container"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-md-12"}, 
                            React.createElement("h3", null, "Your repositories")
                        )
                    ), 
                    React.createElement("div", {className: "row"}, 
                        repositoryItems
                    )
                );
            }
        });

        return Repositories;
});
