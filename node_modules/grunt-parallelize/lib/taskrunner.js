'use strict';

var _ = require('lodash');
var path = require('path');

module.exports = function(grunt, childFilesSrcOption, task, target) {
  var childFilesSrc = childFilesSrcOption.split(path.delimiter);
  var configPath = [task, target];
  var config = grunt.config(configPath);
  var kindOf = grunt.util.kindOf;
  var type = kindOf(config);
  if (type === 'array') {
    grunt.config(configPath, childFilesSrc);
  } else if (type === 'object') {
    if (_.contains(['string', 'array'], kindOf(config.src))) {
      // Compact Format
      grunt.config(configPath.concat('src'), childFilesSrc);
    } else if ('array' === kindOf(config.files)) {
      // Files Array Format
      grunt.config(configPath.concat('files'), [{src: childFilesSrc}]);
    } else if ('object' === kindOf(config.files)) {
      // Files Object Format
      throw new Error('The config of ' + task + ' is Files Object Format.');
    } else {
      throw new Error('The config of ' + task + ' is not supported.');
    }
  } else {
    throw new Error('The config of ' + task + ' is not supported.');
  }
  grunt.task.run(configPath.join(':'));
};
