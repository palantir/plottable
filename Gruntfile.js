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

    typescript: {
      compile: {
        options: {
          module: "amd",
          // nolib: true,
          sourcemap: true,
          target: "ES5"
        },
        files: [
          { src: ["src/*.ts"], dest: "plottable.js" },
          { src: ["test/*.ts"], dest: "." }
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
          "src/*.ts",
          "test/*.ts"
        ]
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("default", "build");

  grunt.registerTask("build",
    [
      "typescript",
      "watch"
    ]
  );
};
