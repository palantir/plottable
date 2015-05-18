'use strict';

module.exports = function (grunt, options) {

  return {
    options: options.baseSaucelabsTaskOptions,
    succeeds: {
      options: {
        urls: ['http://127.0.0.1:9999/yui/index.html'],
        testname: 'saucelabs-yui:succeeds'
      }
    },
    fails: {
      options: {
        urls: ['http://127.0.0.1:9999/yui/fails.html'],
        testname: 'saucelabs-yui:fails',
        onTestComplete: options.negateResult
      }
    }
  };
};
