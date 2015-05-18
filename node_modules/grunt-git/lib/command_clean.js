'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        force: true,
        dry: false,
        quiet: false,
        exclude: false,
        onlyignoredfiles: false,
        nonstandard: false,
        directories: false
    });

    var args = ['clean'];

    // Add the options to the command line arguments
    if (options.force && options.dry === false) {
        args.push('-f');
    }
    if (options.dry) {
        args.push('-n');
    }
    if (options.quiet) {
        args.push('-q');
    }
    if (options.exclude) {
        args.push('-e ' + options.exclude);
    }
    if (options.onlyignoredfiles) {
        args.push('-X');
    }
    if (options.nonstandard) {
        args.push('-x');
    }
    if (options.directories) {
        args.push('-d');
    }

    // Add the file paths to the arguments.
    task.files.forEach(function (files) {
        for (var i = 0; i < files.src.length; i++) {
            args.push(files.src[i]);
        }
    });

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Remove untracked files from the working tree.';
