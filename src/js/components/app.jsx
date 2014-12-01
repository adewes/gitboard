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
        "js/components/header",
        "js/components/menu",
        "js/components/mixins/loader",
        "js/components/sprintboard",
        "js/components/milestones",
        "js/components/repositories",
        "js/components/user/login",
        "js/flash_messages",
        "jquery"
        ],
        function (React,
                  Utils,
                  Header,
                  Menu,
                  LoaderMixin,
                  SprintBoard,
                  Milestones,
                  Repositories,
                  Login,
                  FlashMessagesService,
                  $
                  )
        {
        'use'+' strict';

        var MainApp = React.createClass({

        mixins : [LoaderMixin],

        displayName: 'MainApp',

        resources : function(props,state){
            var r = [
                    {
                        name : 'user',
                        endpoint : this.apis.user.getProfile,
                        success : function(data,xhr){
                            this.setState({user : data});
                        }.bind(this)
                    },
                ];
            if (props.data.repositoryId !== undefined && state.user !== undefined){
                r.push({
                        name : 'repository',
                        params : [state.user.login,props.data.repositoryId,{}],
                        endpoint : this.apis.repository.getDetails,
                        success : function(data,xhr){
                            this.setState({repository : data});
                        }.bind(this)
                    })
            }
            return r;
        },

        componentWillMount : function(){
            this.flashMessagesService = FlashMessagesService.getInstance();
        },

        componentDidMount : function(){
    
            if (Utils.isLoggedIn()){
                $(".navbar-brand").attr("href", "#/repositories");
            }

            var bodyIsTool = $("body").hasClass("app");
            if (!bodyIsTool)
              $("body").addClass("app");

        },

        render: function () {

            /*
            Parameters that we pass in:
            app       : a reference to this class instance
            params    : the URL parameters received for this request
            data      : the router data received by director.js
            user      : the current user
            baseUrl   : the base URL for the given component
            */

            var header = <Header params={this.props.params}
                                 data={this.props.data}
                                 repository={this.state.repository}
                                 app={this} />;
            React.renderComponent(header,
              document.getElementById('header')
            );

            var menu = <Menu params={this.props.params}
                             data={this.props.data}
                             user={this.state.user}
                             repository={this.state.repository}
                             app={this} />;
            React.renderComponent(menu,
              document.getElementById('menu')
            );


            var dashboard = function(screen) {
                if (Utils.isLoggedIn())
                    return React.DOM.div;
                return React.DOM.div;
            };
            var props = this.props,
                propsData = props.data;

            var screens = {
                '_default' : {
                    callback : dashboard
                },
                'login' : {
                    component : Login,
                    baseUrl : "#/login",
                    },
                'sprintboard' : {
                    component : SprintBoard,
                    baseUrl : "#/sprintboard/"+props.data.repositoryId+'/'+props.data.milestoneId,
                    },
                'repositories' : {
                    component : Repositories,
                    baseUrl : "#/repositories",
                    },
                'milestones' : {
                    component : Milestones,
                    baseUrl : "#/milestones/"+props.data.repositoryId,
                    },
            };


            var screen = $.extend({},screens['_default']);
            if (props.screen in screens)
                screen = $.extend({},screens[props.screen]);

            var Component = screen.component;
            if (screen.callback !== undefined){
                Component = screen.callback(screen);
            }

            return <Component
                app={this}
                baseUrl={screen.baseUrl}
                data={propsData}
                user={this.state.user}
                repository={this.state.repository}
                params={props.params}/>;
        }
    });

    return MainApp;
});
