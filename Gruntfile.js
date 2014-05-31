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
      outDir: "build/",
      options: {
        target: 'es5',
        noImplicitAny: true,
        sourceMap: false,
        declaration: true,
        removeComments: false
      }
    },
    prod: {
      src: ["src/**/*.ts", "typings/**/*.d.ts"],
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
      src: ["test/*.ts", "typings/**/*.d.ts", "plottable.d.ts"],
      out: "test/tests.js",
      // watch: "test",
      options: {
        target: 'es5',
        sourceMap: false,
        noImplicitAny: true,
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

  var FILES_TO_COMMIT = ['plottable.js',
                         'plottable.min.js',
                         'plottable.d.ts',
                         'examples/exampleUtil.js',
                         'test/tests.js',
                         "plottable.css",
                         "plottable.zip",
                         "bower.json",
                         "package.json"];

  var prefixMatch = "\\n *";
  var varNameMatch = "[^(:;]*(\\([^)]*\\))?"; // catch function args too
  var nestedBraceMatch = ": \\{[^{}]*\\}";
  var typeNameMatch = ": [^;]*";
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?\\n?;"
  var jsdoc_init = "\\n *\\/\\*\\* *\\n";
  var jsdoc_mid = "( *\\*[^\\n]*\\n)+";
  var jsdoc_end = " *\\*\\/ *";
  var jsdoc = "(" + jsdoc_init + jsdoc_mid + jsdoc_end + ")?";

  var sedJSON = {
    private_definitions: {
      pattern: jsdoc + prefixMatch + "private " + varNameMatch + finalMatch,
      replacement: "",
      path: "plottable.d.ts",
    },
    protected_definitions: {
      pattern: jsdoc + prefixMatch + "public _" + varNameMatch + finalMatch,
      replacement: "",
      path: "plottable.d.ts",
    },
    header: {
      pattern: "VERSION",
      replacement: "<%= pkg.version %>",
      path: "license_header.tmp",
    },
    public_member_vars: {
      pattern: jsdoc + prefixMatch + "public " + "[^(;]*;",
      replacement: "",
      path: "plottable.d.ts",
    },
    plottable_multifile: {
      pattern: '/// *<reference path="([^."]*).ts" */>',
      replacement: 'synchronousRequire("../build/$1.js");',
      path: "plottable_multifile.js",
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
      plottable_multifile: {
        src: ["synchronousRequire.js", "src/reference.ts"],
        // src: ["synchronousRequire.js", "build/files.txt"],
        dest: "plottable_multifile.js",
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
        threshold: 70
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
          src: FILES_TO_COMMIT
        }
      },
      built: {
        options: {
          message: "Update built files"
        },
        files: {
          src: FILES_TO_COMMIT
        }
      }
    },
    compress: {
      main: {
        options: {
          archive: 'plottable.zip'
        },
        files: [
        {src: 'plottable.js'  , dest: '.'},
        {src: 'plottable.min.js', dest: '.'},
        {src: 'plottable.d.ts', dest: '.'},
        {src: 'plottable.css' , dest: '.'},
        {src: 'README.md'     , dest: '.'},
        {src: 'LICENSE'       , dest: '.'}]
      }
    },
    uglify: {
      main: {
        files: {'plottable.min.js': ['plottable.js']}
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
                                  "tslint",
                                  "ts:prod",
                                  "sed:private_definitions",
                                  "ts:test",
                                  "handle-header",
                                  "sed:protected_definitions",
                                  "sed:public_member_vars",
                                  "concat:plottable_multifile",
                                  "sed:plottable_multifile",
                                  "clean:tscommand"]);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "tslint",
                                  "blanket_mocha",
                                  "uglify",
                                  "compress"
                                  ]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha"]);
  grunt.registerTask("bm", ["blanket_mocha"]);
};
