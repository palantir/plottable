'use strict';

var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        branch: null,
        squash: false,
        noff: false,
        ffOnly: false,
        edit: false,
        noEdit: false,
        message: null,
        commit: false,
        noCommit: false,

    });

    var args = ['merge'];

    if (!options.branch) {
        done(new Error('gitmerge task requires that you specify a "branch" to merge from.'));
        return;
    }

    args.push(options.branch);

    if (options.ffOnly) {
        args.push('--ff-only');
    }

    if (options.squash) {
        args.push('--squash');
    }

    if (options.noff) {
        args.push('--no-ff');
    }

    if (options.edit) {
        args.push('--edit');
    }

    if (options.noEdit) {
        args.push('--no-edit');
    }

    if (options.message) {
        args.push('-m');
        args.push(options.message);
    }

    if (options.commit) {
        args.push('--commit');
    }

    if (options.noCommit) {
        args.push('--no-commit');
    }

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Merge a git branch.';
