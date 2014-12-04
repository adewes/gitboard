define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var OrganizationApi = function(type){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new OrganizationApi();
        return instance;
    }

    OrganizationApi.prototype = new Subject.Subject();
    OrganizationApi.prototype.constructor = OrganizationApi;

    OrganizationApi.prototype.getOrganizations = function(owner,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/users/"+owner+"/orgs"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    OrganizationApi.prototype.getRepositories = function(owner,data,onSuccess,onError){
        console.log("Getting repositories for organization "+owner)
        return Utils.apiRequest({
            type : 'GET',
            url : "/orgs/"+owner+"/repos"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    OrganizationApi.prototype.getDetails = function(name,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/orgs/"+name+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});
