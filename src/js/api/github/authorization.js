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
