'use strict';

module.exports = function (grunt, options) {

  return {
    options: options.baseSaucelabsTaskOptions,
    succeeds: {
      options: {
        urls: ['http://127.0.0.1:9999/qunit/index.html'],
        testname: 'saucelabs-qunit:succeeds'
      }
    },
    fails: {
      options: {
        urls: ['http://127.0.0.1:9999/qunit/fails.html'],
        testname: 'saucelabs-qunit:fails',
        onTestComplete: options.negateResult
      }
    },
    error: {
      // Tests whether Sauce Labs 'errors' are handled. Sauce Labs errors are those where
      // the tests status is displayed as 'Finished' on the Sauce Labs dashboard, and the
      // result property (when the job is queried via the REST API) is null.
      options: {
        urls: ['http://127.0.0.1:9999/qunit/error.html'],
        testname: 'saucelabs-qunit:error',
        onTestComplete: options.negateResult
      }
    }
  };
};
