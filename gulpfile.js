var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');


// Gulp Plumber - It will prevent pipe breaking caused by errors from 
// gulp plugins. In other words when you make a syntax 
// error in a Sass stylesheet, the gulp watcher will not crash

gulp.task('sass', function() {
  gulp.src('public/stylesheets/style.scss')
    .pipe(plumber())
    .pipe(sass())
    //minifies css
    .pipe(csso())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('compress', function() {
	gulp.src([
		//The reason we pass an array of strings in this particular order 
		//is bc we need to concat them in the right order. We can't load app.js
		//before angular.js is loaded. When we run this task a new file 
		//'app.min.js' is created
		'public/vendor/angular.js',
		'public/vendor/*.js',
		'public/app.js',
		'public/services/*.js',
		'public/controllers/*.js',
		'public/filters/*.js',
		'public/directives/*.js'
	])
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public'));
});

//This task minimizes the number of HTTP requests by cachin AngularJS
//templates. Great for building high performance apps.
gulp.task('templates' function() {
	gulp.src('public/views/**/*.html')
		.pipe(templateCache({ root: 'views', module: 'MyApp' }))
		.pipe(gulp.dest('public'));
});

//gulp watches all files except for ones preceded by '!'
gulp.task('watch', function() {
  gulp.watch('public/stylesheets/*.scss', ['sass']);
  gulp.watch('public/views/**/*.html', ['templates']);
  gulp.watch(['public/**/*.js', '!public/app.min.js', '!public/templates.js', '!public/vendor'], ['compress']);
});

gulp.task('default', ['sass', 'compress', 'templates', 'watch']);