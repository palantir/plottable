'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        bare: false,
        recursive: false,
        branch: false,
        repository: false,
        directory: false
    });

    var args = ['clone'];

    // repo is the sole required option
    if (!options.repository) {
        done(new Error('gitclone tasks requires that you specify a "repository"'));
        return;
    }

    if (options.bare) {
        args.push('--bare');
    }

    if (options.recursive) {
        args.push('--recursive');
    }

    if (options.branch && !options.bare) {
        args.push('--branch');
        args.push(options.branch);
    }

    if (typeof options.depth !== 'undefined') {
        args.push('--depth');
        args.push(options.depth);
    }

    // repo comes after the options
    args.push(options.repository);

    // final argument is checkout directory (optional)
    if (options.directory) {
        args.push(options.directory);
    }

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Clone repositories.';
