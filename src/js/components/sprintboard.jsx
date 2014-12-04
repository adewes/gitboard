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
        "js/components/generic/modal",
        "jquery",
        "marked"
        ],
        function (React,Utils,LoaderMixin,Modal,$,marked) {
        'use'+' strict';

        marked.setOptions({
          renderer: new marked.Renderer(),
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: true,
          smartLists: true,
          smartypants: false
        });

        var IssueDetails = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                return [{
                    name : 'issueDetails',
                    endpoint : this.apis.issue.getDetails,
                    params : [props.data.repositoryId,props.issue.number,{}],
                    success : function(data){
                        this.setState({issue : data});
                    }.bind(this)
                },{
                    name : 'issueComments',
                    endpoint : this.apis.issue.getComments,
                    params : [props.data.repositoryId,props.issue.number,{per_page : 100}],
                    success : function(data){
                        var arr = [];
                        for(var i in data) {
                            if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                arr[+i] = data[i];
                            }
                        }
                        this.setState({comments : arr});
                    }.bind(this)
                }];
            },

            render :function(){
                return <div dangerouslySetInnerHTML={{__html : marked(this.state.issue.body)}} />;
            }
        });

        var IssueItem = React.createClass({

            showIssueDetails : function(e){
                this.setState({showDetails : true});
                e.preventDefault();
            },

            closeModal : function(e){
                this.refs.issueDetails.close();
                $(".modal-backdrop").remove();
            },

            getInitialState : function(){
                return {showDetails : false};
            },

            componentDidUpdate : function(prevProps,prevState){
                if (this.state.showDetails)
                    this.refs.issueDetails.open();
            },

            render : function(){
                var assigneeInfo;
                if (this.props.issue.assignee !== undefined && this.props.issue.assignee !== null)
                    assigneeInfo = <img width="16" height="16" src={this.props.issue.assignee.avatar_url+'&s=16'} />;
                var labelInfo = [];
                for (var i in this.props.issue.labels){
                    var label = this.props.issue.labels[i];
                    labelInfo.push(<span className="label" style={{background:'#'+label.color}}>{label.name}</span>);
                    labelInfo.push(' ');
                }
                var modal;
                if (this.state.showDetails){
                    modal = <Modal
                        ref="issueDetails"
                        cancel="Close"
                        onCancel={this.closeModal}
                        onConfirm={this.closeModal}
                        title={this.props.issue.title}>
                        <IssueDetails issue={this.props.issue} data={this.props.data}/>
                      </Modal>   
                }
                return <div className="panel panel-default" draggable={true}>
                  {modal}                 
                  <a href="#" onClick={this.showIssueDetails}>
                    <div className="panel-body">
                        <h6>{this.props.issue.title} <span className="assignee">{assigneeInfo}</span></h6>
                        {labelInfo}
                    </div>
                    </a>
                </div>;
            }
        });

        var Board = React.createClass({

            mixins : [LoaderMixin],

            resources : function(props,state){
                return [
                    {
                        name : 'openIssues',
                        endpoint : this.apis.issue.getIssues,
                        params : [props.data.repositoryId,{state: 'open',per_page : 100,milestone : props.data.milestoneId}],
                        success : function(data,xhr){
                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            this.setState({openIssues : arr});
                        }.bind(this),
                    },
                    {
                        name : 'closedIssues',
                        endpoint : this.apis.issue.getIssues,
                        params : [props.data.repositoryId,{state :'closed',per_page : 100,milestone : props.data.milestoneId}],
                        success : function(data,xhr){
                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            this.setState({closedIssues : arr});
                        }.bind(this),
                    }
                ];
            },

            displayName: 'SprintBoard',

            categorizeIssues : function(openIssues,closedIssues){
                var categories = {doing : [],done : [],awaitingReview : [],toDo : []};
                for (var i in openIssues){
                    var issue = openIssues[i];
                    var category = 'toDo';
                    for (var j in issue.labels){
                        var label = issue.labels[j];
                        if (label.name == 'doing'){
                            category = 'doing';
                            break;
                        }
                        else if (label.name == 'done' || label.name == 'awaiting-review'){
                            category = 'awaitingReview';
                            break;
                        }
                    }
                    categories[category].push(issue);
                }
                categories.done = closedIssues;
                return categories;
            },

            render: function () {
                var categories = this.categorizeIssues(this.state.openIssues,this.state.closedIssues);
                var issueItems = {};
                for (var category in categories){
                    var issues = categories[category];
                    issueItems[category] = issues.map(function(issue){return <IssueItem data={this.props.data} key={issue.number} issue={issue} />;}.bind(this));
                }
                return <div className="container-wide">
                    <div className="row">
                        <div className="col-xs-3">
                        <h3>To Do</h3>
                        {issueItems.toDo}
                        </div>
                        <div className="col-xs-3">
                        <h3>Doing</h3>
                        {issueItems.doing}
                        </div>
                        <div className="col-xs-3">
                        <h3>Awaiting Review</h3>
                        {issueItems.awaitingReview}
                        </div>
                        <div className="col-xs-3">
                        <h3>Done</h3>
                        {issueItems.done}
                        </div>
                    </div>
                </div>;
            }
        });

        return Board;
});
