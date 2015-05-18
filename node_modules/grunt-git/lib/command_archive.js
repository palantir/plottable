'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        treeIsh: 'master'
    });

    var args = ['archive'];

    // git archive --format=<format> --prefix=<base_directory>/ treeIsh --output=<output file>

    if (!options.treeIsh || options.treeIsh.trim() === '') {
        done(new Error('gitarchive requires a treeIsh parameter.'));
        return;
    }

    // --format=<fmt>
    // Format of the resulting archive: tar or zip. If this option is not given, and the output file is specified, the format is inferred from the filename if possible (e.g. writing to "foo.zip" makes the output to be in the zip format). Otherwise the output format is tar.
    if (options.format && options.format.trim() !== '') {
        args.push('--format');
        args.push(options.format.trim());
    }

    // --prefix=<prefix>/
    // Prepend <prefix>/ to each filename in the archive.
    if (options.prefix && options.prefix.trim() !== '') {
        args.push('--prefix');
        args.push(options.prefix.trim());
    }

    // --output=<file>
    // Write the archive to <file> instead of stdout.
    if (options.output && options.output.trim() !== '') {
        args.push('--output');
        args.push(options.output.trim());
    }

    // --remote=<repo>
    // Instead of making a tar archive from the local repository, retrieve a tar archive from a remote repository.
    // Note: It seems that GitHub does not support the remote archiving feature.
    if (options.remote && options.remote.trim() !== '') {
        args.push('--remote');
        args.push(options.remote.trim());
    }

    // <tree-ish>
    // The tree or commit to produce an archive for.
    args.push(options.treeIsh.trim());

    // <path>
    // Without an optional path parameter, all files and subdirectories of the current working directory are included in the archive. If one or more paths are specified, only these are included.
    if (options.path) {
        if (grunt.util.kindOf(options.path) === 'string') {
            // Backwards compatible to <= 0.2.8.
            options.path = [options.path];
        }

        args = args.concat(options.path);
    }

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Create a git archive.';
