'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        command: 'save',
        stash: null,
        staged: false
    });

    var args = ['stash'];

    args.push(options.command);

    if (options.stash) {
        args.push('stash@{' + options.stash + '}');
    }

    if (options.staged) {
        args.push('--index');
    }

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Stash and apply code changes.';
