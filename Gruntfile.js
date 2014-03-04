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
        src: ["license_header.txt", "build/plottable.js"],
        dest: "build/plottable.js",
      },
    },
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
        threshold: 60
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

  grunt.registerTask("build" , ["compile", "watch"]);
  grunt.registerTask("launch", ["connect", "build"]);
  grunt.registerTask("compile",
    ["ts:dev", "ts:test", "ts:examples", "tslint", "concat:license"]
    );

  grunt.registerTask("test", ["compile", "blanket_mocha"]);

  grunt.registerTask("watch-test", ["blanket_mocha", "watch:test"]);
};
