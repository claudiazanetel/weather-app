var gulp = require('gulp');
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');

//Default task
gulp.task('default', ['bower']); 

/*
* downloads front-end dependencies
*/
gulp.task('bower', function() {
    return bower('./components')
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

gulp.task('sass', function() {
    return gulp.src('styles/*.scss') // Gets all files ending with .scss in app/scss
      .pipe(sass())
      .pipe(gulp.dest('styles'))
      .pipe(browserSync.reload({
        stream: true
      }))
});

gulp.task('watch', ['browserSync', 'sass'], function (){
    gulp.watch('styles/*.scss', ['sass']); 
    gulp.watch('*.html', browserSync.reload); 
    gulp.watch('js/*.js', browserSync.reload); 
    // Other watchers
})

gulp.task('useref', function(){
    return gulp.src('*.html')
      .pipe(useref())
      .pipe(gulp.dest('dist'))
  });

gulp.watch('styles*.scss', ['sass']); 


