var gulp = require('gulp');
var jade = require('gulp-jade');
var merge = require('merge-stream');

gulp.task('jade', ['clean'], function (done) {

    var index = gulp.src('./sample/index.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./sample'));

    var views = gulp.src('./views/**/index.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./sample/views/'));

    return merge(views, index);
});
