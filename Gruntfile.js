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
        noImplicitAny: true,
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
      updateConfigs: ['pkg'],
      commit: false,
      createTag: false,
      push: false
    }
  }

  var prefixMatch = "\n *";
  var varNameMatch = "[^(:;]*(\\([^)]*\\))?"; // catch function args too
  var nestedBraceMatch = ": \\{[^{}]*\\}";
  var typeNameMatch = ": [^;]*";
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?;"

  var sedJSON = {
    private_definitions: {
      pattern: prefixMatch + "private " + varNameMatch + finalMatch,
      replacement: "",
      path: "build/plottable.d.ts",
    },
    protected_definitions: {
      pattern: prefixMatch + "public _" + varNameMatch + finalMatch,
      replacement: "",
      path: "plottable.d.ts",
    },
    header: {
      pattern: "VERSION",
      replacement: "<%= pkg.version %>",
      path: "license_header.tmp",
    },
    public_member_vars: {
      pattern: prefixMatch + "public " + "[^(;]*;",
      replacement: "",
      path: "plottable.d.ts",
    },
  };

  var configJSON = {
    pkg: grunt.file.readJSON("package.json"),
    bump: bumpJSON,
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
      files: ["src/**/*.ts", "test/**.ts"]
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
        "tasks": ["ts:test"],
        "files": ["test/**.ts"]
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
      version: {
        options: {
          message: "Release version <%= pkg.version %>"
        },
        files: {
          src: ['plottable.js', 'plottable.d.ts', 'examples/exampleUtil.js', 'test/tests.js', "package.json", "bower.json"]
        }
      },
      built: {
        options: {
          message: "Update built files"
        },
        files: {
          src: ['plottable.js', 'plottable.d.ts', 'examples/exampleUtil.js', 'test/tests.js']
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
                                  "sed:private_definitions",
                                  "ts:test",
                                  "clean:tscommand"]);
  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "tslint",
                                  "blanket_mocha",
                                  "copy:dist",
                                  "handle-header",
                                  "sed:protected_definitions",
                                  "sed:public_member_vars"]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha"]);
  grunt.registerTask("bm", ["blanket_mocha"]);
};
