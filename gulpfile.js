/* jshint node: true */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var gcc = require('gulp-closure-compiler');
var karma = require('karma').server;
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

var minimist = require('minimist');

var knownOptions = {
  string: ['browsers', 'maptalks', 'pattern'],
  boolean: 'coverage',
  alias: {
    'coverage': 'cov'
  },
  default: { browsers: 'PhantomJS', coverage: false, maptalks: '../../../engine-projects/engine-front' }
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

// paths to distribute
var js_dist_path = './dist/maptalks/v2/';
var css_dist_path = './dist/maptalks/v2/css/';
var img_dist_path = './dist/maptalks/v2/images/';
var lib_dist_path = './dist/maptalks/v2/lib/';

//paths to distribute to maptalks
var maptalks_dist_path;
var root_dist_path = options.maptalks;
if (root_dist_path) {
    maptalks_dist_path = root_dist_path+'/webroot/maptalks/v2/';
}

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
    .pipe(gulp.dest(css_dist_path))
    // Concatenate and minify styles
    .pipe($.csso());
    // .pipe($.sourcemaps.write())
});
//copy images
gulp.task('images', function () {
  return gulp.src('assets/images/**/*')
            .pipe(gulp.dest(img_dist_path));
});
//copy libs
gulp.task('lib', function () {
  return gulp.src('assets/lib/**/*')
            .pipe(gulp.dest(lib_dist_path));
});
//copy css styles
gulp.task('scripts', function () {
  var sources = require('./build/getFiles.js').getFiles();
  sources.unshift('build/header.js');
  sources.push('build/footer.js');
  return gulp.src(sources)
    .pipe($.concat('maptalks.js'))
    .pipe(gulp.dest(js_dist_path));
});
//compile and copy
gulp.task('compile',function () {
  var sources = require('./build/getFiles.js').getFiles();
  sources.unshift('build/header.js');
  sources.push('build/footer.js');
  return gulp.src(sources)
    .pipe($.concat('maptalks.js'))
    .pipe(gulp.dest(js_dist_path))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(js_dist_path))
    .pipe($.uglify({preserveComments: 'some'}))
    /*.pipe(gcc({
      compilerPath: 'build/compiler.jar',
      compilerFlags: {
        formatting: 'PRETTY_PRINT',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        // generate_exports: true,
        externs: []
        // language_in: 'ECMASCRIPT5'
      },
      maxBuffer: 10000,
      continueWithWarnings: true,
      fileName: 'maptalks.min.js'
    }))*/
    // Output files
    .pipe(gulp.dest(js_dist_path))
    .pipe($.gzip())
    .pipe(gulp.dest(js_dist_path));
});

gulp.task('clean', del.bind(null, [], {dot: true}));

gulp.task('build', ['clean'], function (done) {
  runSequence(
    ['styles','images'],
    ['compile'],
    // 'test',
    done);
});

//
gulp.task('dist',['build'],function() {
  if (!maptalks_dist_path) {
    return;
  }
  gulp.src(js_dist_path+'**/*')
    .pipe(gulp.dest(maptalks_dist_path));
});

gulp.task('connect', function() {
  connect.server({
    root: ['dist', '.'],
    port:20000,
    liveload:true
  });
});

gulp.task('reload', ['build'], function () {
  gulp.src(['./dist/**/*','./examples/**/*.html'])
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.js','assets/css/*.css','build/srcList.txt'], ['reload']);
});

gulp.task('watch-dev',['connect','watch']);
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
  if (options.pattern) {
    karmaConfig.client = {
      mocha: {
        grep: options.pattern
      }
    };
  }
  karma.start(karmaConfig, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', ['styles'], function (done) {
  var karmaConfig = {
    configFile: __dirname + '/karma.conf.js',
    browsers: browsers,
    singleRun: false
  };
  if (options.pattern) {
    karmaConfig.client = {
      mocha: {
        grep: options.pattern
      }
    };
  }
  karma.start(karmaConfig, done);
});


gulp.task('default', ['watch-dist']);
