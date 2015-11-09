// -*- js2-basic-offset: 2; js-indent-level: 2 -*-
/* jshint node: true */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var karma = require('karma').server;
var connect = require('gulp-connect');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var revCollector = require('gulp-rev-collector');

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
  var lname = name.toLowerCase();
  if (lname.indexOf('phantom') === 0) {
    return 'PhantomJS';
  }
  if (lname[0] === 'i') {
    return 'IE' + lname.substr(2);
  } else {
    return lname[0].toUpperCase() + lname.substr(1);
  }
});

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

gulp.task('images', function () {
  return gulp.src('assets/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('libs', function () {
  return gulp.src('assets/lib/**/*.js')
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('plugins', function () {
  return gulp.src('Plugins/**/*.*')
    .pipe(gulp.dest('dist/Plugins'));
});

gulp.task('examples', function () {
  return gulp.src(['examples/**/*.*','!examples/replace.json'])
    .pipe(gulp.dest('dist/examples'));
});

gulp.task('exportExamples', ['examples'], function () {
  return gulp.src(['examples/replace.json', 'dist/examples/**/*.html'])
    .pipe(revCollector())
    .pipe(gulp.dest('dist/examples'));
});

var shell = require('gulp-shell');
gulp.task('generateDocs', ['build'], function () {
    console.log("[JSDuck] Creating documentation");
    return gulp.src('')
        .pipe(shell(['jsduck']));
});

gulp.task('copyIcon', ['generateDocs'], function () {
  return gulp.src('docs/theme/*.ico')
         .pipe(gulp.dest('dist/docs/'));
});

gulp.task('docs', ['generateDocs','copyIcon'], function () {
  return gulp.src('docs/theme/**/*.*')
         .pipe(gulp.dest('dist/docs/theme'));
});

gulp.task('default', ['docs']);

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
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.concat('maptalks.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.minifyCss())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function () {
  var sources = require('./build/getFiles.js').getFiles();
  sources.unshift('build/header.js');
  sources.push('build/footer.js');
  return gulp.src(sources)
    .pipe($.concat('maptalks.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('dist'))
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist/*', '!dist'], {dot: true}));

gulp.task('build', ['clean'], function (done) {
  runSequence(
    'styles',
    ['scripts', 'images', 'libs', 'plugins'],
    'examples',
    done);
});

gulp.task('dist', ['build'], function () {
  gulp.src(['dist/*.js'])
    .pipe(gulp.dest(maptalks_dist_path));
});

gulp.task('archive', ['build'], function () {
  return gulp.src(['dist/**/*'])
    .pipe($.tar('maptalks-js-sdk.tar'))
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['build'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: 'dist'
    },
    startPath: '/examples/index.html'
  });

  gulp.watch(['src/**/*.js', 'build/srcList.txt'], ['scripts', reload]);
  gulp.watch(['assets/css**/*.css'], ['styles', reload]);
  gulp.watch(['examples/**/*'], ['examples', reload]);
});

gulp.task('connect', function() {
  connect.server({
    root: ['./dist'],
    port: 20000,
    liveload: true
  });
});

gulp.task('reload', ['build'], function () {
  gulp.src(['./dist/**/*'])
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch([
    'src/**/*.js',
    'examples/**/*',
    'assets/css/*.css',
    'build/srcList.txt'
  ], ['reload']);
});

gulp.task('server',['build','connect','watch']);

/**
 * Run test for minified scripts once and exit
 */
gulp.task('test:dist', ['styles', 'scripts'], function (done) {
  var files = [
    'dist/maptalks.js',
    'test/**/*.js',
    {pattern: 'dist/**/*.css', watched: true, included: false, served: true},
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
    /*karmaConfig.coverageReporter = {
      type : 'html',
      dir : 'coverage/'
    };*/
    karmaConfig.coverageReporter = {
      type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
      dir: 'coverage/'
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

var coveralls = require('gulp-coveralls');
gulp.task('coveralls', function () {
  if (!process.env.CI) return;
  return gulp.src('./coverage/**/lcov.info')
    .pipe(coveralls());
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


gulp.task('default', ['server']);
