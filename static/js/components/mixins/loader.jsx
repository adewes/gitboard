/**
 * @jsx React.DOM
 */

define(["react",
        "js/utils",
        "jquery",
        "js/api/all",
        ],function (React,Utils,$,Apis) {
    'use strict';

    var LoaderMixin = {

        updateLoadingState : function(role,state,noUpdate){
            if (!this.isMounted())
                return;

            for (var key in this.loadingState){
                var list = this.loadingState[key];
                if (key == state){
                    if (!(role in list))
                        list[role] = true;
                } else if (role in list) {
                     delete list[role];
                }
            }
            if ((!Object.keys(this.loadingState.inProgress).length)){
                var loadingFailed = false;
                var d = this.coerceData();
                var successCount = Object.keys(this.loadingState.succeeded).length
                                  + Object.keys(this.loadingState.failedNonCritical).length;
                if (this.resourcesList.length == successCount){
                    if (this.afterLoadingSuccess) {
                        var res = this.afterLoadingSuccess(d);
                        if (res) {
                            d = res;
                        }
                    }
                }
                else
                    loadingFailed = true;
                this.setState({data : d,loadingInProgress : false,loadingFailed :loadingFailed});
            }
        },

        coerceData : function(){
            var d = {};
            for(var role in this.data){
                if (role in this.loadingState.succeeded)
                    $.extend(d,this.data[role]);
            }
            return d;
        },

        onLoadingError : function(handler,role,nonCritical){
            return function(errorData){
                if(!this.isMounted()) {
                  return;
                }
                var stateErrorData = $.extend({}, this.state.errorData);
                stateErrorData[role] = errorData;
                this.setState({errorData: stateErrorData});
                if (handler)
                    handler.apply(this,arguments);
                if (nonCritical)
                    this.updateLoadingState(role,"failedNonCritical");
                else
                    this.updateLoadingState(role,"failed");
            }.bind(this);
        },

        updateResource : function(role,data,props){
            var resources = this.resources(props || this.props);
            for(var i in resources){
                var resource = resources[i];
                if (resource.name == role){
                    this.onResourceSuccess(resource,data);
                    break;
                }
            }
        },

        onLoadingSuccess : function(handler,role){
            return function(){
                if (!this.isMounted())
                    return;
                if (this.state.errorData[role])
                    delete this.state.errorData[role];
                var update = true;
                if (arguments.length > 0)
                {
                    var data = arguments[0];

                    if (this.reload && data.__cached__)
                        update = false;

                    //bug :/
                    //if (this.requestIds && this.requestIds[role] && data.__requestId__ && data.__requestId__ !== this.requestIds[role])
                    //    update = false;
                }
                //we call the success handler
                if (update){
                    if (handler)
                        handler.apply(this,arguments);
                    this.updateLoadingState(role,"succeeded");
                }
            }.bind(this);
        },
        
        onResourceSuccess : function(resource,data){
            var d = {};

            var mapping = resource.mapping;
            if (!mapping){
                mapping = {};
                mapping[resource.name] = resource.name;
            }
            for(var key in mapping){
                try{
                    d[key] = data[mapping[key]];
                }catch(e){
                    d[key] = undefined;
                }
            }

            if (resource.success)
            {
                var res = resource.success(data,d);
                if (res)
                    $.extend(d,res);
            }

            this.data[resource.name] = d;
        },

        processResourcesList : function(props){

            if (this.onLoadResources)
                this.onLoadResources(props);

            var resources = this.resourcesList;

            if (!resources.length){
                this.setState({data : {},loadingInProgress : false,loadingFailed : false});
                return;
            }

            var loadingList = [];
            for(var i in resources){
                var resource = resources[i];
                if (resource.before)
                    if (!resource.before(props,resource))
                        continue;

                var params = [];
                if (resource.params)
                    params = resource.params.slice(0);

                params.push(this.onLoadingSuccess(this.onResourceSuccess.bind(this,resource),resource.name));
                params.push(this.onLoadingError(resource.error,resource.name,resource.nonCritical));
                this.updateLoadingState(resource.name,"inProgress");
                //we call the resource endpoint with the given parameters
                loadingList.push([resource,params]);
            }
            //We call the endpoints of the resources to be loaded
            loadingList.map(function(p){
                var resource = p[0];
                var params = p[1];
                this.params[resource.name] = params;
                this.endpoints[resource.name] = resource.endpoint;
                if (this.reload || 
                    (resource.alwaysReload || (!this.lastData[resource.name])) ||
                    ((JSON.stringify(this.lastParams[resource.name]) != JSON.stringify(params))
                        || (resource.endpoint != this.lastEndpoints[resource.name]))){
                    this.requestIds[resource.name] = resource.endpoint.apply(this,params);
                }
                else{
                    //we take the previous value
                    this.data[resource.name] = $.extend({},this.lastData[resource.name]);
                    this.data[resource.name].__cached__ = false;
                    this.requestIds[resource.name] = this.lastData[resource.name].__requestId__;
                    this.updateLoadingState(resource.name,"succeeded");
                }
            }.bind(this));
        },


        reloadResources : function(){
            this.reload = true;
            this.resetLoadingState();
            this.getResourcesList(this.props);
            this.processResourcesList(this.props);
        },

        resetLoadingState : function(){
            this.lastData = $.extend({},this.data);
            this.lastParams = $.extend({},this.params);
            this.lastEndpoints = $.extend({},this.endpoints);
            this.data = {};
            this.endpoints = {};
            this.params = {};
            this.loadingState = {
                    inProgress : {},
                    failed : {}, 
                    failedNonCritical : {},
                    succeeded : {},
                };
        },

        getInitialState : function(){
            return {
                    loadingInProgress : true,
                    loadingFailed : false,
                    data : {},
                    errorData: {}
                   };
        },

        getResourcesList : function(props){
            this.resourcesList = this.resources(props) || [];
        },

        componentWillMount : function(){
            this.apis = Apis;
            this.data = {};
            this.params = {};
            this.endpoints = {};
            this.reload = false;
            this.resourcesList = [];
            this.requestIds = {};
            this._render = this.render;
            this.render = this.renderLoader;
            this.resetLoadingState();
            this.getResourcesList(this.props);
            //cast to boolean:
            this.showComponentWhileLoading = !!this.showComponentWhileLoading;
        },

        componentWillReceiveProps : function(newProps){
            this.reload = false;
            this.resetLoadingState();
            this.getResourcesList(newProps);
            this.processResourcesList(newProps);
        },

        componentDidMount : function(){
            this.processResourcesList(this.props);
        },

        renderLoader: function(){
            var loadingInProgress = this.state.loadingInProgress;
            var loadingFailed = this.state.loadingFailed;
            if (!this.resourcesList.length)
                loadingInProgress = false;
            if (loadingFailed || (loadingInProgress && (!this.showComponentWhileLoading)))
                return this.showLoader();
            return this._render();
        },

        showLoader : function(){
            if (this.silentLoading)
                return <div></div>;
            if (this.state.loadingFailed)
                return this.showErrorMessage();
            else
                return this.showLoadingMessage();
        },

        showErrorMessage : function(){

            var reload = function(e){
                e.preventDefault();
                location.reload();
            }.bind(this);
            if (this.renderErrorPage)
                return this.renderErrorPage(this.state.errorData);
            var loadingErrorMessage;
            if (this.getErrorMessage)
                loadingErrorMessage = this.getErrorMessage(this.state.errorData);
            if (!loadingErrorMessage)
                loadingErrorMessage = '404 - Cannot load the requested resource.'
            if (this.inlineComponent)
                return <span className="alert alert-danger">{loadingErrorMessage}</span>;
            else
                return <div className="content">
                    <div className="container">
                        <div className="text-center">
                            <h1><i className="fa fa-exclamation-triangle" /> An error has occured.</h1>
                            <p className="space-top-20 space-bottom-20 alert alert-warning">{loadingErrorMessage}</p>
                            <hr />
                            <p>
                                Sorry for the inconvenience. Please try reloading this page. If the problem persists
                                please contact us, we will do our best to fix this issue for you.

                            </p>
                            <hr />
                            <p>
                                <a className="btn btn-lg btn-primary" onClick={reload}>reload this page</a>&nbsp;or&nbsp;
                                <a className="btn btn-lg btn-info" href="/contact">contact us</a>
                            </p>
                        </div>
                    </div>
                </div>;
        },

        showLoadingMessage : function(){

            if (this.renderLoadingPlaceholder)
                return this.renderLoadingPlaceholder();

            var loadingMessage;
            if (this.getLoadingMessage)
                loadingMessage = this.getLoadingMessage();

            if (this.inlineComponent) {
                if (loadingMessage === undefined)
                    loadingMessage = "Loading data...";
                return <p className="alert alert-info"><i className="fa fa-spin fa-refresh"/> {loadingMessage}</p>;
            } else {
                if (loadingMessage === undefined)
                    loadingMessage = <h3><i className="fa fa-spin fa-refresh" /> Please wait, loading data...</h3>;
                return <div className="container">
                        <div className="row">
                            <div className="col-md-4 col-md-offset-4">
                                <div className="well bs-component">
                                    {loadingMessage}
                                </div>
                           </div>
                        </div>
                    </div>;
            }
        },

    };

    return LoaderMixin;
});
