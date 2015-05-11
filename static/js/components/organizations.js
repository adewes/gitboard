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


        var OrganizationItem = React.createClass({displayName: "OrganizationItem",

            render : function(){
                return React.createElement("div", {className: "col-md-3"}, React.createElement("div", {className: "panel panel-primary organization-item"}, 
                  React.createElement(A, {href: "#/repositories/"+this.props.organization.login}, 
                    React.createElement("div", {className: "panel-body"}, 
                        React.createElement("h5", null, this.props.organization.login)
                    )
                    )
                ));
            }
        });

        var Organizations = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                r = [{
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        success : function(data,xhr){
                            this.setState({user : data});
                        }.bind(this),
                    }];
                if (state.user !== undefined){
                    console.log("Adding organization");
                    r.push(
                        {
                            name : 'organizations',
                            endpoint : this.apis.organization.getOrganizations,
                            params : [state.user.login,{per_page : 100}],
                            success : function(data,xhr){
                                var arr = [];
                                for(var i in data) {
                                    if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                        arr[+i] = data[i];
                                    }
                                }
                                this.setState({organizations : arr});
                            }.bind(this)
                        });
                }
                return r;
            },

            displayName: 'Organizations',

            render: function () {
                var organizationItems = this.state.organizations.map(function(organization){
                    return React.createElement(OrganizationItem, {organization: organization});
                }.bind(this))

                return React.createElement("div", {className: "container"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-md-12"}, 
                        React.createElement("h3", null, "Your organizations")
                        )
                    ), 
                    React.createElement("div", {className: "row"}, 
                        organizationItems
                    )
                );
            }
        });

        return Organizations;
});
