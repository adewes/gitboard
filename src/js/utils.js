define(["js/settings",
        "jquery"],function (settings,
                            $) {
    'use strict';

    var requestCount = 0;
    var requestEndpoints = {};
    var ongoingRequests = {};
    var requestData = {};
    var requestNotifiers = [];

    var utils = {

        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
                .toString(16);
            }

            return uuid;
        },

        contains : function(array,value){
            for (var i in array) {
                if (array[i] === value)
                    return true;
            }
                return false;
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

        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },

        accessToken: function(value){
            return this.store("accessToken",value);
        },

        hideReminder: function(value){
            return this.store("reminder",value);
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
            return baseUrl+"?"+this.makeUrlParameters(params);
        },

        redirectTo:function(url){
            document.location = url;
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
                if (ongoingRequests[fullData.url] !== undefined){
                    ongoingRequests[fullData.url].callbacks.push({success : fullData.success,error : fullData.error});
                    return requestId; 
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
                    var url = fullData.url;
                    var cachedData = this.getFromCache(url);
                    if (cachedData !== undefined && cachedData[0] !== undefined){
                        fullData['ifModified'] = true;
                        console.log("Adding if modified header...");
                        if (originalOnSuccess !== undefined){
                            originalOnSuccess($.extend($.extend({},cachedData[0]),{'__requestId__' : requestId,'__cached__' : true}));
                            if (cachedData[1]+settings.cacheRefreshLimit*1000 > (new Date()).getTime()){
                                if (url in ongoingRequests)
                                    delete ongoingRequests[url];
                                return requestId;
                            }
                        }
                    }

                    var onSuccess = function(url,cachedData,onSuccess,newData,status){
                        //if the data is unmodified, we retrieve it from the cache instead...
                        if (status == 'notmodified'){
                            newData = cachedData[0];
                        }

                        if (JSON.stringify(newData) == JSON.stringify(cachedData)){
                            return;
                        }
                        if (onSuccess !== undefined){
                            onSuccess(newData);
                        }
                        this.storeToCache(url,newData);
                    }.bind(this,url,cachedData,originalOnSuccess)

                    fullData.success = onSuccess;
                }

            }

            requestData[requestId] = {data : fullData, opts : opts};
            console.log(fullData);
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
            this.store("accessToken",accessToken);
        },

        isLoggedIn : function(){
            return this.accessToken() !== undefined ? true : false;
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
        },

        truncate : function(str,n,useWordBoundary){
         var toLong = str.length>n,
         s_ = toLong ? str.substr(0,n-1) : str;
         s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
         return  toLong ? s_ + '...' : s_;
     },

     truncateInMiddle : function(str,n){
         var toLong = str.length>n+2,
         s_ = toLong ? (str.substr(0,(n-1)/2) + "..." +str.substr(-(n-1)/2)): str;
         return  s_;
     },


 };

 return utils;
});
