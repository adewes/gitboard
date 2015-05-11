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


        var MilestoneItem = React.createClass({displayName: "MilestoneItem",

            render : function(){
                return React.createElement("div", {className: "col-md-3"}, React.createElement("div", {className: "panel panel-primary milestone-item"}, 
                  React.createElement(A, {href: "#/sprintboard/"+this.props.repository.full_name+"/"+this.props.milestone.number}, 
                    React.createElement("div", {className: "panel-body"}, 
                        React.createElement("h5", null, this.props.milestone.title)
                    )
                    )
                ));
            }
        });

        var Milestones = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                r =  [
                    {
                        name : 'repository',
                        endpoint : this.apis.repository.getDetails,
                        params : [props.data.repositoryId,{}],
                        success : function(data){
                            this.setState({repository : data})
                        }.bind(this)
                    }
                ]
                if (state.repository !== undefined)
                    r.push({
                        name : 'milestones',
                        endpoint : this.apis.milestone.getMilestones,
                        params : [state.repository.full_name,{per_page : 100}],
                        success : function(data,xhr){

                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            this.setState({milestones : arr});
                        }.bind(this)
                    });
                return r;
            },


            displayName: 'Milestones',

            render: function () {
                var milestoneItems = this.state.milestones.map(function(milestone){
                    return React.createElement(MilestoneItem, {milestone: milestone, repository: this.state.repository});
                }.bind(this))

                return React.createElement("div", {className: "container"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-md-12"}, 
                            React.createElement("h3", null, "Your Milestones")
                        )
                    ), 
                    React.createElement("div", {className: "row"}, 
                        milestoneItems
                    )
                );
            }
        });

        return Milestones;
});
