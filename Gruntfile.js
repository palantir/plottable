/*
 * The Web project Gruntfile.
 *
 * Copyright 2013 Palantir Technologies, Inc. All rights reserved.
 */

module.exports = function(grunt) {
  "use strict";

  var path = require("path");
  var cwd = process.cwd();

  // project configuration
  grunt.initConfig({

    copy: {
      main: {
        expand: true,
        cwd: 'web',
        src: '**',
        dest: 'build'
      }
    },
    typescript: {
      compile: {
        options: {
          module: "amd",
          // nolib: true,
          sourcemap: true,
          target: "ES5"
        },
        files: [
          { src: ["build/src/*.ts"], dest: "build/plottable.js" },
          { src: ["build/test/*.ts"], dest: "build/test/tests.js" },
          { src: ["build/examples/*.ts"], dest: "build/examples/examples.js"}
        ]
      }
    },
    watch: {
      "rebuild": {
        "tasks": [
          "build:rebuild"
        ],
        "files": [
          "Gruntfile.js",
          "web/**.ts",
        ]
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("default", "build");

  grunt.registerTask("build",
    [
      "copy",
      "typescript",
      "watch"
    ]
  );
};
