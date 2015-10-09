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
        "js/components/mixins/github_error_handler",
        "js/components/generic/modal",
        "jquery",
        "marked"
        ],
        function (React,Utils,LoaderMixin,GithubErrorHandlerMixin,Modal,$,marked) {
        'use'+' strict';

        marked.setOptions({
          sanitize: false,
          gfm: true,
          tables: true,
          pedantic: false,
          breaks: false,
          smartLists: true,
          smartypants: false
        });

        var IssueDetails = React.createClass({

            mixins : [LoaderMixin,GithubErrorHandlerMixin],

            resources : function(props){
                return [{
                    name : 'issueDetails',
                    endpoint : this.apis.issue.getDetails,
                    params : [props.data.repositoryId,props.issue.number,{}],
                    success : function(data){
                        this.setState({issue : data});
                    }.bind(this)
                },/*{
                    name : 'issueComments',
                    endpoint : this.apis.issue.getComments,
                    params : [props.data.repositoryId,props.issue.number,{per_page : 100}],
                    success : function(data){
                        var arr = [];
                        for(var i in data) {
                            if(data.hasOwnProperty(i) && !isNaN(i)) {
                                arr[i] = data[i];
                            }
                        }
                        this.setState({comments : arr});
                    }.bind(this)
                }*/];
            },

            render :function(){
                var issue = this.state.issue;
                console.log(issue);
                var markdown = <p>(no description given)</p>;
                var assignee;
                var labels;
                if (issue.assignee !== null)
                    assignee = [<img width="16" height="16" src={this.props.issue.assignee.avatar_url+'&s=16'} />,<span className="label">{issue.assignee.login}</span>];

                try{
                    var markdownText = '(no description given)';
                    if (this.state.issue.body)
                        markdownText = marked(this.state.issue.body);
                    markdown = <div key={this.state.issue.id} dangerouslySetInnerHTML={{__html : markdownText}}></div>;
                    return markdown;
                }
                catch(err)
                {
                    markdown = <div>
                        <p>An error occured when trying to render the Markdown, sorry... Displaying RAW text instead.</p>
                        <p>
                            {this.state.issue.body}
                        </p>
                    </div>;
                }
                finally{
                    return <div className="issue-details">
                        <div className="labels">
                            <A className="pull-right" href={this.props.issue.html_url} target="_blank"><i className="octicon octicon-mark-github" /></A>
                            {assignee} {labels}
                        </div>
                        <div className="btn-group">
                            
                        </div>
                        {markdown}
                    </div>;
                }
            }
        });

    var IssueItem = React.createClass({

        showIssueDetails : function(e){
            this.setState({showDetails : true});
            e.preventDefault();
        },

        closeModal : function(e){
            console.log("closing modal");
            this.refs.issueDetails.close();
            this.setState({showDetails : false});
        },

        getInitialState : function(){
            return {showDetails : false};
        },

        componentDidUpdate : function(prevProps,prevState){
            if (this.state.showDetails)
                this.refs.issueDetails.open();
        },

        onDragStart: function(){
            console.log("Starting to drag!");
        },

        onDragEnd : function(){
            console.log("onDragEnd");
        },

        render : function(){
            var assigneeInfo;
            if (this.props.issue.assignee !== undefined && this.props.issue.assignee !== null)
                assigneeInfo = <img className="assignee" width="16" height="16" src={this.props.issue.assignee.avatar_url+'&s=16'} />;
            var labelInfo = [];
            for (var i in this.props.issue.labels){
                var label = this.props.issue.labels[i];
                labelInfo.push(<span className={"label-"+(parseInt(i)+1)} style={{background:'#'+label.color}}></span>);
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
            return <div className="panel panel-primary issue-item" onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                        draggable={true}>
              {modal}                 
              <A href="#" onClick={this.showIssueDetails}>
                <div className="panel-heading">
                    {labelInfo} <span className="assignee">{assigneeInfo}</span>
                </div>
                <div className="panel-body">
                    <h5>{this.props.issue.title}</h5>
                </div>
                </A>
            </div>;
        }
    });

        var IssueList = React.createClass({

            onDragEnter : function(e){
                console.log("Entering");
                this.props.setActiveDropzone(this.props.name);
            },

            onDragLeave : function(e){
            },

            onDragEnd : function(e){
                console.log("Drag ended");
                this.props.setActiveDropzone(undefined);
            },

            render : function(){
                return <div onDragEnter={this.onDragEnter}
                            onDragLeave={this.onDragLeave}
                            className={"col-md-3 issue-list"+(this.props.active ? ' active' : '')}>{this.props.children}</div>;
            }
        });

        var Board = React.createClass({

            mixins : [LoaderMixin],

            setActiveDropzone : function(name){
                this.setState({dropZone : name})
            },

            getInitialState : function(){
                return {dropZone : undefined};
            },

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
                return <div className="container sprintboard">
                    <div className="row">
                        
                        <IssueList setActiveDropzone={this.setActiveDropzone} name="todo" active={this.state.dropZone == "todo" ? true : false}>
                            <h4>To Do</h4>
                            {issueItems.toDo}
                        </IssueList>
                        
                        <IssueList setActiveDropzone={this.setActiveDropzone} name="doing" active={this.state.dropZone == "doing" ? true : false}>
                            <h4>Doing</h4>
                            {issueItems.doing}
                        </IssueList>
                        
                        <IssueList setActiveDropzone={this.setActiveDropzone} name="done" active={this.state.dropZone == "done" ? true : false}>
                            <h4>Done / Awaiting Review</h4>
                            {issueItems.awaitingReview}
                        </IssueList>
                        
                        <IssueList setActiveDropzone={this.setActiveDropzone} name="closed" active={this.state.dropZone == "closed" ? true : false}>
                            <h4>Closed</h4>
                            {issueItems.done}
                        </IssueList>
                    </div>
                </div>;
            }
        });

        return Board;
});
