'use strict';

module.exports = function (grunt, options) {

  var Q = require('q');
  var utils = require('../src/utils')(grunt);

  /**
  * Updates a job's attributes.
  *
  * @param {String} jobId - Job ID.
  * @param {Object} attributes - The attributes to update.
  * @returns {Object} - A promise which will eventually be resolved after the job is
  *   updated.
  */
  function updateJob(jobId, attributes) {
    var user = process.env.SAUCE_USERNAME;
    var pass = process.env.SAUCE_ACCESS_KEY;

    return utils
    .makeRequest({
      method: 'PUT',
      url: ['https://saucelabs.com/rest/v1', user, 'jobs', jobId].join('/'),
      auth: { user: user, pass: pass },
      json: attributes
    });
  }

  return {
    options: options.baseSaucelabsTaskOptions,
    'tunnel-test': {
      options: {
        urls: ['http://127.0.0.1:9999/custom/succeeds.html'],
        testname: 'saucelabs-custom:tunnel-test',
        tunneled: true
      }
    },
    succeeds: {
      options: {
        urls: ['http://127.0.0.1:9999/custom/succeeds.html'],
        testname: 'saucelabs-custom:succeeds'
      }
    },
    fails: {
      options: {
        urls: ['http://127.0.0.1:9999/custom/fails.html'],
        testname: 'saucelabs-custom:fails',
        onTestComplete: options.negateResult
      }
    },
    'callback-succeeds': {
      options: {
        urls: ['http://127.0.0.1:9999/custom/succeeds.html'],
        testname: 'saucelabs-custom:callback-succeeds',
        onTestComplete: function (result, callback) { callback(null, result.passed); }
      }
    },
    'callback-async-succeeds': {
      options: {
        urls: ['http://127.0.0.1:9999/custom/succeeds.html'],
        testname: 'saucelabs-custom:callback-async-succeeds',
        onTestComplete: function (result, callback) { return Q.delay(3000).thenResolve(result.passed).nodeify(callback); }
      }
    },
    throttled: {
      options: {
        browsers: [
          { browserName: 'firefox', version: '19', platform: 'XP' },
          { browserName: 'googlechrome', platform: 'XP' },
          { browserName: 'googlechrome', platform: 'linux' },
          { browserName: 'internet explorer', platform: 'WIN8', version: '10' },
          { browserName: 'internet explorer', platform: 'VISTA', version: '9' }
        ],
        urls: [
          'http://127.0.0.1:9999/custom/succeeds.html',
          'http://127.0.0.1:9999/custom/succeeds2.html',
          'http://127.0.0.1:9999/custom/succeeds3.html'
        ],
        throttled: 3,
        testname: 'saucelabs-custom:throttled'
      }
    },
    timeout: {
      options: {
        urls: ['http://127.0.0.1:9999/custom/timeout.html'],
        testname: 'saucelabs-custom:timeout',
        'max-duration': 3,
        maxRetries: 2,
        onTestComplete: function (result, callback) {
          if (result.passed) {
            return Q(false).nodeify(callback);
          }

          // can't automate this without an ugly hack, it must be done manually
          grunt.log.writeln('Please check that 2 retrying attempts were logged to the console.');

          return updateJob(result.job_id, { passed: true })
            .thenResolve(true)
            .nodeify(callback);
        }
      }
    }
  };
};
