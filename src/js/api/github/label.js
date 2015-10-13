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
define(["js/utils","js/subject","js/settings"],function (Utils,Subject,Settings) {
    'use strict';

    var LabelApi = function(){
        Subject.Subject.call(this);
    };

    var instance;

    function getInstance()
    {
        if (instance === undefined)
            instance = new LabelApi();
        return instance;
    }

    LabelApi.prototype = new Subject.Subject();
    LabelApi.prototype.constructor = LabelApi;

    LabelApi.prototype.getRepositoryLabels = function(fullName,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/labels"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    LabelApi.prototype.getIssueLabels = function(fullName,issueNumber,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/issues/"+issueNumber+"/labels"+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    LabelApi.prototype.removeLabel = function(fullName,issueNumber,labelName,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/repos/"+fullName+"/issues/"+issueNumber+"/labels/"+labelName,
            success : onSuccess,
            error: onError,
            },{});
    }

    LabelApi.prototype.createLabel = function(fullName,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/repos/"+fullName+"/labels",
            data: JSON.stringify(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    LabelApi.prototype.addLabels = function(fullName,issueNumber,labelNames,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/repos/"+fullName+"/issues/"+issueNumber+"/labels",
            success : onSuccess,
            data : JSON.stringify(labelNames),
            error: onError,
            },{});
    }

    LabelApi.prototype.getDetails = function(fullName,labelNumber,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/repos/"+fullName+"/labels/"+LabelNumber+'?'+Utils.toUrlParams(data),
            success : onSuccess,
            error: onError,
            },{});
    }

    return {getInstance:getInstance};

});
