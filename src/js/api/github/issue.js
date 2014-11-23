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

    IssueApi.prototype.getIssues = function(owner,repo,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+owner+"/"+repo+"/issues",
            data: data,
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});