'use strict';

module.exports = function (grunt, options) {
  return {
    options: {
      username: process.env.SAUCE_USERNAME,
      key: process.env.SAUCE_ACCESS_KEY,
      identifier: options.tunnelId
    },
    server: {}
  };
};