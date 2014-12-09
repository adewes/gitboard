var gulp = require('gulp');
var react = require('gulp-react');
var watch = require('gulp-watch');
var rjs = require("gulp-requirejs");
var jsx = require("gulp-jsx");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var nop = require("gulp-nop");
var concat = require("gulp-concat");
var cleanCss = require("clean-css");
var shell = require("gulp-shell");
var bower = require('gulp-bower');
var debug = require("gulp-debug");
var uglify = require("gulp-uglify");
var preprocess = require("gulp-preprocess");
var tap = require("gulp-tap");
var nodePath = require("path");
var clean = require("gulp-clean");
var sass = require('gulp-ruby-sass');

var environment = process.env.ENVIRONMENT || 'development';

/*
If run in the 'production' environment, we will perform various optimizations as well
(e.g. run r.js, minify and combine JS and CSS)

If run in the 'development' environment, a watcher will check for file modifications and
automatically updated stylesheets and JS files as needed.
*/

console.log("Environment: "+environment);

var sourcePath = 'src';
var buildPath = 'build';
var baseUrl="static";

var paths = {
  scripts: [sourcePath+'/js/**/*.js'],
  jsx : [sourcePath+'/js/**/*.jsx'],
  assets : [sourcePath+'/assets/**'],
  templates : [sourcePath+"/templates/**/*.html"],
  css : [sourcePath+'/assets/**/*.css'],
  scss : [sourcePath+'/scss/**/*.scss'],
};

//The CSS files that we include in the source
var cssFiles = [
        '/bower_components/font-mfizz/css/font-mfizz.css',
        '/bower_components/font-awesome/css/font-awesome.min.css',
        '/bower_components/octicons/octicons/octicons.css',
        '/assets/css/bootstrap.min.css',
        '/bower_components/bootstrap-material-design/dist/css/material-wfont.css',
        '/assets/css/styles.css',
        ];

var cssTags;

if (environment == 'production')
{
    //We suppress debug output
    debug = nop;
    cssTags = "<link href=\"assets/css/all.min.css\" rel=\"stylesheet\">";
}
else{
    cssTags = cssFiles.map(
        function(cssFile){
            return "<link href=\""+baseUrl+cssFile+"\" rel=\"stylesheet\">";
        }
    ).join("\n\t");
}

gulp.task('optimize',['optimize-rjs','optimize-css','optimize-js']);

gulp.task('optimize-rjs',['build'],shell.task(['r.js -o build.js'],{'cwd' : 'build/static/js'}));

// Create css file from scss
gulp.task('create css', function () {
    return gulp.src(paths.scss)
        .pipe(sass({style: 'compressed'}))
        .pipe(sass({
            sourcemap: true, 
            sourcemapPath: '../scss', 
            cacheLocation: './sass-cache'
        }))
        .on('error', function (err) { console.log(err.message); })        
        .pipe(gulp.dest(buildPath+'/static/css'))
});

gulp.task('optimize-css',['build','optimize-rjs'],function(){
    gulp.src(cssFiles.map(function(cssFile){return buildPath+'/optimized/static'+cssFile;}))
        .pipe(
                tap(function (file,t){
                    file.contents = new Buffer(cleanCss({root : __dirname+'/'+buildPath+'/optimized',relativeTo : '/'+nodePath.relative(__dirname+'/'+buildPath+'/optimized',nodePath.dirname(file.path))}).minify(file.contents));
                })
            )
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest(buildPath+'/optimized/static/assets/css'))
});

gulp.task('optimize-js',['build','optimize-rjs'], function() {
  gulp.src(buildPath+'/optimized/static/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(buildPath+'/optimized/static/js'))
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(buildPath+'/static/bower_components'))
});

gulp.task('scripts', function (){
    return gulp.src(paths.scripts)
        .pipe(plumber())
        .pipe(gulp.dest(buildPath+'/static/js'))
});

gulp.task('scss', function (){
    return gulp.src(paths.scss)
       .pipe(plumber())
       .pipe(debug())
       .pipe(gulp.dest(buildPath+'/static/scss'))
});

gulp.task('templates', function (){
    return gulp.src(paths.templates)
        .pipe(plumber())
        .pipe(preprocess({ context : {ENVIRONMENT : environment,cssTags : cssTags } }))
        .pipe(gulp.dest(buildPath+'/'))
});

gulp.task('assets', function (){
    return gulp.src(paths.assets)
       .pipe(plumber())
       .pipe(gulp.dest(buildPath+'/static/assets'))
});

gulp.task('jsx', function (){
    return gulp.src(paths.jsx)
        .pipe(debug({verbose: true}))
        .pipe(plumber({onError : function(e){console.log("foo")}}))
        .pipe(jsx({tagMethods : true}))
        .pipe(rename(function (path) {
                path.extname = ".js";
        }))
        .pipe(gulp.dest(buildPath+'/static/js'))
});

gulp.task('watch',['build'],function(){
    gulp.watch(paths.scripts,['scripts']);
    gulp.watch(paths.jsx,['jsx']);
    gulp.watch(paths.assets,['assets']);
    gulp.watch(paths.bower,['bower']);
    gulp.watch(paths.templates,['templates']);
    gulp.watch(paths.scss,['create css']);    
});

gulp.task('clean',function(){
    return gulp.src(buildPath, {read: false})
        .pipe(clean());
});

gulp.task('build',['bower','scripts','jsx','assets','templates','create css','scss']);

if (environment == 'development'){
    gulp.task('default', ['build','watch']);
}
else{
    gulp.task('default', ['build','optimize']);
}
