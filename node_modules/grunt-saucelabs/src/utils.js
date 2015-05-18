'use strict';

module.exports = function (grunt) {
  var q = require('q');
  var request = require('requestretry');
  var WrapperError = require('./WrapperError');

  q.longStackSupport = true;

  /**
   * Constructs a function that proxies to promiseFactory
   * limiting the count of promises that can run simultaneously.
   * Copied from https://gist.github.com/gaearon/7930162
   *
   * @param promiseFactory function that returns promises.
   * @param limit how many promises are allowed to be running at the same time.
   * @returns function that returns a promise that eventually proxies to promiseFactory.
   */
  function limitConcurrency(promiseFactory, limit) {
    var running = 0;
    var semaphore;

    function scheduleNextJob() {
      if (running < limit) {
        running += 1;
        return q();
      }

      if (!semaphore) {
        semaphore = q.defer();
      }

      return semaphore.promise
        .fin(scheduleNextJob);
    }

    function processScheduledJobs() {
      running -= 1;

      if (semaphore && running < limit) {
        semaphore.resolve();
        semaphore = null;
      }
    }

    return function () {
      var _this = this;
      var args = arguments;

      function runJob() {
        return promiseFactory.apply(_this, args);
      }

      return scheduleNextJob()
        .then(runJob)
        .fin(processScheduledJobs);
    };
  }

  /**
   * Custom retry strategy for the requestretry package.
   *
   * @param  {Null | Object} err
   * @param  {Object} response
   * @return {Boolean} - true if the request should be retried
   */
  function loggingRetryStrategy(err /*, response*/) {
    if (err && err.code === 'ECONNRESET') {
      grunt.verbose.writeln('Transient network error (' + err.code + ')');
      return true;
    }
    return false;
  }

  /**
   * Wraps the request call, converts it to a promise. Also formats the errors messages.
   *
   * @param {Object} params - request's parameters object.
   * @returns {Object} - A promise which will eventually be resolved with the response's
   *   body.
   */
  function makeRequest(params) {
    params.retryStrategy = loggingRetryStrategy;
    return q
      .nfcall(request, params)
      .then(function (result) {
        var response = result[0];
        var body = result[1];

        if (response.statusCode !== 200) {
          throw new Error('HTTP error (' + response.statusCode + ')');
        }

        return body;
      })
      .fail(function (error) {
        throw new WrapperError([
          params.method,
          params.url,
          'failed.'
        ].join(' '), error);
      });
  }

  return {
    limitConcurrency: limitConcurrency,
    makeRequest: makeRequest
  };
};
