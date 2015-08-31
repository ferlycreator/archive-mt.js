// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-05-27 using
// generator-karma 1.0.0

/* jshint node: true */

module.exports = function(config) {
  'use strict';

  var srcFiles = require(__dirname + '/build/getFiles.js').getFiles();
  var files = srcFiles.concat([
    // 'test/geometry/*.js',
    'test/**/*.js',
    {pattern: 'assets/css/**/*.css', watched: true, included: false, served: true},
    {pattern: 'assets/images/**/*.png', watched: false, included: false, served: true},
    {pattern: 'assets/images/**/*.gif', watched: false, included: false, served: true}
  ]);

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '',

    proxies: {
      '/engine/': '/base/assets/',
      '/engine/css/controls.min.css': '/base/assets/css/controls.css'
    },

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'browserify',
      'mocha',
      'expect',
      'sinon',
      'happen',
      'jquery-1.7.2'
    ],

    // list of files / patterns to load in the browser
    files: files,

    // list of files / patterns to exclude
    exclude: [
    ],

    preprocessors: {
      //'src/**/*.js': 'coverage',
      'test/**/*.js': [ 'browserify' ] //Mention path as per your test js folder
    },

    // coverageReporter: {
    //   type: 'html',
    //   dir: 'coverage',
    // },

    reporters: ['spec'],

    // web server port
    port: 12345,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-ie-launcher',
      'karma-coverage',
      'karma-mocha',
      'karma-expect',
      'karma-sinon-ie',
      'karma-happen',
      'karma-jquery',
      'karma-browserify'
    ],

    customLaunchers: {
      IE10: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE10'
      },
      IE9: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE9'
      },
      IE8: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE8'
      },
      IE7: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE7'
      }
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
