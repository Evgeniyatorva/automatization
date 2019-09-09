const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify'); // compression JS
const rename = require('gulp-rename'); // rename file
const minifyCSS = require('gulp-clean-css'); //clean css
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');

const reload = browserSync.reload;

gulp.task('sass', function() {
  return gulp.src("src/scss/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.stream());
});

gulp.task('sass-build',  function () {
  return gulp.src('src/css/main.css')
  .pipe(minifyCSS())
  .pipe(rename(function (part) { 
    part.basename += ".min";
  }))
  .pipe(gulp.dest("src/css"))
})

gulp.task('scripts-build', function () {
  return gulp.src("src/js/main.js")
    .pipe(uglify()) // minification JS return filename.min.js
    .pipe(rename(function (part) { 
      part.basename += ".min";
    }))
    .pipe(gulp.dest("src/js"));    
})

gulp.task('image-build', function () {
  return gulp.src('src/img/**/*')
    .pipe(cache(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    })))
    .pipe(gulp.dest('build/img'))
    .pipe(reload({stream: true}));
})

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
        baseDir: "src"
    },
    port: 3000,
    notify: false
  });

  gulp.watch('src/js/**/*.js').on('change', reload);
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/*.html').on('change', reload);
});

gulp.task('moving-files', function(done) {
  // image moving in image-build task
  gulp.src(['src/css/**/*.css']).pipe(gulp.dest('build/css'));
  gulp.src(['src/js/**/*.js']).pipe(gulp.dest('build/js'));
  gulp.src(['src/fonts/**/*']).pipe(gulp.dest('build/fonts'));
  gulp.src(['src/*.html']).pipe(gulp.dest('build'));
  done()
})

// gulp start dev
gulp.task('watch', gulp.series('browser-sync'));

// build project
gulp.task('build', gulp.series('sass','sass-build', 'scripts-build', 'image-build', 'moving-files'));


// Use for clear cache
gulp.task('clear', function () {
  return cache.clearAll();
})