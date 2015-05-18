'use strict';

var lpad = require('lpad');
var path = require('path');
var util = require('util');
var async = require('async');
var _ = require('lodash');

function Parallelizer(grunt, task) {
  this.grunt_ = grunt;
  this.task_ = task;
  this.cpCache_ = [];
}

Parallelizer.prototype.kill = function() {
  this.cpCache_.forEach(function(el) {
    el.kill();
  });
};

Parallelizer.prototype.exec = function(task, target) {
  var cb = this.task_.async();
  var splittedFilesSrc = this.getSplittedFilesSrc_(task, target);

  var spawnOptions;
  // Optionally log the task output
  // if (options.logConcurrentOutput) {
  //   spawnOptions = { stdio: 'inherit' };
  // }

  lpad.stdout('    ');
  var ok = true;
  async.forEach(splittedFilesSrc, function(filesSrc, next) {
    var filesOption = '--grunt-parallelize-child-filesSrc=' + filesSrc.join(path.delimiter);
    var cp = this.grunt_.util.spawn({
      grunt: true,
      args: [['parallelize', task, target].join(':')].concat(this.grunt_.option.flags(), filesOption),
      opts: spawnOptions
    }, function(err, result, code) {
      if ((err || code > 0)) {
        ok = false;
        if (result.stderr) {
          this.grunt_.warn(result.stderr);
        }
      }
      this.grunt_.log.write('\n' + this.filterOutput_(result.stdout, task, target) + '\n');
      next();
    }.bind(this));
    this.cpCache_.push(cp);
  }.bind(this), function() {
    lpad.stdout();
    if (!ok) {
      this.grunt_.log.writeln('');
    }
    cb(ok);
  }.bind(this));
};

Parallelizer.prototype.filterOutput_ = function(output, task, target) {
  var regex = new RegExp(util.format('^.*Running "parallelize:%s:%s".*\n\n', task, target), 'g');
  return output.replace(regex, '');
};

Parallelizer.prototype.getProcesses_ = function(task, target) {
  var processes = this.grunt_.config(['parallelize', task, target]);
  if (typeof processes === 'number') {
    return processes;
  } else if (processes) {
    processes = this.grunt_.config(['parallelize', task, 'options', 'processes']);
    if (typeof processes === 'number') {
      return processes;
    }
    processes = this.grunt_.config(['parallelize', 'options', 'processes']);
    if (typeof processes === 'number') {
      return processes;
    }
  }

  throw new Error('"processes" option not found');
};

Parallelizer.prototype.getSplittedFilesSrc_ = function(task, target) {
  var filesSrc = this.getNormalizedFilesSrc_(task, target);
  var processes = this.getProcesses_(task, target);
  if (processes < 0) {
    throw new Error('"processes" option shoud be positive');
  } else if (!processes) {
    return [];
  }
  var remain = filesSrc.length % processes;
  var per = (filesSrc.length - remain) / processes;
  var splittedFilesSrc = [];
  while (filesSrc.length) {
    splittedFilesSrc.push(filesSrc.splice(0, remain-- > 0 ? per + 1 : per));
  }
  return splittedFilesSrc;
};

Parallelizer.prototype.getNormalizedFilesSrc_ = function(task, target) {
  var configPath = [task, target];
  var config = this.grunt_.config(configPath);
  var files = this.grunt_.task.normalizeMultiTaskFiles(config);
  return _(files).chain().pluck('src').flatten().uniq().value();
};

module.exports = Parallelizer;
