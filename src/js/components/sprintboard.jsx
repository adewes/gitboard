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

        var Board = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                return [
                    {
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        nonBlocking : true,
                    },
                    {
                        name : 'issues',
                        endpoint : this.apis.issue.getIssues,
                        params : ['quantifiedcode','webapp',{per_page : 100}],
                        mapping : {
                            'issues' : undefined,
                        },
                        success : function(data,xhr){
                            console.log(data);
                        },
                    }
                ];
            },

            displayName: 'SprintBoard',

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

        return Board;
});
