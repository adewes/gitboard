define(["js/utils","js/subject"],function (Utils,Subject) {
    'use strict';

    var RequestNotifier = function(){
        Subject.Subject.call(this);
        this.currentRequests = {};
        this.requestCount = 0;
        this.retryInterval = 1;
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new RequestNotifier();
        return instance;
    }

    RequestNotifier.prototype = new Subject.Subject();
    RequestNotifier.prototype.constructor = RequestNotifier;

    RequestNotifier.prototype.register = function(requestId,data){
        this.currentRequests[requestId] = {registeredAt : new Date(),data : data};
        this.notify("registerRequest",requestId);
        this.notify("activeRequestCount",this.activeRequestCount());
        return requestId;
    }

    RequestNotifier.prototype.success = function(requestId,data){
        if (requestId in this.currentRequests)
            delete this.currentRequests[requestId];
        this.notify("requestSucceeded",{requestId : requestId,data : data});
        this.notify("activeRequestCount",this.activeRequestCount());
    }

    RequestNotifier.prototype.error = function(requestId,xhr,data,e){
        if (requestId in this.currentRequests)
            delete this.currentRequests[requestId];
        if (xhr.readyState == 0){
            var requestData = Utils.requestData(requestId);
            if (requestData == undefined)
                return;
            this.notify("connectionError",{requestId : requestId,
                                           xhr : xhr,
                                           data : data,
                                           requestData : requestData,
                                           e :e})
        }
        else{
            this.notify("requestFailed",{requestId : requestId,xhr : xhr,data : data,e : e});
        }
        this.notify("activeRequestCount",this.activeRequestCount());
    }

    RequestNotifier.prototype.activeRequestCount = function(requestId){
        return Object.keys(this.currentRequests).length;
    }

    return {getInstance:getInstance};

});
