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
    ts: {
      dev: {
        src: ["src/*.ts"],
        out: "build/plottable.js",
        // watch: "src",
        options: {
          target: 'es5',
          sourceMap: true,
          declaration: true,
          removeComments: true
        }
      },
      test: {
        src: ["test/*.ts"],
        out: "build/tests.js",
        // watch: "test",
        options: {
          target: 'es5',
          sourceMap: true,
          declaration: false,
          removeComments: false
        }
      },
      examples: {
        src: ["examples/*.ts"],
        outDir: "build",
        // watch: "examples",
        options: {
          target: 'es5',
          sourceMap: true,
          declaration: false,
          removeComments: false
        }
      }
    },
    watch: {
      "rebuild": {
        "tasks": ["build:rebuild"],
        "files": [
          "Gruntfile.js",
          "src/*.ts",
        ]
      },
      "tests": {
        "tasks": ["ts:test"],
        "files": ["test/**.ts"]
      },
      "examples": {
        "tasks": ["ts:examples"],
        "files": ["examples/**.ts"]
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("default", "build");

  grunt.registerTask("build",
    [
      "compile",
      "watch"
    ]
  );
  grunt.registerTask("compile",
    ["ts:dev", "ts:test", "ts:examples"]
    );
};
