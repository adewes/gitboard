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


        var MilestoneItem = React.createClass({

            render : function(){
                return <div className="col-md-3"><div className="panel panel-primary milestone-item">
                  <A href={Utils.makeUrl("/sprintboard/"+this.props.repository.full_name+"/"+this.props.milestone.number)}>
                    <div className="panel-body">
                        <h5>{this.props.milestone.title}</h5>
                    </div>
                    </A>
                </div></div>;
            }
        });

        var Milestones = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props){
                return [
                        {
                            name : 'repository',
                            endpoint : this.apis.repository.getDetails,
                            params : [props.data.repositoryId,{}],
                            success : function(data){
                                this.setState({repository : data})
                            }.bind(this)
                        },
                        {
                        name : 'milestones',
                        endpoint : this.apis.milestone.getMilestones,
                        params : [props.data.repositoryId,{per_page : 100}],
                        success : function(data,xhr){

                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            this.setState({milestones : arr});
                        }.bind(this)
                       }];
            },

            displayName: 'Milestones',

            render: function () {
                var milestoneItems = this.state.milestones.map(function(milestone){
                    return <MilestoneItem milestone={milestone} repository={this.state.repository} />;
                }.bind(this))

                return <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>Your Milestones</h3>
                        </div>
                    </div>
                    <div className="row">
                        {milestoneItems}
                    </div>
                </div>;
            }
        });

        return Milestones;
});
