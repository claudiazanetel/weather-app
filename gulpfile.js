var gulp = require('gulp');
var bower = require('gulp-bower');

//Default task
gulp.task('default', ['bower']); 


/*
* downloads front-end dependencies
*/
gulp.task('bower', function() {
    return bower('./components')
});