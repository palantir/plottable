'use strict';

module.exports = function (grunt, options) {
  return {
    options: {
      jshintrc: true
    },
    all: options.srcFiles
  };
};