/*
Copyright (c) 2015 - Andreas Dewes

This file is part of Gitboard.

Gitboard is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
