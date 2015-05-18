'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        theirs: false,
        branch: null
    });

    var args = ['rebase'];

    if (!options.branch) {
        done(new Error('gitrebase requires a branch parameter.'));
        return;
    }

    if (options.theirs) {
        args.push('--strategy=recursive', '-Xtheirs');
    }

    args.push(options.branch);

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Rebase a branch onto another branch.';

