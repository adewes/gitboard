define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var IssueApi = function(){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new IssueApi();
        return instance;
    }

    IssueApi.prototype = new Subject.Subject();
    IssueApi.prototype.constructor = IssueApi;

    IssueApi.prototype.getIssues = function(fullName,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/issues"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    IssueApi.prototype.getDetails = function(fullName,issueNumber,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/issues/"+issueNumber+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    IssueApi.prototype.getComments = function(fullName,issueNumber,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/issues/"+issueNumber+'/comments'+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});
