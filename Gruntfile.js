module.exports = function(grunt) {
  "use strict";

  var path = require("path");
  var cwd = process.cwd();

  var tsJSON = {
    dev: {
      src: ["src/**/*.ts", "typings/**/*.d.ts"],
      outDir: "build/src/",
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
      outDir: "build/test/",
      // watch: "test",
      options: {
        target: 'es5',
        sourceMap: false,
        noImplicitAny: true,
        declaration: false,
        removeComments: false
      }
    },
    verify_d_ts: {
      src: ["typings/d3/d3.d.ts", "plottable.d.ts"]
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
      path: "build/plottable.d.ts",
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
    plottable_multifile: {
      pattern: '/// *<reference path="([^."]*).ts" */>',
      replacement: 'synchronousRequire("/build/src/$1.js");',
      path: "plottable_multifile.js",
    },
    definitions: {
      pattern: '/// *<reference path=".*" */>',
      replacement: "",
      path: "build/plottable.d.ts",
    },
    tests_multifile: {
      pattern: '/// *<reference path="([^."]*).ts" */>',
      replacement: 'synchronousRequire("/build/test/$1.js");',
      path: "test/tests_multifile.js",
    },
    sublime: {
      pattern: "(.*\\.ts)",
      replacement: '/// <reference path="../$1" />',
      path: "build/sublime.d.ts",
    }
  };

  // e.g. ["components/foo.ts", ...]
  // the important thing is that they are sorted by hierarchy,
  // leaves first, roots last
  var tsFiles;
  // since src/reference.ts might have changed, I need to update this
  // on each recompile
  var updateTsFiles = function() {
    tsFiles = grunt.file.read("src/reference.ts")
                  .split("\n")
                  .filter(function(s) {
                    return s !== "";
                  })
                  .map(function(s) {
                    return s.match(/"(.*\.ts)"/)[1];
                  });
  };
  updateTsFiles();

  var testTsFiles;
  var updateTestTsFiles = function() {
    testTsFiles = grunt.file.read("test/testReference.ts")
                  .split("\n")
                  .filter(function(s) {
                    return s !== "";
                  })
                  .map(function(s) {
                    return s.match(/"(.*\.ts)"/)[1];
                  });
  };
  updateTestTsFiles();

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
        dest: "plottable_multifile.js",
      },
      tests_multifile: {
        src: ["synchronousRequire.js", "test/testReference.ts"],
        dest: "test/tests_multifile.js",
      },
      plottable: {
        src: tsFiles.map(function(s) {
              return "build/src/" + s.replace(".ts", ".js");
          }),
        dest: "plottable.js",
      },
      tests: {
        src: testTsFiles.map(function(s) {
              return "build/test/" + s.replace(".ts", ".js");
          }),
        dest: "test/tests.js",
      },
      definitions: {
        src: tsFiles.map(function(s) {
              return "build/src/" + s.replace(".ts", ".d.ts");
          }),
        dest: "build/plottable.d.ts",
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
        "tasks": ["test-compile"],
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
    },
    shell: {
      sublime: {
        command: "(echo 'src/reference.ts'; find typings -name '*.d.ts') > build/sublime.d.ts",
      },
    },
  };


  // project configuration
  grunt.initConfig(configJSON);

  require('load-grunt-tasks')(grunt);

  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("handle-header",
            ["copy:header", "sed:header", "concat:header", "clean:header"]);
  grunt.registerTask("update_ts_files", updateTsFiles);
  grunt.registerTask("update_test_ts_files", updateTestTsFiles);
  grunt.registerTask("definitions_prod", function() {
    grunt.file.copy("build/plottable.d.ts", "plottable.d.ts");
  });
  grunt.registerTask("test-compile", [
                                  "ts:test",
                                  "concat:tests_multifile",
                                  "sed:tests_multifile",
                                  "concat:tests",
                                  ]);
  grunt.registerTask("default", "launch");
  grunt.registerTask("dev-compile", [
                                  "update_ts_files",
                                  "update_test_ts_files",
                                  "ts:dev",
                                  "concat:plottable",
                                  "concat:definitions",
                                  "sed:definitions",
                                  "sed:private_definitions",
                                  "definitions_prod",
                                  "test-compile",
                                  "handle-header",
                                  "sed:protected_definitions",
                                  "concat:plottable_multifile",
                                  "sed:plottable_multifile",
                                  "clean:tscommand"]);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "blanket_mocha",
                                  "tslint",
                                  "ts:verify_d_ts",
                                  "uglify",
                                  "compress"
                                  ]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha", "tslint", "ts:verify_d_ts"]);
  grunt.registerTask("bm", ["blanket_mocha"]);

  grunt.registerTask("sublime", [
                                  "shell:sublime",
                                  "sed:sublime",
                                  ]);
};
