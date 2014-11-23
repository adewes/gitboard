define(["js/components/app",
        "react",
        "js/utils",
        "director",
        ],function (MainApp,
                    React,
                    Utils,
                    Director
                    )
    {

    var app = undefined;

    function initApp(){
        React.renderComponent(app,
          document.getElementById('qcapp')
        );
    }

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

        if (app === undefined)
        {
            app = MainApp(props);
            initApp();
        }
        else
        {
            app.replaceProps(props);
        }
    }

    var routes = {
        '' : 
            function(){return {screen : 'index',data : {}}},
        '/board': 
            function(){return {screen : 'board',
                data : {}
            }},
        '/login': 
            function(){return {screen : 'login',
                data : {}
            }},
      };

    var router = new Director();

    router.configure({notfound : function(url){Utils.redirectTo("#/");},strict : false });

    //We add URL-style parameters to all routes by decorating the original handler function.
    var routesWithParams = {};
    for (var url in routes){
        var urlWithParams = url+'/?(\\?.*)?';
        var generateCallBack = function(url,urlWithParams){
            return function(){
                var callBack = routes[url];
                var params = callBack.apply(this,Array.prototype.slice.call(arguments,0,arguments.length-1));
                params['params'] = arguments[arguments.length-1];
                return render(params);
            };
        };

        routesWithParams[urlWithParams] = generateCallBack(url,urlWithParams);
    }

    router.mount(routesWithParams);

    if (window.location.hash == '')
        window.location.hash="#/";

    router.init();

    return {'router' : router,'initApp' : initApp};
    });
