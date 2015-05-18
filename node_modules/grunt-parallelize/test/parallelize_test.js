'use strict';

require('mocha');
var expect = require('expect.js');
var exec = require('child_process').exec;
var fs = require('fs');

describe('grunt-parallelize', function() {
  describe('grunt parallelize:task:target', function() {
    it('supports "Compact Format"', function(done) {
      testGruntfile('compactFormat', done);
    });

    it('supports "Files Array Format"', function(done) {
      testGruntfile('filesArrayFormat', done);
    });

    it('runs and displays all child tasks if some task has error"', function(done) {
      testGruntfile('containsError', done);
    });
  });

  describe('grunt parallelize:task', function() {
    it('runs all targets', function(done) {
      testGruntfile('runAllTargets', done);
    });

    it('runs and displays all targets if some target has error"', function(done) {
      testGruntfile('someTargetContainsError', done);
    });
  });

  describe('grunt parallelize', function() {
    it('runs all tasks', function(done) {
      this.timeout(5000);
      testGruntfile('runAllTasks', done);
    });
  });

  describe('detect processes', function() {
    it('detects from target options', function(done) {
      testGruntfile('targetOption', done);
    });

    it('detects from task options', function(done) {
      testGruntfile('taskOption', done);
    });
  });

});

function testGruntfile(name, callback) {
  var prefix = __dirname + '/cases/' + name;
  var gruntfile = prefix + '.Gruntfile.js';
  runGruntfile(gruntfile, function(err, stdout, stderr) {
    var expectedFile = prefix + (err ? '.ng.txt' : '.ok.txt');
    var expected;
    try {
      expected = fs.readFileSync(expectedFile, {encoding: 'utf8'});
    } catch (e) {
      // ng is unexpected.
      console.log('stdout: ' + stdout);
      callback(err || stderr || stdout || true);
      return;
    }
    try {
      expect(stdout).to.be(expected);
    } catch (e) {
      console.log('expected:');
      console.log(expected);
      console.log('actual:');
      console.log(stdout);
      throw e;
    }
    callback();
  });
}

function runGruntfile(gruntfile, callback) {
  var cmd = ['grunt', '--no-color', '--gruntfile', gruntfile].join(' ');
  var options = {};
  exec(cmd, options, callback);
}
