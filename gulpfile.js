'use strict';

var gulp = require('gulp');
var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stylish = require('jshint-stylish');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var browserSync = require('browser-sync').create();
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var reload = browserSync.reload;
var args   = require('yargs').argv;
var nib = require('nib');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');

var serverUrl = args.proxy;

if (!serverUrl) {
  serverUrl = 'http://blog.localhost/';
}

// Confingure our directories
var paths = {
  js:     './js/*.js',
  // jsDest: 'aggregated-js',
  css:    './',
  styles: './styl',
  // ds:     'ds_layouts',
  // panels: 'panel_layouts',
  img:    'img',
};

//////////////////////////////
// Begin Gulp Tasks
//////////////////////////////
gulp.task('lint', function () {
  return gulp.src([
      paths.js
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
});

gulp.task('scripts', function() {
  return gulp.src(paths.js)
    // Concatenate everything within the JavaScript folder.
    .pipe(concat('scripts.js'))
    // .pipe(gulp.dest(paths.jsDest))
    // .pipe(rename('scripts.min.js'))
    // Strip all debugger code out.
    // .pipe(stripDebug())
    // Minify the JavaScript.
    // .pipe(uglify())
    .pipe(gulp.dest(paths.js));
});

//////////////////////////////
// Stylus Tasks
//////////////////////////////
gulp.task('styles', function () {
  gulp.src(paths.styles + '/*.styl')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(sourcemaps.init())
    .pipe(stylus({
      paths:  ['node_modules', 'styl'],
      import: ['jeet/stylus/jeet', 'stylus-type-utils', 'nib', 'rupture/rupture', 'variables-site/_variables-site', 'mixins/_mixins-master'],
      use: [nib()],
      'include css': true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());
});

// gulp.task('ds', function () {
//   gulp.src(paths.ds + '/**/*.styl')
//     .pipe(sourcemaps.init())
//     .pipe(stylus({
//       paths:  ['node_modules', 'styles/globals'],
//       import: ['jeet/stylus/jeet', 'stylus-type-utils', 'nib', 'rupture/rupture', 'variables', 'mixins'],
//       use: [nib()]
//     }))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(paths.ds))
//     .pipe(browserSync.stream());
// });

// gulp.task('panels', function () {
//   gulp.src(paths.panels + '/**/*.styl')
//     .pipe(sourcemaps.init())
//     .pipe(stylus({
//       paths:  ['node_modules', 'styles/globals'],
//       import: ['jeet/stylus/jeet', 'stylus-type-utils', 'nib', 'rupture/rupture', 'variables', 'mixins'],
//       use: [nib()]
//     }))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(paths.panels))
//     .pipe(browserSync.stream());
// });

//////////////////////////////
// Autoprefixer Tasks
//////////////////////////////
gulp.task('prefix', function () {
  gulp.src(paths.css + '/*.css')
    .pipe(prefix(["last 8 version", "> 1%", "ie 8"]))
    .pipe(gulp.dest(paths.css));
});

//////////////////////////////
// Watch
//////////////////////////////
gulp.task('watch', function () {
  gulp.watch(paths.js, ['lint', 'scripts']);
  gulp.watch(paths.styles + '/**/*.styl', ['styles']);
  // gulp.watch(paths.ds + '/**/*.styl', ['ds']);
  // gulp.watch(paths.panels + '/**/*.styl', ['panels']);
  // gulp.watch(paths.styles + '/globals/**/*.styl', ['styles', 'ds', 'panels']);
});

//////////////////////////////
// BrowserSync Task
//////////////////////////////
gulp.task('browserSync', function () {
  browserSync.init({
    proxy: serverUrl
  });
});

//////////////////////////////
// Server Tasks
//////////////////////////////
gulp.task('default', ['scripts', 'watch', 'prefix']);
gulp.task('serve', ['scripts', 'watch', 'prefix', 'browserSync'])
