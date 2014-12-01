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

        /*
        A basic React component can be in one of the following three states:

        - Loading data: The component waits for data from the API to arrive.
        - Ready to use: The component has loaded all data and is ready to be used.
        - Failed to load data: An error occured and the data could not be loaded.

        This component helps to implement a generic workflow for all classes and display
        a loading indicator while resources are being loaded from the backend.

        How to use this component:

        1) Define a `resources` function that returns a list of resource description that your
           component uses. A resource description should contain at least a name and an endpoint
           function that should be called to fetch the resource.
        2) Alternatively, define a `onLoadResources` function that takes care of loading resources.
           This function should wrap all success and error handlers with `looadingSuccess` or
           `loadingError` functions, as discussed below.
        3) When you finished loading resources, either manually call the `loadingSucceeded` 
           function, or wrap your success handler using the `loadingSuccess` function.
        4) If loading should have failed, either call `loadingFailed`, or wrap your error
           handler using the `loadingError` function.
        5) If you want to display a custom loading or error message, define the functions
           `getLoadingMessage` or `getErrorMessage`. Use them to return a valid REACT component,
           which will be rendered instead of the `state.loadingMessage` or `state.errorMessage`
           texts. The `getErrorMessage` function will receive a copy of the error data object that
           you provided to `loadingFailed`, if any.

        Options when defining resources:

        -params     : Parameters that will get passed to the specified API endpoints.
        -endpoint   : The API endpoint to call to fetch the resource
        -success    : The function to call if the loading succeeeds (if any)
        -error      : The function to call if the loading fails (if any)
        -mapping    : How the data should be mapped to the state object if the call succeeds.
                      For every entry in this hash table, the key gives the name of the attribute
                      in the `state` object and the `value` gives the name of the key in the data.
                      If you choose `*` for the value, the whole data will be copied.
                      The mapping will only be used if no `success` handler is defined.
        -nonBlocking: This resource will not keep the component from being rendered while it is being
                      loaded. Useful if you want to already display parts of your component even
                      if the given resource is not yet available to it.
        -nonCritical: Failing to load the resource will not result in the error header being displayed.
        -before     : A function to be called before the API request is triggered. If this function
                      returns false, the resource will not be loaded.

        Global options:

        -silentLoading: Will not display a loading message while resources are being loaded
        */

        updateLoadingState : function(role,state){
            if (!this.isMounted())
                return;
            if (role == undefined)
                role = "default";

            for (var key in this.loadingState){
                var list = this.loadingState[key];
                if (key == state){
                if (!(role in list))
                    list[role] = true;
                }else{
                if (role in list)
                    delete list[role];
                }
            }
        },

        onLoadingError : function(handler,role,nonCritical){
            if (role == undefined)
                role = "default";
            return function(){
                if (!this.isMounted())
                    return;
                if (nonCritical !== undefined)
                    this.updateLoadingState(role,"failedNonCritical");
                else
                    this.updateLoadingState(role,"failed");
                if (handler !== undefined)
                    return handler.apply(this,arguments);
            }.bind(this);
        },

        onLoadingSuccess : function(handler,role){
            if (role == undefined)
                role = "default";
            return function(){
                if (!this.isMounted())
                    return;
                this.updateLoadingState(role,"succeeded");
                if (arguments.length > 0)
                {
                    var data = arguments[0];
                    if (this.requestIds !== undefined && this.requestIds[role] !== undefined)
                        if (data.__requestId__ && data.__requestId__ !== this.requestIds[role] && ! data.__cached__){
                            return;
                        }
                }
                if (handler !== undefined)
                    return handler.apply(this,arguments);
            }.bind(this);
        },

        autoLoadResources : function(props){
            if (this.onLoadResources !== undefined)
                this.onLoadResources(props);
            var resources = this.resources(props,this.state);
            if (this.resources === undefined)
                return;
            for(var i in resources){
                var resource = resources[i];
                if (resource.name in this.loadingState.succeeded ||
                    resource.name in this.loadingState.failed ||
                    resource.name in this.loadingState.inProgressNonBlocking ||
                    resource.name in this.loadingState.inProgress)
                    continue;
                if (resource.before)
                    if (!resource.before(props,resource))
                        continue;
                var params = [];
                if (resource.params)
                    params = resource.params.slice(0);

                var onSuccess = function(resource,data){
                    if (resource.success) {
                        resource.success(data);
                        if (resource.mapping === undefined)
                            return;
                    }

                    var mapping = resource.mapping;
                    if (!mapping){
                        mapping = {};
                        mapping[resource.name] = resource.name;
                    }
                    var d = {};
                    for(var key in mapping){
                        d[key] = data[mapping[key]];
                    }
                    this.setState(d);

                }.bind(this,resource);

                params.push(this.onLoadingSuccess(onSuccess,resource.name));
                params.push(this.onLoadingError(resource.error,resource.name,resource.nonCritical));
                this.updateLoadingState(resource.name,resource.nonBlocking !== undefined ? "inProgressNonBlocking" : "inProgress");
                this.requestIds[resource.name] = resource.endpoint.apply(this,params);
            }
        },

        componentDidMount : function(){
            this.loadResources(this.props);
            this.setState({loaderInitialized : true});
        },

        loadResources : function(props){
            this.resetLoadingState();
            if (this.resources)
                this.autoLoadResources(props);
            if (this.onLoadResources)
                this.onLoadResources(props);
        },

        componentWillReceiveProps : function(props){
            if (JSON.stringify([props.data,props.params]) == JSON.stringify([this.props.data,this.props.params]))
                return false;
            this.loadResources(props)
        },

        resetLoadingState : function(){
            this.loadingState = {
                    inProgress : {},
                    inProgressNonBlocking : {},
                    failed : {}, 
                    failedNonCritical : {},
                    succeeded : {},
                };
        },

        getInitialState : function(){
            return {
                    loaderInitialized : false,
                    loadingMessage : "",
                    loadingErrorMessage : ""};
        },

        loaderIsActive : function(){
            return !this.state.loaderInitialized ||
                    Object.keys(this.loadingState.inProgress).length ||
                    Object.keys(this.loadingState.failed).length;
        },

        componentWillMount : function(){
            this._render = this.render;
            this.render = this.renderLoader;
            this.apis = Apis;
            this.requestIds = {};
            this.resetLoadingState();
        },

        renderLoader : function(){
            if (this.loaderIsActive()){
                return this.showLoader();
            }
            return this._render();
        },

        componentDidUpdate :function(prevProps,prevState){
            this.autoLoadResources(this.props);
        },

        showLoader : function(){
            if (this.silentLoading !== undefined)
                return <div />;
            if (Object.keys(this.loadingState.failed).length)
                return this.showErrorMessage();
            else
                return this.showLoadingMessage();
        },

        showErrorMessage : function(){
            var loadingErrorMessage = <h3>{this.state.loadingErrorMessage}</h3>;
            if (this.getErrorMessage !== undefined)
                loadingErrorMessage = this.getErrorMessage(this.state.loadingErrorData);
            return <div className="content">
                <div className="container">
                    <div className="text-center">
                        <h1>An error has occured...</h1>
                        <h2><i className="fa fa-exclamation-triangle" /></h2>
                        {loadingErrorMessage}
                    </div>
                </div>
            </div>;
        },

        showLoadingMessage : function(){
            var loadingMessage = <h3>{this.state.loadingMessage}</h3>;
            if (this.getLoadingMessage !== undefined)
                loadingMessage = this.getLoadingMessage();
            return <div className="content">
                <div className="container">
                    <div className="text-center">
                        <h1>Loading data...</h1>
                        <h2><i className="fa fa-spin fa-refresh" /></h2>
                        {loadingMessage}
                    </div>
                </div>
            </div>;
        },

    };

    return LoaderMixin;
});
