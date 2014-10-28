'use strict';

var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var traceur = require('gulp-traceur');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('clean:all', function (cb) {
  del(['lib/node/**', 'lib/browser/**', 'etc/**'], cb);
});

gulp.task('traceur:runtime', ['clean:all'], function() {
  return gulp.src(traceur.RUNTIME_PATH)
    .pipe(gulp.dest('etc/'));
});

gulp.task('lint', ['build:node'], function () {
  return gulp.src(['src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build:node', ['traceur:runtime'], function () {
    return gulp.src(['src/**/*.js'])
      .pipe(traceur({modules:'commonjs'}))
      .pipe(gulp.dest('lib/node'));
});

gulp.task('test:node', ['lint'], function () {
  return gulp.src('test/**/*.js')
    .pipe(mocha());
});

gulp.task('watch', function() {
    gulp.watch(['src/**', 'test/**', 'index.js'], ['test:node']);
});

gulp.task('default', ['test:node']);
