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
        "js/helpers/issue_manager",
        "jquery",
        "marked",
        "moment"
        ],
        function (React,
                  Utils,
                  LoaderMixin,
                  GithubErrorHandlerMixin,
                  Modal,
                  FlashMessagesService,
                  IssueManager,
                  $,
                  Marked,
                  Moment) {
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

        function getContrastYIQ(hexcolor){
            //source: http://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
            var r = parseInt(hexcolor.substr(0,2),16);
            var g = parseInt(hexcolor.substr(2,2),16);
            var b = parseInt(hexcolor.substr(4,2),16);
            var yiq = ((r*299)+(g*587)+(b*114))/1000;
            return (yiq >= 128) ? 'black' : 'white';
        }

        var Dropdown = React.createClass({

            render :function(){
                var lis = React.Children.map(this.props.children,function(child){
                    if (child == undefined)
                        return <li role="separator" className="divider" />;
                    return <li>{child}</li>;
                });
                if (this.props.disabled)
                    return <div className="btn-group">
                    <A href="#" onClick={function(e){e.preventDefault();}} className="btn btn-xs btn-default dropdown-toggle">{this.props.title}</A>
                </div>
                else
                return <div className="btn-group">
                    <A onClick={this.props.onClick} href="#" className="btn btn-xs btn-default dropdown-toggle" data-target="#" data-toggle="dropdown">{this.props.title}&nbsp;<i className="fa fa-caret-down" /></A>
                    <ul className="dropdown-menu">
                        {lis}
                    </ul>
                </div>
            }
        });

        var TimeSelector = React.createClass({
            render : function(){
                var choices = {
                    '5m' : '5 minutes',
                    '10m' : '10 minutes',
                    '30m' : '30 minutes',
                    '1h' : '1 hour',
                    '2h' : '2 hours',
                    '3h' : '3 hours',
                    '4h' : '4 hours',
                    '6h' : '6 hours',
                    '8h' : '1 day (8 hours)',
                    '16h' : '2 days',
                    '24h' : '3 days',
                    '32h' : '4 days',
                    '40h' : '5 days',
                    '80h' : '10 days'
                };
                var timeLinks = Object.keys(choices).map(function(key){
                    var title = choices[key];
                    return <A href="#">{title}</A>;
                });

                var title = <span className={"time-"+this.props.type}>n/a</span>

                return <Dropdown disabled={!Utils.isLoggedIn()} onClick={this.props.onClick} title={title}>
                    {timeLinks}
                </Dropdown>;
            }
        });

        var CategorySelector = React.createClass({

            render : function(){

                var categoryData = this.props.issueManager.issueCategories;

                var setCategory = function(category,event){
                    event.preventDefault();
                    this.props.issueManager.moveTo(this.props.issue,category);
                }.bind(this);

                var category = Object.keys(categoryData)[0];
                for (var cat in categoryData){
                    if (this.props.issueManager.isMemberOf(this.props.issue,cat)){
                        category = cat;
                        break;
                    }
                }

                var categoryLinks = Object.keys(categoryData).map(function(key){
                    var params = categoryData[key];
                    return <A href="#" onClick={setCategory.bind(this,key)}>{params.title}</A>;
                });
                return <Dropdown disabled={!Utils.isLoggedIn()} onClick={this.props.onClick} title={categoryData[category].title}>
                    {categoryLinks}
                </Dropdown>;
            }
        });

        var MilestoneSelector = React.createClass({

            render : function(){

                var dropdownContent;

                var setMilestone = function(milestone,event){
                    event.preventDefault();
                    this.props.issueManager.setMilestone(this.props.issue,milestone);
                }.bind(this);

                if (this.props.milestones){
                    var milestoneLinks = this.props.milestones.map(function(milestone){
                        return <A href="#" onClick={setMilestone.bind(this,milestone)}>{milestone.title}</A>
                    }.bind(this));
                    milestoneLinks.push(undefined);
                    milestoneLinks.push(<A href="#" onClick={setMilestone.bind(this,null)}> <i className="fa fa-trash" />&nbsp;&nbsp;remove milestone</A>);
                    dropdownContent = milestoneLinks;
                }

                return <Dropdown disabled={!Utils.isLoggedIn()} onClick={this.props.onClick} title={this.props.issue.milestone ? this.props.issue.milestone.title : 'no milestone'}>
                    {dropdownContent}
                </Dropdown>;
            }
        });

        var AssigneeSelector = React.createClass({

            render : function(){

                var assignTo = function(collaborator,event){
                    event.preventDefault();
                    this.props.issueManager.assignTo(this.props.issue,collaborator);
                }.bind(this);

                var userHtml = function(user){
                    return <span><img width="16" height="16" src={user.avatar_url+'&s=16'} /> {user.login}</span>
                }.bind(this);

                var dropdownContent;
                if (this.props.collaborators){
                    var collaboratorLinks = this.props.collaborators.map(function(collaborator){
                        return <A href="#" onClick={assignTo.bind(this,collaborator)}>{userHtml(collaborator)}</A>
                    }.bind(this));
                    collaboratorLinks.push(undefined);
                    collaboratorLinks.push(<A href="#" onClick={assignTo.bind(this,null)}> <i className="fa fa-trash" />&nbsp;&nbsp;remove assignee</A>);
                    dropdownContent = collaboratorLinks;
                }
                return <Dropdown disabled={!Utils.isLoggedIn()} onClick={this.props.onClick} title={[(this.props.issue.assignee ? userHtml(this.props.issue.assignee) : ' no one assigned')]}>
                    {dropdownContent}
                </Dropdown>;
            }
        });

        var IssueFooter = React.createClass({
            render : function(){
                var issue = this.props.issue;
                var labels = issue.labels.map(function(label){
                    return <span className="issue-label" style={{borderBottom:'3px solid '+'#'+label.color}}>{label.name}</span>
                });
                return <div>
                    <span className="pull-right"><A target="_blank" href={issue.html_url}>#{issue.number}</A></span>
                    <span className="issue-labels">{labels}</span>
                </div>
            }
        });

        var IssueDetails = React.createClass({

            mixins : [LoaderMixin,GithubErrorHandlerMixin],

            inlineComponent : true,

            resources : function(props){
                return [];
            },

            render :function(){
                var issue = this.props.issue;
                var markdown = <p>(no description given)</p>;
                var assignee;

                if (issue.assignee !== null)
                    assignee = [<img width="16" height="16" src={issue.assignee.avatar_url+'&s=16'} />,<span className="label">{issue.assignee.login}</span>];
                var selectors;
                if (Utils.isLoggedIn() || true){
                    selectors = <div className="btn-group btn-group">
                        <AssigneeSelector issue={issue}
                                          onClick={this.props.onContentChange}
                                          issueManager={this.props.issueManager}
                                          collaborators={this.props.collaborators}/>
                        <TimeSelector type="estimate"
                                      issueManager={this.props.issueManager}
                                      issue={issue}
                                      onClick={this.props.onContentChange}/>
                        <TimeSelector type="spent"
                                      issue={issue}
                                      issueManager={this.props.issueManager}
                                      onClick={this.props.onContentChange} />
                        <CategorySelector issue={issue}
                                          issueManager={this.props.issueManager}
                                          onClick={this.props.onContentChange} />
                        <MilestoneSelector issue={issue}
                                           issueManager={this.props.issueManager}
                                           milestones={this.props.milestones}
                                           onClick={this.props.onContentChange} />
                    </div>;
                }
                try{
                    var markdownText = '(no description given)';
                    if (issue.body)
                        markdownText = Marked(issue.body);
                    markdown = <div key={issue.id} dangerouslySetInnerHTML={{__html : markdownText}}></div>;
                    return markdown;
                }
                catch(err)
                {
                    markdown = <div>
                        <p>An error occured when trying to render the Markdown, sorry... Displaying RAW text instead.</p>
                        <p>
                            {issue.body}
                        </p>
                    </div>;
                }
                finally{
                    return <div className="issue-details">
                        {selectors}
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
            Utils.redirectTo(Utils.makeUrl(this.props.baseUrl,{},this.props.params,['issueId']));
            this.refs.issueDetails.close();
            this.setState({showDetails : false});
        },

        getInitialState : function(){
            return {showDetails : this.props.showDetails || false};
        },

        componentDidUpdate : function(prevProps,prevState){
            if (this.state.showDetails){
                this.refs.issueDetails.open();
            }
        },

        componentDidMount : function(){
            if (this.state.showDetails)
                this.refs.issueDetails.open();
        },

        componentWillReceiveProps : function(props){
            this.setState({showDetails : props.showDetails});
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
            var issue = this.props.issue;
            if (issue.assignee !== undefined && issue.assignee !== null)
                assigneeInfo = <img className="assignee" width="16" height="16" src={issue.assignee.avatar_url+'&s=16'} />;
            var labelInfo = [];
            issue.labels.sort(function(a,b){return a.name < b.name;});
            for (var i in issue.labels){
                var label = issue.labels[i];
                labelInfo.push(<span className={"label-"+(parseInt(i)+1)} style={{background:'#'+label.color}}></span>);
                labelInfo.push(' ');
            }
            var modal;
            if (this.state.showDetails){
                var resize = function(e){
                    var maxHeight = $(window).height(); 
                    var element = $('.modal-body');
                    element.css({overflow:'auto',
                                 height:Math.min(maxHeight-100,element[0].scrollHeight+0)+'px'});
                }.bind(this)
                modal = <Modal
                    ref="issueDetails"
                    cancel="Close"
                    raw={true}
                    onCancel={this.closeModal}
                    onConfirm={this.closeModal}
                    title={issue.title}>
                        <div className="modal-body">
                            <IssueDetails issue={issue}
                                          onContentChange={resize}
                                          key={issue.number}
                                          issueManager={this.props.issueManager}
                                          collaborators={this.props.collaborators}
                                          milestones={this.props.milestones}
                                          data={this.props.data}/>
                        </div>
                        <div className="modal-footer">
                            <IssueFooter issue={issue} data={this.props.data}/>
                        </div>
                  </Modal>
            }
            return <div className={"panel panel-primary issue-item"+(issue.dragged ? " dragged" : "")}
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                        draggable={true}>
              {modal}                 
              <A href={Utils.makeUrl(this.props.baseUrl,{issueId : issue.number},this.props.params)}>
                <div className="panel-heading">
                    {labelInfo} <p className="right-symbols"><span className="assignee">{assigneeInfo}</span></p>
                </div>
                <div className="panel-body">
                    <h5>{issue.title}</h5>
                </div>
                <div className="panel-footer">
                    <span className="time-estimate">5h</span> <span className="time-spent">7h</span>
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
            if (this.props.dragLeave)
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

        resources : function(props,state){
            var convertToArray = function(data){
                var arr = [];
                for(var i in data) {
                    if(data.hasOwnProperty(i) && !isNaN(+i)) {
                        arr[+i] = data[i];
                    }
                }
                return arr;
            }
            r = [
                {
                    name : 'repository',
                    endpoint : this.apis.repository.getDetails,
                    params : [props.data.repositoryId,{}],
                    success : function(data,d){
                        return {repository : data};
                    }
                },
                {
                    name: 'labels',
                    endpoint : this.apis.label.getRepositoryLabels,
                    params : [props.data.repositoryId,{}],
                    success : function(data,d){
                        return {labels : convertToArray(data)};
                    }
                },
                {
                    name : 'openIssues',
                    endpoint : this.apis.issue.getIssues,
                    params : [props.data.repositoryId,{state: 'open',per_page : 100,milestone : props.data.milestoneId || 'none'}],
                    success : function(data,d){
                        return {openIssues : convertToArray(data)}
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
            if (Utils.isLoggedIn()){
                Array.prototype.push.apply(r,[
                {
                    name : 'collaborators',
                    endpoint : this.apis.repository.getCollaborators,
                    params : [props.data.repositoryId,{}],
                    success : function(data,d){
                        return {collaborators : convertToArray(data)};
                    }
                },
                {
                    name : 'milestones',
                    endpoint : this.apis.milestone.getMilestones,
                    params : [props.data.repositoryId,{}],
                    success : function(data,d){
                        return {milestones : convertToArray(data)};
                    }
                },
                ]);
            }
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
            this.issueManager = new IssueManager({repositoryId : this.props.data.repositoryId,
                                                  labelsByName : data.labelsByName,
                                                  onResourceChange : this.reloadResources,
                                                  onImmediateChange : this.updateView});
            return data;
        },

        updateView : function(){
            this.forceUpdate();
        },

        getInitialState : function(){
            return {dropZone : undefined};
        },

        dragStart : function(issue){
            issue.dragged = true;
            this.setState({draggedIssue : issue});
        },

        moveTo : function(issue,category){
            if (this.issueManager.issueCategories[category]){
                this.issueManager.moveTo(issue,category,this.reloadResources,this.onIssueError);
            }
        },

        dragEnd : function(issue){
            this.moveTo(issue,this.state.dropZone);
            this.state.draggedIssue.dragged = false;
            this.setState({dropZone : undefined,draggedIssue : undefined});
        },

        dragEnter : function(list){
            this.setState({dropZone : list})
        },

        onIssueError : function(xhr){
            FlashMessagesService.postMessage({
                type : "danger",
                description : "An error occurred when trying to update the issue. Please try again..."
            });
            this.reloadResources();
        },

        categorizeIssues : function(issues,draggedIssue,dropZone){
            var categoryData = this.issueManager.issueCategories;
            var categories = {};
            for(var category in categoryData)
                categories[category] = [];
            for (var i in issues){
                var issue = issues[i];
                var category = 'toDo';//the default category
                for (var cat in categoryData){
                    if (this.issueManager.isMemberOf(issue,cat)){
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

        render: function () {
            var data = this.state.data;
            var categorizedIssues = this.categorizeIssues(data.allIssues,this.state.draggedIssue,this.state.dropZone);
            var issueItems = {};

            var categoryData = this.issueManager.issueCategories;

            for (var category in categorizedIssues){
                var issues = categorizedIssues[category];
                issueItems[category] = issues.sort(function(issueA,issueB){return (new Date(issueA.created_at))-(new Date(issueB.created_at));}).map(function(issue){
                    return <IssueItem data={this.props.data}
                                      key={issue.number}
                                      issue={issue}
                                      baseUrl={this.props.baseUrl}
                                      params={this.props.params}
                                      showDetails={this.props.params.issueId && this.props.params.issueId == issue.number ? true : false}
                                      collaborators={data.collaborators}
                                      issueManager={this.issueManager}
                                      milestones={data.milestones}
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
                    due = <span className="due"><i className="octicon octicon-clock" /> due {datestring}</span>;
                }

                if (data.milestone.description)
                    milestoneDescription = <div className="panel panel-default">
                        <div className="panel-body">
                            <span>{data.milestone.description}</span>
                        </div>
                    </div>;

            }


            var addIssue = function(category,event){
                event.preventDefault();
            }.bind(this);

            var issueLists = Object.keys(this.issueManager.issueCategories).map(function(category){
                return <IssueList key={category}
                            addIssue={addIssue.bind(this,category)}
                            dragEnd={this.dragEnd.bind(this,category)}
                            dragEnter={this.dragEnter.bind(this,category)}
                            name={category}
                            active={this.state.dropZone == category ? true : false}>
                        <h4>{this.issueManager.issueCategories[category].title}</h4>
                        <p className="estimates"><span className="time-estimate">5h</span><span className="time-spent">7h</span></p>
                        {issueItems[category]}
                    </IssueList>
            }.bind(this))

            return <div className="container sprintboard">
                <div className="row">
                    <div className="col-md-12">
                        <h3><A href={Utils.makeUrl('/milestones/'+this.props.data.repositoryId)}>{data.repository.name}</A> {milestoneTitle}</h3>
                        <p>
                            {due}
                            &nbsp; <span className="time-estimate">23h</span> <span className="time-spent">11h</span>
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
