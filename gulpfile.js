var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

// Gulp Plumber - It will prevent pipe breaking caused by errors from 
// gulp plugins. In other words when you make a syntax 
// error in a Sass stylesheet, the gulp watcher will not crash

gulp.task('sass', function() {
  gulp.src('public/stylesheets/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('watch', function() {
  gulp.watch('public/stylesheets/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);