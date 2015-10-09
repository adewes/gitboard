({
    appDir: "../../",
    dir : "../../optimized",
    mainConfigFile : "config.js",
    baseUrl: "static",
    generateSourceMaps: true,
    removeCombined : true,
    keepBuildDir : true,
    optimize: 'uglify2',
    skipDirOptimize : true,
    preserveLicenseComments : false,
    modules: [
      {
        name: "js/main",
      }
    ],
    paths: {
      //use the minified version instead of minifying it by ourself
      //since otherwise we would still include some debug code.
      //By using the minified version, we make sure, that we get the
      //development build.
      "react": "bower_components/react/react.min"
    }
})
