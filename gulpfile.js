var gulp = require('gulp');
var babel = require("gulp-babel");

gulp.task('default', defaultTask);

function defaultTask(done) {
  // place code for your default task here
  return gulp.src("src/*")
    .pipe(babel())
    .pipe(gulp.dest("lib"));
  done();
}