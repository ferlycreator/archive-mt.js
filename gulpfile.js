var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var gcc = require('gulp-closure-compiler');
var karma = require('karma').server;

//--------------ATTENTION HERE!!------------------
//  set variables your_*_path to your own to dist.
//  if not, default dist to ./dist/
//------------------------------------------------
var your_engine_front_path = '../MapTalks/engine-front/';
var your_css_dist_path = your_engine_front_path+'webroot/css/';
var your_js_dist_path = your_engine_front_path+'webroot/js/build/v2/';

var minimist = require('minimist');

var knownOptions = {
  string: 'browsers',
  boolean: 'coverage',
  alias: {
    'coverage': 'cov'
  },
  default: { browsers: 'PhantomJS', coverage: false }
};

var options = minimist(process.argv.slice(2), knownOptions);
var browsers = options.browsers.split(',');
browsers = browsers.map(function(name) {
  if (name === 'PhantomJS') { return name; }
  var lname = name.toLowerCase();
  if (lname[0] === 'i') {
    return 'IE' + lname.substr(2);
  } else {
    return lname[0].toUpperCase() + lname.substr(1);
  }
});

gulp.task('jshint', function () {
  return gulp.src('src/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('styles', function () {

  var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src('assets/css/**/*.css')
    // .pipe($.sourcemaps.init())
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('dist'))
    // Concatenate and minify styles
    .pipe($.csso());
    // .pipe($.sourcemaps.write())    
});

gulp.task('scripts', function () {
  var sources = require('./build/getFiles.js').getFiles();
  sources.unshift('build/header.js');
  sources.push('build/footer.js');
  return gulp.src(sources)
    .pipe($.concat('maptalks.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compile',function () {
  var sources = require('./build/getFiles.js').getFiles();
  sources.unshift('build/header.js');
  sources.push('build/footer.js');
  return gulp.src(sources)
    .pipe($.concat('maptalks.js'))
    .pipe(gulp.dest('./dist/'))
    // .pipe($.uglify({preserveComments: 'some'}))
    .pipe(gcc({
      compilerPath: 'build/compiler.jar',
      compilerFlags: {
        formatting: 'PRETTY_PRINT',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        externs: []
        // language_in: 'ECMASCRIPT5'
      },
      maxBuffer: 10000,
      continueWithWarnings: true,
      fileName: 'maptalks.min.js'
    }))
    // Output files
    .pipe(gulp.dest('dist'))
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, [], {dot: true}));

gulp.task('build', ['clean'], function (done) {
  runSequence(
    'styles',
    ['jshint', 'scripts'],
    done);
});

//
gulp.task('dist',['build'],function() {
  var css_path = your_css_dist_path;
  var js_path = your_js_dist_path;
  if (!css_path) {
    css_path = './dist/';
  }
  if (!js_path) {
    js_path = './dist/';
  }
  gulp.src('./dist/*.css')    
    .pipe(gulp.dest(css_path));
  gulp.src('./dist/*.css.gz')    
    .pipe(gulp.dest(css_path));
  gulp.src('./dist/*.js')    
    .pipe(gulp.dest(js_path));
    gulp.src('./dist/*.js.gz')    
    .pipe(gulp.dest(js_path));
});

gulp.task('watch-dist', function () {
   gulp.watch(['src/**/*.js','build/srcList.txt'], ['dist']);
});

/**
 * Run test for minified scripts once and exit
 */
gulp.task('test:dist', ['styles', 'scripts'], function (done) {
  var files = [
    '.tmp/maptalks.js',
    'test/**/*.js',
    {pattern: '.tmp/**/*.css', watched: true, included: false, served: true},
    {pattern: 'assets/images/**/*.png', watched: false, included: false, served: true}
  ];
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    browsers: browsers,
    files: files,
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test', ['styles'], function (done) {
  var karmaConfig = {
    configFile: __dirname + '/karma.conf.js',
    browsers: browsers,
    singleRun: true
  };
  if (options.coverage) {
    karmaConfig.preprocessors = {
      'src/**/*.js': 'coverage'
    };
    karmaConfig.coverageReporter = {
      type : 'html',
      dir : 'coverage/'
    };
    karmaConfig.reporters = ['coverage'];
  }
  karma.start(karmaConfig, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', ['styles'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    browsers: browsers,
    singleRun: false
  }, done);
});

gulp.task('default', ['watch-dist']);
