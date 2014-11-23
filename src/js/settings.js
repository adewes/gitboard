define([],function (Utils) {
    'use strict';

    var settings = {
        source : 'https://api.github.com',
        frontendUrl : '/app',
        github : {
            //Application keys can be managed here:
            //https://github.com/organizations/quantifiedcode/settings/applications/
            //The client ID for the application to use.
            client_id: 'foo',
            //The redirect URL: Must match with the URL entered on Github
            redirect_uri : 'http://localhost:5000/api/v1/authorize/github',
            authorize_url : 'https://github.com/login/oauth/authorize',
            scope : 'user,write:repo_hook,read:org,repo'
        },
        useCache : true,
        cacheValidity : 3600*24, //cache expires after 24 hours
        cacheRefreshLimit  : 0.5, //how long until we fetch the new value of something?
    };
    return settings;
})
