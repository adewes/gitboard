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
                console.log(this.state.milestones);
                var milestoneItems = this.state.milestones.map(function(milestone){
                    return <li><a href={"#/sprintboard/"+this.props.data.repositoryId+"/"+milestone.number}>{milestone.title}</a></li>;
                }.bind(this))

                return <div className="container">
                    <div className="row">
                        <div className="col-md-9">
                        <h3>Your milestones</h3>
                        <ul>
                            {milestoneItems}
                        </ul>
                        </div>
                        <div className="col-md-3">
                        </div>
                    </div>
                </div>;
            }
        });

        return Milestones;
});
