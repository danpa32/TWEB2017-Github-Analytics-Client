const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const ghPages = require('gulp-gh-pages');

const plugins = require('gulp-load-plugins')();

const dev = true;

const { reload } = browserSync;

const distDir = "dist";

gulp.task('styles', () => gulp.src('src/css/**/*.css')
  .pipe(gulp.dest(`${distDir}/css`))
  .pipe(reload({ stream: true })));

function lint(files) {
  return gulp.src(files)
    .pipe(plugins.eslint({ fix: true }))
    .pipe(plugins.eslint.format());
}

gulp.task('lint', () =>
  lint('src/js/**/*.js')
    .pipe(gulp.dest('src')));

gulp.task('scripts', ['lint'], () => gulp.src('src/js/**/*.js')
  .pipe(plugins.plumber())
  .pipe(plugins.if(dev, plugins.sourcemaps.init()))
  .pipe(plugins.babel())
  .pipe(plugins.if(dev, plugins.sourcemaps.write('.')))
  .pipe(gulp.dest(`${distDir}/js`))
  .pipe(reload({ stream: true })));

gulp.task('vendors', () => gulp.src('src/vendor/**/*')
  .pipe(gulp.dest(`${distDir}/vendor`))
  .pipe(reload({ stream: true })));

gulp.task('data', () => gulp.src('src/**/*.json')
  .pipe(gulp.dest(`${distDir}`))
  .pipe(reload({ stream: true })));

gulp.task('html', ['styles', 'scripts'], () => gulp.src('src/**/*.html')
  .pipe(gulp.dest(`${distDir}`))
  .pipe(reload({ stream: true })));

gulp.task('clean', del.bind(null, ['.tmp']));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'vendors', 'data', 'html'], () => {
    browserSync.init({
      notify: false,
      port: 8080,
      server: {
        baseDir: [`${distDir}`, 'src'],
      },
    });

    // Reloads the browser whenever HTML or CSS files change
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/css/**/*.css', ['styles']);
    gulp.watch('src/js/**/*.js', ['scripts']);
    gulp.watch('src/**/*.json', ['data']);
    gulp.watch('src/vendor/**/*', ['vendors']);
  });
});

gulp.task('publish', () => gulp.src(`${distDir}/**/*`)
  .pipe(ghPages()));

gulp.task('deploy', () => {
  runSequence(['clean'], ['styles', 'scripts', 'vendors', 'html'], ['publish']);
});
