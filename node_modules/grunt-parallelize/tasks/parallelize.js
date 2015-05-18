/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */

'use strict';

var Parallelizer = require('../lib/parallelizer');
var taskRunner = require('../lib/taskrunner');
var TargetExecutor = require('../lib/targetexecutor');
var toBeKilled = [];

module.exports = function(grunt) {
  grunt.registerMultiTask('parallelize', 'Parallelize your task.', function() {
    var args = this.nameArgs.split(':');
    var task = args[1];
    var target = args[2];
    if (args.length === 1) {
      throw new Error('grunt append the task name automatically');
    } else if (args.length === 2) {
      // grunt parallelize:task
      var executor = new TargetExecutor();
      toBeKilled.push(executor);
      executor.exec(grunt, this.data, task, this.async());
    } else {
      var childFilesSrcOption = grunt.option('grunt-parallelize-child-filesSrc');
      if (childFilesSrcOption) {
        // this is spawned child process
        taskRunner(grunt, childFilesSrcOption, task, target);
      } else {
        var parallelizer = new Parallelizer(grunt, this);
        toBeKilled.push(parallelizer);
        parallelizer.exec(task, target);
      }
    }
  });
};

process.on('exit', function() {
  toBeKilled.forEach(function(item) {
    item.kill();
  });
});
