var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function (cb) {
    del([
        'dist/**/*',
        'sample/app/*.js',
        'sample/**/*.html'
    ], cb);
});
