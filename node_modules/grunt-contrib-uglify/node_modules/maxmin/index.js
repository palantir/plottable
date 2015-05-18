'use strict';
var gzipSize = require('gzip-size');
var prettyBytes = require('pretty-bytes');
var chalk = require('chalk');

function format(size) {
	return chalk.green(prettyBytes(size));
}

module.exports = function (max, min, useGzip) {
	if (max == null || min == null) {
		throw new Error('`max` and `min` required');
	}

	var ret = format(max.length) + ' → ' + format(min.length);

	if (useGzip === true) {
		ret += ' → ' + format(gzipSize.sync(min)) + chalk.gray(' (gzip)');
	}

	return ret;
};
