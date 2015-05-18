'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        branch: null,
        create: false,
        overwrite: false
    });

    var args = ['checkout'];

    if (!options.branch) {
        done(new Error('gitcheckout tasks requires that you specify a "branch" (this can be a commit ID)'));
        return;
    }

    if (options.overwrite) {
        args.push('-B');
    } else if (options.create) {
        args.push('-b');
    }


    args.push(options.branch);

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Checkout a git branch.';

