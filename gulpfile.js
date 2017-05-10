const gulp = require('gulp'),
watch = require('gulp-watch'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
cssvars = require('postcss-simple-vars'),
nested = require('postcss-nested'),
mixins = require('postcss-mixins'),
browserSync = require('browser-sync').create(),
uglify = require ('gulp-uglify'),
cssNano = require('gulp-cssnano'),
imagemin = require('gulp-imagemin'),
imageminJPEG = require('imagemin-jpeg-recompress'),
cssImport = require('postcss-import'),
usemin = require('gulp-usemin'),
babel = require('gulp-babel'),
es2015 = require('babel-preset-es2015'),
del = require('del'),
debug = require('gulp-debug'),
rev = require('gulp-rev'),
beautify = require('gulp-jsbeautify');

// Default task that runs on 'Gulp' command

gulp.task('default', ['cssInject', 'compilecss', 'watch']);


gulp.task('watch', function(){
    browserSync.init({
    server: {
      baseDir: "production"
    }
  });
});


// Watch CSS for changes and inject compiled and minified CSS

watch('production/styles.css', function(){
gulp.start('cssInject');
});

// Watch JS for changes and beautify

//watch('app/assets/scripts/*.js', function(){
//gulp.start('beautify');
//});

// JS beautifer

//gulp.task('beautify', function() {
  //return gulp.src('app/assets/scripts/app.js')
  //  .pipe(beautify({indentSize: 2}))
   // .pipe(gulp.dest('app/assets/scripts/app.js'));
//});

// Live reload browserSync

watch('production/index.html', function(){
  browserSync.reload();
});

//watch('production/*.js', function(){
  //browserSync.reload();
//});

// Compile CSS
gulp.task('compilecss', function(){

  return gulp.src('production/styles.css')
  .pipe(debug())
  .pipe(postcss([cssImport, autoprefixer, mixins, nested, cssvars]))
  .pipe(gulp.dest('production/temp/styles'))

});

// Injects compiled CSS into page

gulp.task('cssInject', ['compilecss'], function(){
  return gulp.src('production/styles.css')
  .pipe(browserSync.stream());

});

// Optimise images
gulp.task('optimiseImages', function(){
return gulp.src('production/assets/**/*')
.pipe(imagemin({
  progressive: true,
  interlaced: true,
  multipass: true
}))
.pipe(gulp.dest('dist/assets'));
});

// Delete Dist folder before recreating
gulp.task('deleteDistFolder', function(){
  return del('./dist');
})

gulp.task('babel', () => {
    return gulp.src('production/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('production/temp/scripts/babel'));
});

// Minify Javascript
gulp.task('compressScripts', ['babel', 'deleteDistFolder'], function(){
 return gulp.src('production/temp/scripts/babel/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('dist'));
});

// Grab any other files to be included in final build

gulp.task('copyGeneralFiles', ['deleteDistFolder'], function() {
  var pathsToCopy = [
    './production/**/*',
    '!./production/index.html',
    '!./production/assets/**',
    '!./production/styles.css',
    '!./production/styles/base',
    '!./production/temp',
    '!./production/temp/**'
  ]

  return gulp.src(pathsToCopy)
    .pipe(gulp.dest("./dist"));
});

// Build final

gulp.task('build', ['deleteDistFolder', 'copyGeneralFiles', 'optimiseImages', 'usemin']);

// Usemin

gulp.task('usemin', ['deleteDistFolder', 'compilecss'], function(){
  return gulp.src('production/index.html')
  .pipe(usemin({
    css: [function(){return rev()},
    function(){return cssNano()}],
    js: [function() {return rev()}, function() {return uglify()
      .pipe(debug())
    }]
  }))

  .pipe(gulp.dest('dist'));
});

// Preview final build in browserSync
gulp.task('testBuild', function() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "dist"
    }
  });
});