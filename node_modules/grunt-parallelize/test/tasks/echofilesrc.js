/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */
'use strict';

var fs = require('fs');

/*
 * Echo filesSrc for test.
 */
function createMultiTask(grunt, name) {
  grunt.registerMultiTask(name, 'Check the files exits.', function() {
    var done = this.async();
    grunt.util.async.forEachSeries(this.filesSrc, function(file, next) {
      // echo
      grunt.log.writeln('- ' + file);

      var body = fs.readFileSync(file, {encoding: 'utf8'});
      body = body.replace(/\n$/, '');
      if (body) {
        if (/^\d+$/.test(body)) {
          // wait if the file contains number for order.
          setTimeout(function() {next()}, Number(body));
        } else {
          // throw the body message.
          throw new Error(body);
        }
      } else {
        next();
      }
    }, function(err) {
      done(err);
    });
  });
}

module.exports = function(grunt) {
  createMultiTask(grunt, 'echofilesrc');
  createMultiTask(grunt, 'echofilesrc2');
};

module.exports.createMultiTask = createMultiTask;
