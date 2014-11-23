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
