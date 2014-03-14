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
        out: "build/plottable.js",
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
        src: ["test/*.ts", "typings/**/*.d.ts", "build/plottable.d.ts"],
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
        "tasks": ["dev-compile"],
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
    },
    sed: {
      private_definitions: {
        pattern: "\n *private [^:;]*(: [^;]*)?;",
        replacement: "",
        path: "plottable.d.ts"
      },
      protected_definitions: {
        pattern: "\n *public _[^:;]*(: [^;]*)?;",
        replacement: "",
        path: "plottable.d.ts"
      },
    },
    copy: {
      dist: {
        files: [
          {src: "build/plottable.js", dest:"plottable.js"},
          {src: "build/plottable.d.ts", dest:"plottable.d.ts"}
        ]
      }
    },
    gitcommit: {
      task: {
        options: {
          message: "Update plottable.js and plottable.d.ts"
        },
        files: {
          src: ['plottable.js', 'plottable.d.ts']
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("default", "launch");
  grunt.registerTask("dev-compile", [
                                  "ts:dev",
                                  "ts:test",
                                  "ts:examples",
                                  "tslint"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "copy:dist",
                                  "concat:license",
                                  "sed:private_definitions",
                                  "sed:protected_definitions"]);

  grunt.registerTask("update-built", ["dist-compile", "gitcommit"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha"]);
};
