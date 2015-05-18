'use strict';

module.exports = function (grunt) {
  var Q = require('q');
  var SauceTunnel = require('sauce-tunnel');
  var TestRunner = require('../src/TestRunner')(grunt);

  Q.longStackSupport = true;

  function reportProgress(notification) {
    switch (notification.type) {
    case 'tunnelOpen':
      grunt.log.writeln('=> Starting Tunnel to Sauce Labs'.inverse.bold);
      break;
    case 'tunnelOpened':
      grunt.log.ok('Connected to Saucelabs');
      break;
    case 'tunnelClose':
      grunt.log.writeln('=> Stopping Tunnel to Sauce Labs'.inverse.bold);
      break;
    case 'tunnelEvent':
      if (notification.verbose) {
        grunt.verbose[notification.method](notification.text);
      } else {
        grunt.log[notification.method](notification.text);
      }
      break;
    case 'jobStarted':
      grunt.log.writeln('\n', notification.startedJobs, '/', notification.numberOfJobs, 'tests started');
      break;
    case 'jobCompleted':
      grunt.log.subhead('\nTested %s', notification.url);
      grunt.log.writeln('Platform: %s', notification.platform);

      if (notification.tunnelId && unsupportedPort(notification.url)) {
        grunt.log.writeln('Warning: This url might use a port that is not proxied by Sauce Connect.'.yellow);
      }

      grunt.log.writeln('Passed: %s', notification.passed);
      grunt.log.writeln('Url %s', notification.jobUrl);
      break;
    case 'testCompleted':
      grunt.log[notification.passed ? 'ok' : 'error']('All tests completed with status %s', notification.passed);
      break;
    case 'retrying':
      grunt.log.writeln('Timed out, retrying');
      break;
    default:
      grunt.log.error('Unexpected notification type');
    }
  }

  function createTunnel(arg) {
    var tunnel;

    reportProgress({
      type: 'tunnelOpen'
    });

    tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, true, ['-P', '0'].concat(arg.tunnelArgs));

    ['write', 'writeln', 'error', 'ok', 'debug'].forEach(function (method) {
      tunnel.on('log:' + method, function (text) {
        reportProgress({
          type: 'tunnelEvent',
          verbose: false,
          method: method,
          text: text
        });
      });
      tunnel.on('verbose:' + method, function (text) {
        reportProgress({
          type: 'tunnelEvent',
          verbose: true,
          method: method,
          text: text
        });
      });
    });

    return tunnel;
  }

  function runTask(arg, framework, callback) {
    var tunnel;

    Q
      .fcall(function () {
        var deferred;

        if (arg.tunneled) {
          deferred = Q.defer();

          tunnel = createTunnel(arg);
          tunnel.start(function (succeeded) {
            if (!succeeded) {
              deferred.reject('Could not create tunnel to Sauce Labs');
            } else {
              reportProgress({
                type: 'tunnelOpened'
              });

              deferred.resolve();
            }
          });
          return deferred.promise;
        }
      })
      .then(function () {
        var testRunner = new TestRunner(arg, framework, reportProgress);
        return testRunner.runTests();
      })
      .fin(function () {
        var deferred;

        if (tunnel) {
          deferred = Q.defer();

          reportProgress({
            type: 'tunnelClose'
          });

          tunnel.stop(function () {
            deferred.resolve();
          });

          return deferred.promise;
        }
      })
      .then(
        function (passed) {
          callback(passed);
        },
        function (error) {
          grunt.log.error(error.stack || error.toString());
          callback(false);
        }
      )
      .done();
  }

  function unsupportedPort(url) {
    // Not all ports are proxied by Sauce Connect. List of supported ports is
    // available at https://saucelabs.com/docs/connect#localhost
    var portRegExp = /:(\d+)\//;
    var matches = portRegExp.exec(url);
    var port = matches ? parseInt(matches[1], 10) : null;
    var supportedPorts = [
        80, 443, 888, 2000, 2001, 2020, 2109, 2222, 2310, 3000, 3001, 3030,
        3210, 3333, 4000, 4001, 4040, 4321, 4502, 4503, 4567, 5000, 5001, 5050, 5555, 5432, 6000,
        6001, 6060, 6666, 6543, 7000, 7070, 7774, 7777, 8000, 8001, 8003, 8031, 8080, 8081, 8765,
        8888, 9000, 9001, 9080, 9090, 9876, 9877, 9999, 49221, 55001
      ];

    if (port) {
      return supportedPorts.indexOf(port) === -1;
    }

    return false;
  }

  var defaults = {
    username: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    tunneled: true,
    identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
    pollInterval: 1000 * 2,
    statusCheckAttempts: 90,
    testname: '',
    browsers: [{}],
    tunnelArgs: [],
    sauceConfig: {},
    maxRetries: 0
  };

  grunt.registerMultiTask('saucelabs-jasmine', 'Run Jasmine test cases using Sauce Labs browsers', function () {
    var done = this.async();
    var arg = this.options(defaults);

    runTask(arg, 'jasmine', done);
  });

  grunt.registerMultiTask('saucelabs-qunit', 'Run Qunit test cases using Sauce Labs browsers', function () {
    var done = this.async();
    var arg = this.options(defaults);

    runTask(arg, 'qunit', done);
  });

  grunt.registerMultiTask('saucelabs-yui', 'Run YUI test cases using Sauce Labs browsers', function () {
    var done = this.async();
    var arg = this.options(defaults);

    runTask(arg, 'YUI Test', done);
  });

  grunt.registerMultiTask('saucelabs-mocha', 'Run Mocha test cases using Sauce Labs browsers', function () {
    var done = this.async();
    var arg = this.options(defaults);

    runTask(arg, 'mocha', done);
  });

  grunt.registerMultiTask('saucelabs-custom', 'Run custom test cases using Sauce Labs browsers', function () {
    var done = this.async();
    var arg = this.options(defaults);

    runTask(arg, 'custom', done);
  });
};
