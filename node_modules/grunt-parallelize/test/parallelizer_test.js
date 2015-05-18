'use strict';

require('mocha');
var expect = require('expect.js');
var Parallelizer = require('../lib/parallelizer');

describe('Parallelizer', function() {
  var sut, grunt, task;
  beforeEach(function() {
    grunt = {};
    task = {};
    sut = new Parallelizer(grunt, task);
  });

  it('constructor', function() {
    expect(sut).to.be.ok();
  });

  describe('#filterOutput_', function() {
    it('filter out its own log ', function() {
      var output = [
        'Running "parallelize:taskname:targetname" (parallelize) task',
        '',
        'Running "taskname:targetname" (taskname) task',
      ].join('\n');
      var actual = sut.filterOutput_(output, 'taskname', 'targetname');
      var expected = 'Running "taskname:targetname" (taskname) task';
      expect(actual).to.be(expected);
    });

    it('filter out its own log (color)', function() {
      var output = [
        '\u001b[4mRunning "parallelize:taskname:targetname" (parallelize) task\u001b[24m',
        '',
        '\u001b[4mRunning "taskname:targetname" (taskname) task\u001b[24m'
      ].join('\n');
      var actual = sut.filterOutput_(output, 'taskname', 'targetname');
      var expected = '\u001b[4mRunning "taskname:targetname" (taskname) task\u001b[24m';
      expect(actual).to.be(expected);
    });
  });

  describe('#getSplittedFilesSrc_', function() {
    var filesSrc, processes;

    beforeEach(function() {
      sut.getNormalizedFilesSrc_ = function() {
        return filesSrc;
      };
      sut.getProcesses_ = function() {
        return processes;
      };
    });

    it('throws if "processes" option is negative', function() {
      filesSrc = [1, 2, 3];
      processes = -1;
      expect(function() {
        sut.getSplittedFilesSrc_(null, null);
      }).to.throwException();
    });

    describe('filesSrc has no items', function() {
      beforeEach(function() {
        filesSrc = [];
      });

      it('returns empty array', function() {
        processes = 2;
        expect(sut.getSplittedFilesSrc_(null, null)).to.be.empty();
      });
    });

    describe('filesSrc has 4 items', function() {
      beforeEach(function() {
        filesSrc = [1, 2, 3, 4];
      });

      it('splits into 0 []', function() {
        processes = 0;
        expect(sut.getSplittedFilesSrc_(null, null)).to.be.empty();
      });

      it('splits into 1 [4]', function() {
        processes = 1;
        expect(sut.getSplittedFilesSrc_(null, null)).to.eql([
          [1, 2, 3, 4]
        ]);
      });

      it('splits into 2 [2, 2]', function() {
        processes = 2;
        expect(sut.getSplittedFilesSrc_(null, null)).to.eql([
          [1, 2], [3, 4]
        ]);
      });

      it('splits into 3 [2, 1, 1]', function() {
        processes = 3;
        expect(sut.getSplittedFilesSrc_(null, null)).to.eql([
          [1, 2], [3], [4]
        ]);
      });

      it('splits into 4 [1, 1, 1, 1]', function() {
        processes = 4;
        expect(sut.getSplittedFilesSrc_(null, null)).to.eql([
          [1], [2], [3], [4]
        ]);
      });

      it('splits into 5 [1, 1, 1, 1]', function() {
        processes = 5;
        expect(sut.getSplittedFilesSrc_(null, null)).to.eql([
          [1], [2], [3], [4]
        ]);
      });
    });
  });
});
