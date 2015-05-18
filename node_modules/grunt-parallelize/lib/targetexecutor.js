'use strict';

var _ = require('lodash');
var async = require('async');
var lpad = require('lpad');

function TargetExecutor() {
  this.cpCache_ = [];
}

TargetExecutor.prototype.kill = function() {
  this.cpCache_.forEach(function(el) {
    el.kill();
  });
};

TargetExecutor.prototype.exec = function(grunt, data, task, callback) {
  var targets = _.keys(data).filter(function(item) {return item !== 'options';});
  var spawnOptions;
  lpad.stdout('    ');
  var ok = true;
  async.forEachSeries(targets, function(target, next) {
    var nameArgs = ['parallelize', task, target].join(':');
    var cp = grunt.util.spawn({
      grunt: true,
      args: [nameArgs].concat(grunt.option.flags()),
      opts: spawnOptions
    }, function(err, result, code) {
      if (err || code > 0) {
        ok = false;
        if (result.stderr) {
          grunt.warn(result.stderr);
        }
      }
      grunt.log.writeln('\n' + result.stdout);
      next();
    });
    this.cpCache_.push(cp);
  }.bind(this), function() {
    lpad.stdout();
    if (!ok) {
      grunt.log.writeln('');
    }
    callback(ok);
  }.bind(this));
};

module.exports = TargetExecutor;
