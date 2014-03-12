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
    concat: {
      license: {
        src: ["license_header.txt", "plottable.js"],
        dest: "plottable.js",
      },
    },
    ts: {
      dev: {
        src: ["src/*.ts", "typings/**/*.d.ts"],
        out: "plottable.js",
        // watch: "src",
        options: {
          target: 'es5',
          noImplicitAny: true,
          sourceMap: false,
          declaration: true,
          removeComments: false
        }
      },
      test: {
        src: ["test/*.ts", "typings/**/*.d.ts"],
        out: "build/tests.js",
        // watch: "test",
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false
        }
      },
      examples: {
        src: ["examples/*.ts", "typings/**/*.d.ts"],
        outDir: "build",
        // watch: "examples",
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false
        }
      }
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      files: ["src/*.ts", "test/*.ts"]
    },
    watch: {
      "options": {
        livereload: true
      },
      "rebuild": {
        "tasks": ["compile"],
        "files": ["src/*.ts"]
      },
      "tests": {
        "tasks": ["ts:test", "tslint"],
        "files": ["test/**.ts"]
      },
      "examples": {
        "tasks": ["ts:examples", "tslint"],
        "files": ["examples/**.ts"]
      }
    },
    blanket_mocha: {
      all: ['tests.html'],
      options: {
        threshold: 90
      }
    },
    connect: {
      server: {
        options: {
          port: 7007,
          livereload: true
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("default", "launch");

  grunt.registerTask("compile", ["ts:dev", "ts:test", "ts:examples", "tslint", "concat:license"]);
  grunt.registerTask("build" , ["compile", "watch"]);
  grunt.registerTask("launch", ["connect", "build"]);
  grunt.registerTask("test", ["compile", "blanket_mocha"]);
  grunt.registerTask("watch-test", ["blanket_mocha", "watch:test"]);
};
