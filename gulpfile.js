var gulp = require('gulp');
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');

//Default task
gulp.task('default', ['bower']); 

/*
* downloads front-end dependencies
*/
gulp.task('bower', function() {
    bower('./components')
        .on("end", () => {
            gulp.start('useref');
            gulp.start('images');
            gulp.start('fonts-weather-icons');
            gulp.start('fonts-bootstrap');
        })
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
    })
})

gulp.task('sass', function() {
    return gulp.src('styles/*.scss')
      .pipe(sass())
      .pipe(gulp.dest('styles'))
      .pipe(browserSync.reload({
        stream: true
      }))
});

gulp.task('watch', ['browserSync', 'sass', 'useref', 'images', 'fonts-weather-icons', 'fonts-bootstrap'], function (){
    gulp.watch('styles/*.scss', ['sass', 'useref']); 
    gulp.watch('dist/*.html', browserSync.reload); 
    gulp.watch('js/*.js', ['useref', 'browserSync']);
    gulp.watch('images/*', ['images', 'browserSync']);
    gulp.watch('components/weather-icons/**/*', ['fonts-weather-icons', 'browserSync']);
    gulp.watch('components/bootstrap/**/*', ['fonts-bootstrap', 'browserSync']);
    // Other watchers
})

gulp.task('useref', ['sass'], function(){
    return gulp.src('index.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
    return gulp.src('images/**/*.+(png|jpg|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts-weather-icons', function() {
    return gulp.src('components/weather-icons/font/**/*')
    .pipe(gulp.dest('dist/font'))
})

gulp.task('fonts-bootstrap', function() {
    return gulp.src('components/bootstrap/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})


