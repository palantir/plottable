'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        remote: 'origin',
        branch: null
    });

    var args = ['pull'];

    args.push(options.remote);

    if (options.branch) {
        args.push(options.branch);
    }

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Pull a remote.';