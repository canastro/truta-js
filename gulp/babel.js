var gulp = require("gulp");
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('babel:sample', function() {
    browserify({
        entries: './index.js',
        debug: true
    })
    .transform(

        // We want to convert JSX to normal javascript
        babelify.configure({
    
            // load the runtime to be able to use Object.assign
            optional: ["runtime"]
        })
    )
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist/scripts'));
});