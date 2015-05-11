define([],function (Utils) {
    'use strict';

    var settings = {
        source : 'https://api.github.com',
        frontendUrl : '/',
        html5history : false,
        useCache : true,
        cacheValidity : 3600*24, //cache expires after 24 hours
        cacheRefreshLimit  : 0.5, //how long until we fetch the new value of something?
    };
    return settings;
})
