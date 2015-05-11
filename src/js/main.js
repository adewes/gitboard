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
        console.log(props);
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
            if (result !== null)
                props.baseUrl = result[1];
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
                            window.location.pathname = Settings.frontendUrl;
                        },
                      strict : false });

    router.configure({notfound : function(url){Utils.redirectTo(Utils.makeUrl("/"));},strict : false });
    router.param('repositoryId', /([\w\d\-\:\.\/]+)/);
    router.param('milestoneId', /([\w\d\-\:\.]+)/);
    router.param('organizationId', /([\w\d\-\:\.]+)/);

    //We add URL-style parameters to all routes by decorating the original handler function.
    var routesWithParams = {};

    var lastUrl;

    for (var url in Routes){
        var urlWithParams = url+'/?(\\?.*)?';
        
        if (Settings.html5history)
            urlWithParams = url;

        var generateCallBack = function(url, urlWithParams){
            return function(){
                var callBack = Routes[url];
                var params = callBack.apply(
                    this,
                    Array.prototype.slice.call(arguments, 0, arguments.length-(Settings.html5history ? 0 : 1))
                );

                if (Settings.html5history)
                    params.params = window.location.search;
                else
                    params.params = arguments[arguments.length-1];

                params.url = url;

                return render(params);
            };
        };
        var prefix = '';
        if (Settings.html5history)
            prefix = Settings.frontendUrl;
        routesWithParams[prefix+urlWithParams] = generateCallBack(url,urlWithParams);
    }

    router.mount(routesWithParams);
    router.init();

    if (!Settings.html5history){
        if (window.location.pathname != Settings.frontendUrl){
            window.location.pathname = Settings.frontendUrl;
        }
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
