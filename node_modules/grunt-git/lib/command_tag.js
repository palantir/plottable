'use strict';

var async = require('grunt').util.async;
var grunt = require('grunt');

module.exports = function (task, exec, done) {
    var options = task.options({
        message: ''
    });

    var args = ['tag'];

    if (!options.tag) {
        done(new Error('gittag requires a tag parameter.'));
        return;
    }

    if (options.message && options.message.trim() !== '') {
        args.push('-m');
        args.push(options.message);
    }

    args.push(options.tag);

    // Add callback
    args.push(done);

    exec.apply(this, args);
};

module.exports.description = 'Create a git tag.';

