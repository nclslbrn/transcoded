var gulp = require('gulp');
var sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css');
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    del = require('del'),
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    pug = require('gulp-pug'),
    ignore = require('gulp-ignore'),
    zip = require('gulp-zip'),
    browserSync = require('browser-sync'),
    require = require('require-dir'),
    reload = browserSync.reload;
// gulp deploy
var deployFTP = require('./gulp-tasks');

var COMPATIBILITY = [
  'last 2 versions',
  'ie >= 9',
  'Android >= 2.3'
];

var directory = {
  dev : {
    styles: 'dev/sass/*.scss',
    scripts: 'dev/javascript/**.js',
    images: 'dev/images/*',
    views: {
      watch: 'dev/views/**/*.pug',
      do: 'dev/views/*.pug'
    },
    lib: 'lib/*',
    data: 'data/**/*',
  },
  dist : {
    styles: 'dist/stylesheet/',
    scripts: 'dist/javascript/',
    images: 'dist/images/',
    views: 'dist/',
    lib: 'dist/javascript/lib',
    data: 'dist/data/'
  }
}


gulp.task('styles', function() {
  return gulp
    .src(directory.dev.styles)
    //.pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true}))
    //.pipe(sourcemaps.write({includeContent: false, sourceRoot: '.'}))
    //.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({browsers: COMPATIBILITY, cascade: false}))
    .pipe(gulp.dest(directory.dist.styles))
    .pipe(rename({suffix: '.min'}))
  //  .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(gulp.dest(directory.dist.styles))
    .pipe(notify({ message: 'SASS processing and minifying complete' }));
});

gulp.task('scripts', function() {
  return gulp
    .src(directory.dev.scripts)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(directory.dist.scripts))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify().on('error', function(e){ console.log(e); }))
    .pipe(gulp.dest(directory.dist.scripts))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src(directory.dev.images)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(directory.dist.images))
    .pipe(notify({ message: 'Images task complete' }));
});


gulp.task('views', function buildHTML() {
  return gulp.src(directory.dev.views.do)
    .pipe(pug())
    .pipe(gulp.dest(directory.dist.views))
    .pipe(notify({ message: 'Views task complete' }));
});

gulp.task('sync', function() {
    //watch files
    var files = [
        directory.dist.styles,
        directory.dist.scripts,
        directory.dist.images,
        'dist/index.html'
    ];
    //initialize browsersync
    browserSync.init(files, {
        //browsersync with a php server
        proxy: "p5.sketch/infrared-spectrum-reinterpretation/dist",
        port: 8080,
        notify: true,
        injectChanges: true
    });
});

gulp.task('watch', ['sync'], function () {
    gulp.watch(directory.dev.styles, ['styles']);
    gulp.watch(directory.dev.scripts, ['scripts']);
    gulp.watch(directory.dev.images, ['images']);
    gulp.watch(directory.dev.views.watch, ['views']);
    gulp.watch(directory.dev.lib, ['build']);
    gulp.watch(directory.dev.data, ['copyData']);
    gulp.watch('**/.DS_Store', ['remove']);
    gulp.watch('index.html');
});


gulp.task('clean', function() {
  del([directory.dist.styles, directory.dist.scripts, directory.dist.images])
  notify({ message: 'Clean task complete' });
});

gulp.task('remove', function() {
  del('**/.DS_Store')
  notify({ message: 'Clean task complete' });
});

gulp.task('build', function() {

  gulp.src(directory.dev.lib)
  	.pipe(gulp.dest(directory.dist.lib))
  	.pipe(notify({ message: 'Lib added to dist', onLast: true }));

});

gulp.task('copyData', function() {

  gulp.src(directory.dev.data)
  	.pipe(gulp.dest(directory.dist.data))
  	.pipe(notify({ message: 'Data file added to dist', onLast: true }));

});
gulp.task('default',['watch']);
