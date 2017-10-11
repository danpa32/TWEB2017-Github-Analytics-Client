const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const pkg = require('./package.json');
const del = require('del');
const runSequence = require('run-sequence');
const ghPages = require('gulp-gh-pages');

const plugins = require('gulp-load-plugins')();

let dev = true;

// Dev task with browserSync
gulp.task('dev', ['browserSync'], function() {
  // Reloads the browser whenever HTML or CSS files change
  gulp.watch('src/**/*.css', browserSync.reload);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/**/*.js', browserSync.reload);
});

const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('src/css/**/*.css')
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(plugins.plumber())
    .pipe(plugins.if(dev, plugins.sourcemaps.init()))
    .pipe(plugins.babel())
    .pipe(plugins.if(dev, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({stream: true}));
});

gulp.task('vendors', () => {
  return gulp.src('src/vendor/**/*')
    .pipe(gulp.dest('.tmp/vendor'))
    .pipe(reload({stream: true}));
});

gulp.task('data', () => {
  return gulp.src('src/**/*.json')
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('clean', del.bind(null, ['.tmp']));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'vendors', 'data', 'html'], () => {
    browserSync.init({
      notify: false,
      port: 8080,
      server: {
        baseDir: ['.tmp', 'src']
      }
    });

    // Reloads the browser whenever HTML or CSS files change
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/css/**/*.css', ['styles']);
    gulp.watch('src/js/**/*.js', ['scripts']);
    gulp.watch('src/**/*.json', ['data']);
    gulp.watch('src/vendor/**/*', ['vendors']);
  });
});

gulp.task('publish', () => {
  return gulp.src('.tmp/**/*')
    .pipe(ghPages());
});

gulp.task('deploy', () => {
  runSequence(['clean'], ['styles', 'scripts', 'vendors', 'data', 'html'], ['publish']);
});
