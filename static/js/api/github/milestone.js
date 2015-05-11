define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var MilestoneApi = function(type){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new MilestoneApi();
        return instance;
    }

    MilestoneApi.prototype = new Subject.Subject();
    MilestoneApi.prototype.constructor = MilestoneApi;

    MilestoneApi.prototype.getMilestones = function(fullName,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/milestones"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});
