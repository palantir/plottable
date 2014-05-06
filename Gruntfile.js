/*
 * The Web project Gruntfile.
 *
 * Copyright 2013 Palantir Technologies, Inc. All rights reserved.
 */

module.exports = function(grunt) {
  "use strict";

  var path = require("path");
  var cwd = process.cwd();

  var tsJSON = {
    dev: {
      src: ["src/**/*.ts", "typings/**/*.d.ts"],
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
  };

  var bumpJSON = {
    options: {
      files: ['package.json', 'bower.json'],
      commit: false,
      createTag: false,
      push: false
    }
  }

  var prefixMatch = "\n *"
  var varNameMatch = "[^:;]*"
  var nestedBraceMatch = ": {[^{}]*}"
  var typeNameMatch = ": [^;]*"
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?;"

  var sedJSON = {
    private_definitions: {
      pattern: prefixMatch + "private " + varNameMatch + finalMatch,
      replacement: "",
      path: "plottable.d.ts"
    },
    protected_definitions: {
      pattern: prefixMatch + "public _" + varNameMatch + finalMatch,
      replacement: "",
      path: "plottable.d.ts"
    },
    header: {
      pattern: "VERSION",
      replacement: grunt.file.readJSON('package.json').version,
      path: "license_header.tmp",
    }
  };

  var configJSON = {
    bump: bumpJSON;
    concat: {
      header: {
        src: ["license_header.tmp", "plottable.js"],
        dest: "plottable.js",
      },
    },
    ts: tsJSON,
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
        "files": ["src/**/*.ts"]
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
      all: ['test/coverage.html'],
      options: {
        threshold: 80
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
    clean: {tscommand: ["tscommand*.tmp.txt"], header: ["license_header.tmp"]},
    sed: sedJSON,
    copy: {
      dist: {
        files: [
          {src: "build/plottable.js",   dest:"plottable.js"            },
          {src: "build/plottable.d.ts", dest:"plottable.d.ts"          },
          {src: "build/tests.js",       dest: "test/tests.js"          },
          {src: "build/exampleUtil.js", dest: "examples/exampleUtil.js"}
        ]
      },
      header: {
        files: [{src: "license_header.txt", dest: "license_header.tmp"}]
      }
    },
    gitcommit: {
      task: {
        options: {
          message: "Release version " + grunt.file.readJSON('package.json').version
        },
        files: {
          src: ['plottable.js', 'plottable.d.ts', 'examples/exampleUtil.js', 'test/tests.js', "package.json", "bower.json"]
        }
      }
    }
  };


  // project configuration
  grunt.initConfig(configJSON);

  require('load-grunt-tasks')(grunt);

  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("handle-header",
            ["copy:header", "sed:header", "concat:header", "clean:header"]);
  grunt.registerTask("default", "launch");
  grunt.registerTask("dev-compile", [
                                  "ts:dev",
                                  "ts:test",
                                  "ts:examples",
                                  "tslint",
                                  "clean:tscommand"]);
  grunt.registerTask("release:patch", ["bump:patch", "dist-compile"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "blanket_mocha",
                                  "copy:dist",
                                  "concat:license",
                                  "sed:private_definitions",
                                  "sed:protected_definitions"]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit"]);
  grunt.registerTask("commit-js", ["dist-compile", "gitcommit"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha"]);
  grunt.registerTask("bm", ["blanket_mocha"]);
};
