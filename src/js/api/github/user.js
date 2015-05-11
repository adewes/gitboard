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
