var gulp = require("gulp");
var watch = require("gulp-watch");
var babel = require("gulp-babel");

gulp.task("default", defaultTask);

function defaultTask(done) {
  // place code for your default task here
  return watch("src/*", { ignoreInitial: false })
    .pipe(babel())
    .pipe(gulp.dest("lib"));
  done();
}
