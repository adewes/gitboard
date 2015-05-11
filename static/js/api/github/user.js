define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var UserApi = function(){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new UserApi();
        return instance;
    }

    UserApi.prototype = new Subject.Subject();
    UserApi.prototype.constructor = UserApi;

    UserApi.prototype.getRepositories = function(owner,data,onSuccess,onError){
        console.log("Getting repositories for user "+owner)
        return Utils.apiRequest({
            type : 'GET',
            url : "/users/"+owner+"/repos"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    UserApi.prototype.getProfile = function(onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/user",
            success : onSuccess,
            error: onError
            });
    }

    return {getInstance:getInstance};

});
