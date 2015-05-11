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
          sanitize: true
        });

        var IssueDetails = React.createClass({displayName: "IssueDetails",

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
                            if(data.hasOwnProperty(i) && !isNaN(i)) {
                                arr[i] = data[i];
                            }
                        }
                        this.setState({comments : arr});
                    }.bind(this)
                }];
            },

            render :function(){
                var markdown = React.createElement("p", null, "(no description given)");
                try{
                    var markdownText = '(no description given)';
                    if (this.state.issue.body)
                        markdownText = marked(this.state.issue.body);
                    markdown = React.createElement("div", {key: this.state.issue.id, dangerouslySetInnerHTML: {__html : markdownText}});
                    return markdown;
                }
                catch(err)
                {
                    markdown = React.createElement("div", null, 
                        React.createElement("p", null, "An error occured when trying to render the Markdown, sorry... Displaying RAW text instead."), 
                        React.createElement("p", null, 
                            this.state.issue.body
                        )
                    );
                }
                finally{
                    return React.createElement("div", {className: "issue-details"}, 
                        markdown
                    );
                }
            }
        });

    var IssueItem = React.createClass({displayName: "IssueItem",

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
                assigneeInfo = React.createElement("img", {className: "assignee", width: "16", height: "16", src: this.props.issue.assignee.avatar_url+'&s=16'});
            var labelInfo = [];
            for (var i in this.props.issue.labels){
                var label = this.props.issue.labels[i];
                labelInfo.push(React.createElement("span", {className: "label-"+(parseInt(i)+1), style: {background:'#'+label.color}}));
                labelInfo.push(' ');
            }
            var modal;
            if (this.state.showDetails){
                modal = React.createElement(Modal, {
                    ref: "issueDetails", 
                    cancel: "Close", 
                    onCancel: this.closeModal, 
                    onConfirm: this.closeModal, 
                    title: this.props.issue.title}, 
                        React.createElement(IssueDetails, {issue: this.props.issue, data: this.props.data})
                  )   
            }
            return React.createElement("div", {className: "panel panel-primary issue-item", onDragStart: this.onDragStart, 
                        onDragEnd: this.onDragEnd, 
                        draggable: true}, 
              modal, 
              React.createElement(A, {href: "#", onClick: this.showIssueDetails}, 
                React.createElement("div", {className: "panel-heading"}, 
                    labelInfo, " ", React.createElement("span", {className: "assignee"}, assigneeInfo)
                ), 
                React.createElement("div", {className: "panel-body"}, 
                    React.createElement("h5", null, this.props.issue.title)
                )
                )
            );
        }
    });

        var IssueList = React.createClass({displayName: "IssueList",

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
                return React.createElement("div", {onDragEnter: this.onDragEnter, 
                            onDragLeave: this.onDragLeave, 
                            className: "col-xs-3 issue-list"+(this.props.active ? ' active' : '')}, this.props.children);
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
                    issueItems[category] = issues.map(function(issue){return React.createElement(IssueItem, {data: this.props.data, key: issue.number, issue: issue});}.bind(this));
                }
                return React.createElement("div", {className: "container-wide sprintboard"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement(IssueList, {setActiveDropzone: this.setActiveDropzone, name: "todo", active: this.state.dropZone == "todo" ? true : false}, 
                        React.createElement("h4", null, "To Do"), 
                        issueItems.toDo
                        ), 
                        React.createElement(IssueList, {setActiveDropzone: this.setActiveDropzone, name: "doing", active: this.state.dropZone == "doing" ? true : false}, 
                        React.createElement("h4", null, "Doing"), 
                        issueItems.doing
                        ), 
                        React.createElement(IssueList, {setActiveDropzone: this.setActiveDropzone, name: "done", active: this.state.dropZone == "done" ? true : false}, 
                        React.createElement("h4", null, "Done / Awaiting Review"), 
                        issueItems.awaitingReview
                        ), 
                        React.createElement(IssueList, {setActiveDropzone: this.setActiveDropzone, name: "closed", active: this.state.dropZone == "closed" ? true : false}, 
                        React.createElement("h4", null, "Closed"), 
                        issueItems.done
                        )
                    )
                );
            }
        });

        return Board;
});
