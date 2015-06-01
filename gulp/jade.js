var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('jade', ['clean'], function (done) {

    return gulp.src('./sample/index.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./sample'));
});
