define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var AuthorizationApi = function(){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new AuthorizationApi();
        return instance;
    }

    AuthorizationApi.prototype = new Subject.Subject();
    AuthorizationApi.prototype.constructor = AuthorizationApi;

    AuthorizationApi.prototype.createAuthorization = function(login,password,otp,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/authorizations",
            data : JSON.stringify(data),
            success : onSuccess,
            error: onError
            },{authenticated : true,login : login,password : password, otp : otp});
    }

    AuthorizationApi.prototype.deleteAuthorization = function(login,password,otp,id,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/authorizations/"+id,
            success : onSuccess,
            error: onError
            },{authenticated : true,login : login,password : password, otp : otp});
    }

    AuthorizationApi.prototype.getAuthorizations = function(login,password,otp,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/authorizations",
            success : onSuccess,
            error: onError
            },{authenticated : true,login : login, password: password, otp : otp});
    }

    return {getInstance:getInstance};

});
