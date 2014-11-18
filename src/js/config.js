var require ={
  paths: {
    "text" : "assets/js/text",
    "jquery" : "bower_components/jquery/dist/jquery",
    "bootstrap" : "bower_components/bootstrap/dist/js/bootstrap",
    "moment" : "bower_components/momentjs/moment",
    "director" : "bower_components/director/build/director",
    "react": "bower_components/react/react",
    "sprintf" :"bower_components/sprintf/src/sprintf",
    "markdown":"bower_components/markdown/lib/markdown",
  },
  shim : {
    "director" : {
        exports : 'Router'
    },
    "bootstrap" : {
        deps : ['jquery']
    },
    "prism" : {
        exports : 'Prism'
    }
  },
baseUrl : "../static",
urlArgs: "bust=" + (new Date()).getTime()
};
