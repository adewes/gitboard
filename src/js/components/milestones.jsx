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
                return [
                    {
                        name : 'milestones',
                        endpoint : this.apis.milestone.getMilestones,
                        params : [props.user.login,props.repository.name,{per_page : 100}],
                        success : function(data,xhr){

                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            this.setState({milestones : arr});
                        }.bind(this)
                    }
                ];
            },


            displayName: 'Milestones',

            render: function () {

                return <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                        <h3>To Do</h3>
                        </div>
                        <div className="col-md-3">
                        <h3>Doing</h3>
                        </div>
                        <div className="col-md-3">
                        <h3>Awaiting Review</h3>
                        </div>
                        <div className="col-md-3">
                        <h3>Done</h3>
                        </div>
                    </div>
                </div>;
            }
        });

        return Milestones;
});
