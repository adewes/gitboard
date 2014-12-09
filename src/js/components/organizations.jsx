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


        var OrganizationItem = React.createClass({

            render : function(){
                return <div className="col-md-3"><div className="panel panel-primary organization-item">
                  <a href={"#/repositories/"+this.props.organization.login}>
                    <div className="panel-body">
                        <h5>{this.props.organization.login}</h5>
                    </div>
                    </a>
                </div></div>;
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
