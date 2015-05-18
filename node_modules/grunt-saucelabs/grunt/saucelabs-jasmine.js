'use strict';

module.exports = function (grunt, options) {

  return {
    options: options.baseSaucelabsTaskOptions,
    succeeds: {
      options: {
        urls: ['http://127.0.0.1:9999/jasmine/succeeds.html'],
        testname: 'saucelabs-jasmine:succeeds'
      }
    },
    fails: {
      options: {
        urls: ['http://127.0.0.1:9999/jasmine/fails.html'],
        testname: 'saucelabs-jasmine:fails',
        onTestComplete: options.negateResult
      }
    }
  };
};
