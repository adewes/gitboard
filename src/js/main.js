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
define(
    [
        "js/components/app",
        "react",
        "js/utils",
        "js/routes",
        "director",
        "js/settings",
    ],
    function (MainApp,
              React,
              Utils,
              Routes,
              Director,
              Settings
             )
    {

    var app = undefined;
    var appComponent = undefined;
    var router = new Director();

    function initApp(){
        appComponent = React.render(app,
          document.getElementById('app')
        );
    }

   var A = React.createClass({
       displayName: 'A',

       render : function(){
            var props = $.extend({},this.props);
            if (this.props.plain){
                delete props.plain;
                return React.DOM.a(props);
            }

            props.onClick = function(e){
                if (this.props.onClick !== undefined)
                    this.props.onClick(e);
                if (e.isDefaultPrevented())
                    return;
                //we only intercept the link if it's not an external one...
                if (props.href.substr(0,4) !== 'http'){
                    e.preventDefault();
                    router.setRoute(props.href);
                }
            }.bind(this);
            return React.DOM.a(props);
       }
    });

    if (Settings.html5history){
        window.A = A;
        Settings.onRedirectTo = function(url){
            router.setRoute(url);
        };
    }
    else
        window.A = "a";

    function render(props){
        if (window.ga !== undefined){
            ga('send', 'pageview', {
             'page': location.pathname + location.search  + location.hash
            });
        }
        if (props.params !== undefined)
        {
            props.stringParams = props.params.slice(1);
            props.params = Utils.getUrlParameters(props.params.slice(1));
        }
        else
            props.params = {};

        props.router = router;

        if (Settings.html5history){
            var re = new RegExp(Settings.frontendUrl+'(.*)$')
            var result = re.exec(window.location.pathname);
            props.baseUrl = result[1];
        }
        else{
            var re = /^#(.*?)(\?.*)?$/i;
            var result = re.exec(window.location.hash);
            if (result !== null){
                props.baseUrl = result[1];
            }
            else
                props.baseUrl = "/app";
        }

        if (app === undefined)
        {
            app = React.createElement(MainApp,props);
            initApp();
        }
        else
            appComponent.replaceProps(props);
    }


    router.configure({html5history : Settings.html5history,
                      notfound : function(url){
                            Utils.redirectTo(Utils.makeUrl('/'));
                        },
                      strict : false });

    router.param('repositoryId', /([\w\d\-\:\.\/]+)/);
    router.param('milestoneId', /(\d+)/);
    router.param('organizationId', /([\w\d\-\:\.]+)/);

    //We add URL-style parameters to all routes by decorating the original handler function.
    var routesWithParams = {};

    var lastUrl;
    var lastUrlPattern;

    function generateCallBack(urlPattern, urlWithParams){
      return function(){
        var urlCallback = Routes[urlPattern];
        var params = urlCallback.apply(
          this,
          Array.prototype.slice.call(arguments, 0, arguments.length-(Settings.html5history ? 0 : 1))
        );

        if (Utils.callbacks.onUrlChange && window.location.href != lastUrl){
          for(var i in Utils.callbacks.onUrlChange){
            var callback = Utils.callbacks.onUrlChange[i];
            if (callback(urlPattern,urlWithParams,window.location.href) == false){
              if (lastUrl)
                Utils.replaceUrl(lastUrl);
              return function(){};
            }
          }
        }

        if (Settings.html5history)
          params.params = window.location.search;
        else
          params.params = arguments[arguments.length-1];

        var url = window.location.href;
        params.url = url;
        //update title & meta tags
        Utils.setTitle(params.title);
        Utils.setMetaTag("description", (params.metaTags || {}).description);
        Utils.setMetaTag("keywords", ((params.metaTags || {}).keywords || []).concat(Settings.globalKeyKeywords || []).join(","));
        //render the view
        render(params);
        //scroll to top if we navigated to a different page
        if(urlPattern !== lastUrlPattern) {
          document.documentElement.scrollTop = 0;
        }
        //set lastUrl and lastUrlPattern
        lastUrl = url;;
        lastUrlPattern = urlPattern;
      };
    };

    for (var url in Routes){
        var urlWithParams = url+'/?(\\?.*)?';
        
        if (Settings.html5history)
            urlWithParams = url;
        var prefix = '';
        if (Settings.html5history)
            prefix = Settings.frontendUrl;
        routesWithParams[prefix+urlWithParams] = generateCallBack(url,urlWithParams);
    }

    router.mount(routesWithParams);
    router.init();
    Utils.setRouter(router);

    if (!Settings.html5history){
        if (window.location.hash === ''){
            window.location.hash="#/";
        }
    }
    else{
        if (window.location.hash.substring(0,2) == '#/'){
            window.location = window.location.protocol+'//'+window.location.host+Settings.frontendUrl+window.location.hash.substring(1);
        }
    }

    return {router: router, initApp: initApp};

});
