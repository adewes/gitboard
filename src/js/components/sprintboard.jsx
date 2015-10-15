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
        "js/flash_messages",
        "jquery",
        "marked",
        "moment"
        ],
        function (React,Utils,LoaderMixin,GithubErrorHandlerMixin,Modal,FlashMessagesService,$,Marked,Moment) {
        'use'+' strict';

        Marked.setOptions({
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

            inlineComponent : true,

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
                var markdown = <p>(no description given)</p>;
                var assignee;
                var labels;
                if (issue.assignee !== null)
                    assignee = [<img width="16" height="16" src={this.props.issue.assignee.avatar_url+'&s=16'} />,<span className="label">{issue.assignee.login}</span>];

                try{
                    var markdownText = '(no description given)';
                    if (this.state.issue.body)
                        markdownText = Marked(this.state.issue.body);
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

        onDragStart: function(e){
            this.props.dragStart(this.props.issue);
            e.target.style.opacity = 0.5;
        },

        onDragEnd : function(e){
            this.props.dragEnd(this.props.issue);
            e.target.style.opacity = 1.0;
        },

        render : function(){
            var assigneeInfo;
            if (this.props.issue.assignee !== undefined && this.props.issue.assignee !== null)
                assigneeInfo = <img className="assignee" width="16" height="16" src={this.props.issue.assignee.avatar_url+'&s=16'} />;
            var labelInfo = [];
            this.props.issue.labels.sort(function(a,b){return a.name < b.name;});
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
            return <div className="panel panel-primary issue-item"
                        onDragStart={this.onDragStart}
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
                this.props.dragEnter();
            },

            onDragLeave : function(e){
                this.props.dragLeave();
            },

            render : function(){
                return <div className={"col-md-3 issue-list"+(this.props.active ? ' active' : '')}
                            onDragLeave={this.onDragLeave}
                            onDragEnter={this.onDragEnter}>
                    {this.props.children}
                </div>;
            }
        });

        var Board = React.createClass({

            displayName: 'SprintBoard',
            mixins : [LoaderMixin,GithubErrorHandlerMixin],

            categoryData : function(){

                var hasLabel = function(issue,label){
                    for (var i in issue.labels){
                        var issueLabel = issue.labels[i];
                        if (label.toLowerCase() == issueLabel.name.toLowerCase())
                            return true;
                    }
                    return false;
                }

                var setImmediateState = function(issue,state){
                    if (issue.state != state)
                        issue.state = state;
                }

                var onError = function(xhr){
                    FlashMessagesService.postMessage({
                        type : "danger",
                        description : "An error occurred when trying to update the issue. Please try again..."
                    });
                    this.reloadResources();
                }.bind(this);

                var setState = function(issue,state,onSuccess){
                    this.apis.issue.updateIssue(this.props.data.repositoryId,issue.number,{state : state},onSuccess,onError);
                }.bind(this);

                var categoryLabels = ['doing','to-do','todo','awaiting-review','done'];

                var setImmediateLabel = function(issue,label){
                    if (Array.isArray(label)){
                        var labels = label;
                    }else{
                        var labels = [label];
                    }
                    var found = false;
                    for (var i in labels){
                        var l = labels[i];
                        if (hasLabel(issue,l)){
                            found = true;
                            break;
                        }
                    }
                    var labelsToRemove = [];
                    var labelsToAdd = [];
                    if (!found){
                        labelsToAdd.push(labels[0]);
                        if (!issue.labels)
                            issue.labels = [];
                        var newLabel = this.state.data.labelsByName[labels[0]] || {name : labels[0]};
                        issue.labels.push(newLabel);
                    }
                    labelsToRemove = issue.labels.filter(function(label){
                                        return (label.name != labels[0]
                                               && categoryLabels.indexOf(label.name) != -1) ?
                                               true : false;})
                                     .map(function(label){return label.name;});
                    issue.labels = issue.labels.filter(function(label){
                        return (labelsToRemove.indexOf(label.name) == -1) ? true: false})
                    return [labelsToAdd,labelsToRemove];
                }.bind(this)

                var setLabel = function(issue,labelsToAdd,labelsToRemove,onSuccess){
                    var removeCallback = function(){
                        this.reloadResources();
                        if (onSuccess)
                            onSuccess();
                    }.bind(this);
                    if (labelsToRemove.length)
                        for(var i in labelsToRemove){
                            removeCallback = function(oldCallback){
                                this.apis.label.removeLabel(this.props.data.repositoryId,issue.number,labelsToRemove[i],oldCallback,onError);
                            }.bind(this,removeCallback);
                        }
                    if (labelsToAdd.length)
                        this.apis.label.addLabels(this.props.data.repositoryId,issue.number,labelsToAdd,removeCallback,onError);
                    else
                        removeCallback();
                }.bind(this);

                return {
                    toDo : {
                        title : 'To Do',
                        isMemberOf : function(issue){
                            return (hasLabel(issue,'to-do') || hasLabel(issue,'todo')) && issue.state == 'open';
                        },
                        moveTo : function(issue){
                            setImmediateState(issue,'open');
                            var labelsToModify = setImmediateLabel(issue,['to-do','todo']);
                            setState(issue,'open',function(){setLabel(issue,labelsToModify[0],labelsToModify[1]);});
                        }.bind(this)
                    },
                    doing : {
                        title : 'Doing',
                        isMemberOf : function(issue){
                            return hasLabel(issue,'doing') && issue.state == 'open';
                        },
                        moveTo : function(issue){
                            setImmediateState(issue,'open');
                            var labelsToModify = setImmediateLabel(issue,['doing']);
                            setState(issue,'open',function(){setLabel(issue,labelsToModify[0],labelsToModify[1]);});
                            this.forceUpdate();
                        }.bind(this)
                    },
                    awaitingReview : {
                        title : 'Awaiting Review',
                        moveTo : function(issue){
                            setImmediateState(issue,'open');
                            var labelsToModify = setImmediateLabel(issue,['done','awaiting-review']);
                            setState(issue,'open',function(){setLabel(issue,labelsToModify[0],labelsToModify[1]);});
                        }.bind(this),
                        isMemberOf : function(issue){
                            return (hasLabel(issue,'done') || hasLabel(issue,'awaiting-review')) && issue.state == 'open';
                        }
                    },
                    done : {
                        title : 'Done',
                        isMemberOf : function(issue){
                            return issue.state == 'closed';
                        }.bind(this),
                        moveTo : function(issue){
                            setImmediateState(issue,'closed');
                            var labelsToModify = setImmediateLabel(issue,['done']);
                            setState(issue,'closed',function(){setLabel(issue,labelsToModify[0],labelsToModify[1]);});
                            this.forceUpdate();
                        }.bind(this)
                    },
                }
            },

            resources : function(props,state){
                r = [
                    {
                        name : 'repository',
                        endpoint : this.apis.repository.getDetails,
                        params : [props.data.repositoryId,{}],
                        success : function(data,d){
                            return {repository : data}
                        }
                    },
                    {
                        name: 'labels',
                        endpoint : this.apis.label.getRepositoryLabels,
                        params : [props.data.repositoryId,{}],
                        success : function(data,d){
                            return {labels : data};
                        }
                    },
                    {
                        name : 'openIssues',
                        endpoint : this.apis.issue.getIssues,
                        params : [props.data.repositoryId,{state: 'open',per_page : 100,milestone : props.data.milestoneId || 'none'}],
                        success : function(data,d){
                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            return {openIssues : arr};
                        },
                    },
                    {
                        name : 'closedIssues',
                        endpoint : this.apis.issue.getIssues,
                        params : [props.data.repositoryId,{state :'closed',per_page : 100,milestone : props.data.milestoneId || 'none'}],
                        success : function(data,d){
                            var arr = [];
                            for(var i in data) {
                                if(data.hasOwnProperty(i) && !isNaN(+i)) {
                                    arr[+i] = data[i];
                                }
                            }
                            return {closedIssues : arr};
                        },
                    }
                ];
                if (props.data.milestoneId)
                    r.push({
                        name : 'milestone',
                        endpoint : this.apis.milestone.getDetails,
                        params : [props.data.repositoryId,props.data.milestoneId,{}],
                        success : function(data,d){
                            return {milestone : data}
                        }
                    });
                return r;
            },

            afterLoadingSuccess : function(data){
                data.allIssues = data.openIssues.slice();
                Array.prototype.push.apply(data.allIssues,data.closedIssues);
                data.labelsByName = {};
                for(var i in data.labels){
                    data.labelsByName[data.labels[i].name] = data.labels[i];
                }
                return data;
            },

            getInitialState : function(){
                return {dropZone : undefined};
            },

            dragStart : function(issue){
                this.setState({draggedIssue : issue});
            },

            dragEnd : function(issue){
                this.moveIssue(issue,this.state.dropZone);
                this.setState({dropZone : undefined,draggedIssue : undefined});
            },

            dragEnter : function(list){
                this.setState({dropZone : list})
            },

            dragLeave : function(list){
            },

            categorizeIssues : function(issues,draggedIssue,dropZone){
                var categoryData = this.categoryData();
                var categories = {};
                for(var category in categoryData)
                    categories[category] = [];
                for (var i in issues){
                    var issue = issues[i];
                    var category = 'toDo';
                    for (var cat in categoryData){
                        if (categoryData[cat].isMemberOf(issue)){
                            category = cat;
                            break;
                        }
                    }
                    categories[category].push(issue);
                }
                if (draggedIssue && dropZone && !Utils.contains(categories[dropZone],draggedIssue)){
                    categories[dropZone].push(draggedIssue);
                }
                return categories;
            },

            moveIssue : function(issue,to){
                var categoryData = this.categoryData();
                categoryData[to].moveTo(issue,this.state.dropZone);
            },

            render: function () {
                var data = this.state.data;
                var categorizedIssues = this.categorizeIssues(data.allIssues,this.state.draggedIssue,this.state.dropZone);
                var issueItems = {};
                for (var category in categorizedIssues){
                    var issues = categorizedIssues[category];
                    issueItems[category] = issues.sort(function(issueA,issueB){return (new Date(issueA.created_at))-(new Date(issueB.created_at));}).map(function(issue){
                        return <IssueItem data={this.props.data}
                                          key={issue.number}
                                          issue={issue}
                                          dragStart={this.dragStart}
                                             dragged={issue.id == (this.state.draggedIssue && this.state.draggedIssue.id == issue.id ? true : false)}
                                          dragEnd={this.dragEnd} />;}.bind(this));
                    if (!issueItems[category].length)
                        issueItems[category] = <div className="panel panel-default">
                            <div className="panel-body">
                                <i>No issues found.</i>
                            </div>
                        </div>
                }

                var due;
                var milestoneTitle;
                var milestoneDescription;
                if (data.milestone){
                    milestoneTitle = ['- ',<A href={data.milestone.html_url} target="_blank">{data.milestone.title}</A>];
                    if (data.milestone.due_on !== null){
                        var datestring = Moment(new Date(data.milestone.due_on)).fromNow();
                        due = <span><i className="octicon octicon-clock" /> due {datestring}</span>;
                    }

                    if (data.milestone.description)
                        milestoneDescription = <div className="panel panel-default">
                            <div className="panel-body">
                                <span>{data.milestone.description}</span>
                            </div>
                        </div>;

                }

                var categoryData = this.categoryData();

                var addNewIssue = function(category,event){
                    event.preventDefault();
                }.bind(this);

                var issueLists = Object.keys(categoryData).map(function(category){
                    return <IssueList key={category}
                                dragEnd={this.dragEnd.bind(this,category)}
                                dragEnter={this.dragEnter.bind(this,category)}
                                dragLeave={this.dragLeave.bind(this,category)}
                                name={category}
                                active={this.state.dropZone == category ? true : false}>
                            <h4>{categoryData[category].title}</h4>
                            {issueItems[category]}
                        </IssueList>
                }.bind(this))

                return <div className="container sprintboard">
                    <div className="row">
                        <div className="col-md-12">
                            <h3><A href={Utils.makeUrl('/milestones/'+this.props.data.repositoryId)}>{data.repository.name}</A> {milestoneTitle} <A href="" onClick={addNewIssue.bind(this,category)}><i className="fa fa-plus-circle" /></A></h3>
                            <p>
                                {due}
                            </p>
                            {milestoneDescription}
                        </div>
                    </div>
                    <div className="row">
                        {issueLists}
                    </div>
                </div>;
            }
        });

        return Board;
});
