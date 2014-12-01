define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var RepositoryApi = function(type){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new RepositoryApi();
        return instance;
    }

    RepositoryApi.prototype = new Subject.Subject();
    RepositoryApi.prototype.constructor = RepositoryApi;

    RepositoryApi.prototype.getRepositories = function(owner,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/users/"+owner+"/repos",
            data: data,
            success : onSuccess,
            error: onError,
            },{});
    }

    RepositoryApi.prototype.getDetails = function(owner,repo,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+owner+"/"+repo,
            data: data,
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});
