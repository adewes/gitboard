/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

define(["react","js/utils",
        "js/api/user",
        "js/api/project",
        "js/api/organization",
        "js/components/generic/flash_messages",
        "js/flash_messages",
        "jquery"
        ],
        function (React,Utils,UserApi,ProjectApi,OrganizationApi,FlashMessages,FlashMessagesService,$) {
        'use'+' strict';
        var Menu = React.createClass({
            displayName: 'Menu',
            getInitialState: function () {
                return {user: {admin: false}, project: {roles: {admin: []}}};
            },

            getDefaultProps : function (){
                return {};
            },

            componentWillMount : function(){
                this.projectApi = ProjectApi.getInstance();
                this.userApi = UserApi.getInstance();
                this.organizationApi = OrganizationApi.getInstance();
                this.flashMessagesService = FlashMessagesService.getInstance();
            },

            loadData : function(props){
                this.loadProfile(props);
                this.loadProject(props);
                this.loadOrganization(props);
            },

            componentDidMount : function(){
                this.loadData(this.props);
            },

            componentWillReceiveProps : function(props){
                this.loadData(props);
            },

            loadProfile : function(props){
                if (Utils.isLoggedIn())
                    this.userApi.getProfile(this.updateProfile);
            },

            loadProject : function(props){
                if (props.data.projectId !== undefined)
                    this.projectApi.getDetails(props.data.projectId,{},this.updateProject);
                else
                    this.setState({project : undefined});
            },

            loadOrganization : function(props){
                if (props.data.organizationId !== undefined)
                    this.organizationApi.getDetails(props.data.organizationId,
                                                    {with_user_teams : true},
                                                    this.updateOrganization);
                else
                    this.setState({organization : undefined});
            },

            updateProfile : function(data){
                if (!this.isMounted())
                    return;
                this.setState({user: data['user']});

                if (Utils.isLoggedIn())
                    $(".navbar-brand").attr("href", "#/projects")
            },

            updateProject : function(data){
                if (!this.isMounted())
                    return;
                this.setState({project: data['project']});
            },

            updateOrganization : function(data){
                if (!this.isMounted())
                    return;
                this.setState({organization: data['organization']});
            },

            analyzeProject : function(){
                this.projectApi.analyze(this.props.data.projectId);
                this.flashMessagesService.postMessage({type : "info",
                                                       description : "The project has been scheduled for analysis."})
                return false;
            },

            resetProject : function(){
                this.flashMessagesService.postMessage({type : "info",
                                                       description : "The project has been scheduled for a reset."})
                this.projectApi.reset(this.props.data.projectId);
                return false;
            },

            render: function () {

                var adminMenu = undefined;

                var FlashMessagesMenu = FlashMessages.FlashMessagesMenu;
                var flashMessagesMenu = <FlashMessagesMenu baseUrl={this.props.baseUrl} params={this.props.params} />;
                flashMessagesMenu = undefined;  /* quick switch to activate or deactivate */

                var projectMenu = undefined;
                if (this.state.project !== undefined && this.state.project.user_is_admin){
                    projectMenu = <li className="dropdown">
                        <a href="#" className="dropdown-toggle" data-toggle="dropdown">{Utils.truncate(this.state.project.name,24)} <b className="caret"></b></a>
                        <ul className="dropdown-menu">

                        <li><a href={"#/project/"+this.state.project.pk+"/settings"}><i className="fa fa-gears"></i> Settings</a></li>
                        <li className="divider"></li>
                        <li><a href="#" onClick={this.analyzeProject}><i className="fa fa-flask"></i> Analyze</a></li>
                        <li><a href="#" onClick={this.resetProject}><i className="fa fa-times"></i> Reset</a></li>
                    </ul></li>;
                }
                var organizationMenu = undefined;
                if (this.state.organization !== undefined && this.state.organization.user_is_admin){
                    projectMenu = <li className="dropdown">
                        <a href="#" className="dropdown-toggle" data-toggle="dropdown">{Utils.truncate(this.state.organization.name,24)} <b className="caret"></b></a>
                        <ul className="dropdown-menu">

                        <li><a href={"#/organization/"+this.state.organization.name+"/settings"}><i className="fa fa-gears"></i> Settings</a></li>
                    </ul></li>;
                }

                if (Utils.isLoggedIn())
                {
                    return <div><ul className="nav navbar-nav">
                        <li><a href="#/projects">Projects</a></li>
                        <li><a href="#/organizations">Organizations</a></li>
                        <li><a href="#/bookmarks">Bookmarks</a></li>
                        <li><a href="#/explore">Explore</a></li>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        {projectMenu}
                        {organizationMenu}
                        <li><a href="#/project/new"><i className="fa fa-plus" /></a></li>
                        <li><a href="#/settings"><i className="fa fa-gears"></i></a></li>
                        <li><a href="#/user/logout">Logout</a></li>
                        {adminMenu}
                        {flashMessagesMenu}
                    </ul>
                    </div>;
                }
                else
                {
                    return <div>
                        <ul className="nav navbar-nav">
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li><a href="#/explore">Explore</a></li>
                            <li><a href="#/user/login">Login</a></li>
                            <li><a href="#/user/signup?">Sign up</a></li>
                            {flashMessagesMenu}
                        </ul>
                    </div>;
                }
            }
        });

        return Menu;
});
