var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var del = require('del');

var path = {
	libraries: [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/underscore/underscore.js',
    'js/lib/jquery.tmpl.js',
    'js/config/config.js'
	],
  common: [
    'js/common/common.js'
  ],
  pages: [
    'js/pages/entry.js'
  ]
};

gulp.task('library', function() {
  return gulp.src(path.libraries)
    .pipe(concat('sc.common.js'))
    .pipe(gulp.dest('js'))
});

gulp.task('common-scripts', function() {
  return gulp.src(path.common)
    .pipe(concat('sc.js'))
    .pipe(gulp.dest('js'))    
});

gulp.task('page-scripts', function() {
  return gulp.src(path.pages)
    .pipe(rename({
      prefix:'sc.'
    }))
    .pipe(gulp.dest('js'))   
});

gulp.task('uglify', function() {
  return gulp.src(['js/*.js'])
    .pipe(gulp.dest('js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js'))
});

// gulp.task('clean', function() {
//    return del(['js/*.js']);
// });

// // dev
// gulp.task('default', ['clean'], function() {
//    gulp.start('library', 'css', 'common-scripts', 'page-scripts');
// });

//수정필요
// gulp -> gulp uglify