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
define(["js/settings",
        "jquery"],function (settings,
                            $) {
    'use strict';

    var requestCount = 0;
    var ongoingRequests = {};
    var requestData = {};
    var requestNotifiers = [];
    var router;

    var utils = {

        setRouter : function(r){
            router = r;
        },

        getUrlParameters: function(query)
        {
            var params = {}
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                pair = pair.map(decodeURIComponent);
                if (pair[0] in params)
                {
                    if (Array.isArray(params[pair[0]]))
                        params[pair[0]].push(pair[1]);
                    else
                        params[pair[0]] = [params[pair[0]],pair[1]];
                }
                else
                    params[pair[0]] = pair[1];
            }
            return params;
        },

        makeUrlParameters: function(params){
            var strings = [];
            for(var param in params){
                if (params[param] !== undefined){
                    if (Array.isArray(params[param])){
                        for(var i in params[param])
                            strings.push(param.toString()+"="+encodeURIComponent(params[param][i].toString()))
                    }
                        else
                            strings.push(param.toString()+"="+encodeURIComponent(params[param].toString()));
                }
            }
                return strings.join("&");
        },

        toUrlParams: function(params)
        {
            var urlParams;
            if (params !== undefined)
                urlParams = $.param(params,{traditional:true});
            else
                urlParams = '';
            return urlParams;
        },
        
        makeUrl:function(baseUrl,newParams,oldParams,unsetParams){
            var params = $.extend({},newParams);
            for (var param in oldParams) {
                if (! (param in newParams))
                    params[param] = oldParams[param];
            }
            if (unsetParams !== undefined) {
                for(var i in unsetParams){
                    var param = unsetParams[i];
                    if (params[param] !== undefined)
                        delete params[param]
                }
            }
            if (!settings.html5history)
                baseUrl = '#'+baseUrl;
            var urlParams = this.makeUrlParameters(params);
            if (urlParams)
                return baseUrl+'?'+urlParams;
            return baseUrl;
        },

        accessToken: function(value){
            return this.store("accessToken",value);
        },

        redirectTo:function(url){
            if (router){
                if (url[0] == '#')
                    url = url.slice(1);
                router.setRoute(url);
            }
            else
                window.location = url;
        },

        replaceUrl : function(url){
            history.replaceState(null,null,url);
        },

        getFromCache : function(url){
            var key = "cache_"+url;
            var cache = this.store(key);
            if (cache !== undefined){
                if (cache[1]+cache[2] >= (new Date()).getTime())
                    return cache;
                else{
                    //expired...
                    this.delete(key);
                }
            }
            return undefined;
        },

        storeToCache : function(url,data,validity){
            //default cache validity: 1 hour
            validity = (typeof validity === "undefined") ? settings.cacheValidity : validity;
            var key = "cache_"+url;
            var cache = this.store(key);
            var cacheUrls = this.store("cache_urls") || [];
            if (cache === undefined)
            {
                cacheUrls.push(key);
            }

            cache = [data,(new Date()).getTime(),validity*1000];

            while(true){
                try{
                    this.store(key,cache);
                    this.store("cache_urls",cacheUrls);
                    break;
                }
                catch(e){
                    if (cacheUrls.length == 0)
                        break;
                    var firstUrl = cacheUrls[0];
                    cacheUrls.splice(0,1);
                    this.delete(firstUrl)
                }
            }
        },

        requestData : function(requestId){
            return requestData[requestId];
        },

        addRequestNotifier : function(notifier){
            if (!(notifier in requestNotifiers))
                requestNotifiers.push(notifier);
        },

        removeRequestNotifier : function(name,notifier){
            if (notifier in requestNotifiers)
                requestNotifiers.splice(requestNotifiers.indexOf(notifier),1);
        },

        removeFromCache : function(url){
            var key = "cache_"+url;
            this.remove(key);
        },


        apiRequest: function(data,opts){

            if (opts === undefined)
                opts = {};

            var authenticated = (typeof opts.authenticated === "undefined") ? true : opts.authenticated;
            var cached = (typeof opts.cached === "undefined") ? true : opts.cached;

            var fullData;
            var requestId = requestCount++;

            if (authenticated)
            {
                var headers = {
                        'X-Requested-With' : 'XMLHttpRequest'
                    };
                if (opts.login && opts.password)
                    headers['Authorization'] = 'Basic '+btoa(opts.login+':'+opts.password);
                else if (this.accessToken() !== undefined)
                    headers['Authorization'] = 'Basic '+btoa(this.accessToken()+':x-oauth-basic')
                if (opts.otp !== undefined)
                    headers['X-Github-OTP'] = opts.otp;
                //If this is an authenticated request, we add the authorization header
                fullData = $.extend($.extend({},data),{
                    url : settings.source+data['url'],
                    dataType : 'json',
                    headers : headers
                    });
            }
            else{
                fullData = $.extend($.extend({},data),{
                   url : settings.source+data['url'],
                   beforeSend : function(xhr){
                       xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                   }.bind(this)
                }); 
            }

            //We overwrite the success/error handlers so that we can inform the request notifier about the status of the request.

            for(var i in requestNotifiers){
                var requestNotifier = requestNotifiers[i];
                requestNotifier.register(requestId,fullData);
            }

            var statusSuccessHandler = function(requestId,originalHandler,data){
                for(var i in requestNotifiers){
                    var notifier = requestNotifiers[i];
                    notifier.success(requestId,data);
                }
                if (originalHandler !== undefined){
                    return originalHandler($.extend({'__requestId__' : requestId},data));
                delete requestData[requestId];
                }
            }.bind(this,requestId,fullData.success);

            var statusErrorHandler = function(requestId,originalHandler,xhr,data,e){
                for(var i in requestNotifiers){
                    var notifier = requestNotifiers[i];
                    notifier.error(requestId,xhr,data,e);
                }
                if (originalHandler !== undefined)
                    return originalHandler(xhr,$.extend({'__requestId__' : requestId}.data),e);
                delete requestData[requestId];
            }.bind(this,requestId,fullData.error);

            fullData.error = statusErrorHandler;
            fullData.success = statusSuccessHandler;

            if (fullData.type == 'GET')
            {
                var makeCall = true;
                if (ongoingRequests[fullData.url] !== undefined){
                    ongoingRequests[fullData.url].callbacks.push({success : fullData.success,error : fullData.error});
                    makeCall = false;
                }
                else{
                    ongoingRequests[fullData.url] = { callbacks : [{success :fullData.success,error : fullData.error}]};
                    var onSuccess = function(data){
                        if (ongoingRequests[fullData.url] === undefined){
                            return;
                        }
                        for(var i=0;i<ongoingRequests[fullData.url].callbacks.length;i++){
                            var callbacks = ongoingRequests[fullData.url].callbacks[i];
                            if (callbacks.success !== undefined)
                                callbacks.success(data);
                        }
                        if (data['__cached__'] === undefined){
                            delete ongoingRequests[fullData.url];
                        }
                    }.bind(this);

                    var onError = function(xhr,data,e){
                        if (ongoingRequests[fullData.url] === undefined)
                            return;
                        for(var i=0;i<ongoingRequests[fullData.url].callbacks.length;i++){
                            var callbacks = ongoingRequests[fullData.url].callbacks[i];
                            if (callbacks.error !== undefined)
                                callbacks.error(xhr,data,e);
                        }
                        delete ongoingRequests[fullData.url];
                    }.bind(this);

                    fullData.success = onSuccess;
                    fullData.error = onError;
                }

                if (cached && settings.useCache){
                    //if the cache is activated and this is a GET request, do the caching magic

                    var originalOnSuccess = fullData.success;
                    var originalOnError = fullData.error;
                    var url = fullData.url;
                    var cachedData = this.getFromCache(url);
                    if (cachedData !== undefined && cachedData[0] !== undefined){
                        fullData['ifModified'] = true;
                        if (originalOnSuccess){
                            var cd = $.extend($.extend({},cachedData[0]),{'__requestId__' : requestId,'__cached__' : true});
                            originalOnSuccess(cd);
                        }
                    }

                    var onSuccess = function(url,cachedData,onSuccess,newData,status,xhr){
                        //if the data is unmodified, we retrieve it from the cache instead...
                        if (status == 'notmodified')
                            newData = cachedData[0];
                        else
                            newData = $.extend({'__etag__' : xhr.getResponseHeader('etag')},newData);
                        if (onSuccess)
                            onSuccess(newData);
                        this.storeToCache(url,newData);
                    }.bind(this,url,cachedData,originalOnSuccess)

                    var onError = function(url,cachedData,onError,xhr,status,e){
                        if (cachedData !== undefined)
                            this.removeFromCache(url);
                        if (onError)
                            onError(xhr,status,e);
                    }.bind(this,url,cachedData,originalOnError)

                    fullData.success = onSuccess;
                    fullData.error = onError;
                }
                if (!makeCall)
                    return requestId;
            }

            requestData[requestId] = {data : fullData, opts : opts};
            $.ajax(fullData);

            return requestId;
        },

        logout : function(){
            localStorage.clear();
            this.store("accessToken",undefined);
        },

        login : function(accessToken) {
            //we clear the local storage to make sure no information about other users is present
            localStorage.clear();
            console.log(accessToken);
            this.store("accessToken",accessToken);
        },

        isLoggedIn : function(){
            return this.accessToken() !== undefined ? true : false;
        },

        remove : function(namespace){
            sessionStorage.removeItem(namespace);
        },

        store: function (namespace, data) {
            if (data !== undefined) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            }

            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store)) || undefined;
        },

        delete : function(namespace){
            localStorage.removeItem(namespace);
        }

 };

 return utils;
});
