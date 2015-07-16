/*eslint-env node */

module.exports = function(grunt) {
  "use strict";

  var tsJSON = {
    dev: {
      src: ["src/**/*.ts", "typings/**/*.d.ts"],
      outDir: "build/src/",
      options: {
        target: "es5",
        noImplicitAny: true,
        sourceMap: false,
        declaration: true,
        compiler: "./node_modules/typescript/bin/tsc",
        removeComments: false
      }
    },
    test: {
      src: ["test/*.ts", "typings/**/*.d.ts", "build/plottable.d.ts"],
      outDir: "build/test/",
      // watch: "test",
      options: {
        target: "es5",
        sourceMap: false,
        noImplicitAny: true,
        declaration: false,
        compiler: "./node_modules/typescript/bin/tsc",
        removeComments: false
      }
    },
    verifyDefinitionFiles: {
      src: ["typings/d3/d3.d.ts",
            "plottable.d.ts",
            "bower_components/svg-typewriter/svgtypewriter.d.ts"]
    }
  };

  var bumpJSON = {
    options: {
      files: ["package.json", "bower.json"],
      updateConfigs: ["pkg"],
      commit: false,
      createTag: false,
      push: false,
      prereleaseName: "rc"
    }
  };

  var FILES_TO_COMMIT = ["plottable.js",
                         "plottable.min.js",
                         "plottable.d.ts",
                         "plottable.css",
                         "plottable.zip",
                         "bower.json",
                         "package.json"];

  var prefixMatch = "\\n *(function |var |static )?";
  var varNameMatch = "[^(:;]*(\\([^)]*\\))?"; // catch function args too
  var nestedBraceMatch = ": \\{[^{}]*\\}";
  var typeNameMatch = ": [^;]*";
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?\\n?;";
  var jsdocInit = "\\n *\\/\\*\\* *\\n";
  var jsdocMid = "( *\\*[^\\n]*\\n)+";
  var jsdocEnd = " *\\*\\/ *";
  var jsdoc = "(" + jsdocInit + jsdocMid + jsdocEnd + ")?";

  var sedJSON = {
    privateDefinitions: {
      pattern: jsdoc + prefixMatch + "private " + varNameMatch + finalMatch,
      replacement: "",
      path: "build/plottable.d.ts"
    },
    plottableMultifile: {
      pattern: '/// *<reference path="([^."]*).ts" */>',
      replacement: 'synchronousRequire("/build/src/$1.js");',
      path: "plottable_multifile.js"
    },
    definitions: {
      pattern: '/// *<reference path=[\'"].*[\'"] */>',
      replacement: "",
      path: "build/plottable.d.ts"
    },
    testsMultifile: {
      pattern: '/// *<reference path="([^."]*).ts" */>',
      replacement: 'synchronousRequire("/build/test/$1.js");',
      path: "test/tests_multifile.js"
    },
    sublime: {
      pattern: "(.*\\.ts)",
      replacement: '/// <reference path="../$1" />',
      path: "build/sublime.d.ts"
    },
    versionNumber: {
      pattern: "@VERSION",
      replacement: "<%= pkg.version %>",
      path: "plottable.js"
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

  var browsers = [{
    browserName: "firefox",
    platform: "linux"
  }, {
    browserName: "chrome",
    platform: "linux"
  }, {
    browserName: "internet explorer",
    version: "9",
    platform: "WIN7"
  }];

  var configJSON = {
    pkg: grunt.file.readJSON("package.json"),
    bump: bumpJSON,
    umd: {
      all: {
        src: "plottable.js",
        template: "unit",
        objectToExport: "Plottable"
      }
    },
    concat: {
      header: {
        src: ["license_header.txt", "plottable.js"],
        dest: "plottable.js"
      },
      plottableMultifile: {
        src: ["synchronousRequire.js", "src/reference.ts"],
        dest: "plottable_multifile.js"
      },
      testsMultifile: {
        src: ["synchronousRequire.js", "test/testReference.ts"],
        dest: "test/tests_multifile.js"
      },
      plottable: {
        src: tsFiles.map(function(s) {
              return "build/src/" + s.replace(".ts", ".js");
          }),
        dest: "plottable.js"
      },
      tests: {
        src: testTsFiles.map(function(s) {
              return "build/test/" + s.replace(".ts", ".js");
          }),
        dest: "test/tests.js"
      },
      definitions: {
        src: tsFiles.map(function(s) {
              return "build/src/" + s.replace(".ts", ".d.ts");
          }),
        dest: "build/plottable.d.ts"
      },
      svgtypewriter: {
        src: ["plottable.js", "bower_components/svg-typewriter/svgtypewriter.js"],
        dest: "plottable.js"
      }
    },
    ts: tsJSON,
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      all: {
        src: ["src/**/*.ts", "test/**/*.ts"]
      }
    },
    jshint: {
      files: ["Gruntfile.js", "quicktests/**/*.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    jscs: {
      files: ["Gruntfile.js", "quicktests/**/*.js"],
      options: {
        config: ".jscsrc"
      }
    },
    eslint: {
      target: ["Gruntfile.js", "quicktests/**/*.js"],
      options: {
        configFile: ".eslintrc"
      }
    },
    parallelize: {
      tslint: {
        all: 4
      }
    },
    watch: {
      "options": {
        livereload: true
      },
      "rebuild": {
        "tasks": ["dev-compile"],
        "files": ["src/**/*.ts", "examples/**/*.ts"]
      },
      "tests": {
        "tasks": ["test-compile"],
        "files": ["test/**/*.ts"]
      },
      "quicktests": {
        "tasks": ["update-qt"],
        "files": ["quicktests/overlaying/tests/**/*.js"]
      }
    },
    "blanket_mocha": {
      all: ["test/coverage.html"],
      options: {
        threshold: 70
      }
    },
    connect: {
      server: {
        options: {
          port: 9999,
          hostname: "*",
          base: "",
          livereload: true
        }
      }
    },
    clean: {
      tscommand: ["tscommand*.tmp.txt"]
    },
    sed: sedJSON,
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
          archive: "plottable.zip"
        },
        files: [
        {src: "plottable.js",     dest: "."},
        {src: "plottable.min.js", dest: "."},
        {src: "plottable.d.ts",   dest: "."},
        {src: "plottable.css",    dest: "."},
        {src: "README.md",        dest: "."},
        {src: "LICENSE",          dest: "."}]
      }
    },
    uglify: {
      main: {
        files: {"plottable.min.js": ["plottable.js"]}
      }
    },
    shell: {
      sublime: {
        command: "(echo 'src/reference.ts'; find typings -name '*.d.ts') > build/sublime.d.ts"
      }
    },
    "saucelabs-mocha": {
      all: {
        options: {
          urls: ["http://127.0.0.1:9999/test/tests.html"],
          testname: "Plottable Sauce Unit Tests",
          browsers: browsers,
          build: process.env.TRAVIS_JOB_ID,
          "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
        }
      }
    }
  };

  // project configuration
  grunt.initConfig(configJSON);

  require("load-grunt-tasks")(grunt);

  // default task (this is what runs when a task isn't specified)
  grunt.registerTask("update_ts_files", updateTsFiles);
  grunt.registerTask("update_test_ts_files", updateTestTsFiles);
  grunt.registerTask("definitions_prod", function() {
    grunt.file.copy("build/plottable.d.ts", "plottable.d.ts");
  });
  grunt.registerTask("test-compile", [
                                  "ts:test",
                                  "concat:testsMultifile",
                                  "sed:testsMultifile",
                                  "concat:tests"
                                  ]);
  grunt.registerTask("default", "launch");
  var compileTask = [
      "update_ts_files",
      "update_test_ts_files",
      "ts:dev",
      "concat:plottable",
      "concat:svgtypewriter",
      "concat:definitions",
      "sed:definitions",
      "sed:privateDefinitions",
      "umd:all",
      "concat:header",
      "sed:versionNumber",
      "definitions_prod",
      "test-compile",
      "concat:plottableMultifile",
      "sed:plottableMultifile",
      "clean:tscommand",
      "update-qt"
  ];

  grunt.registerTask("dev-compile", compileTask);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", [
                                  "dev-compile",
                                  "blanket_mocha",
                                  "parallelize:tslint",
                                  "ts:verifyDefinitionFiles",
                                  "uglify",
                                  "compress"
                                  ]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);

  grunt.registerTask("launch", ["connect", "dev-compile", "watch"]);
  grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);
  grunt.registerTask("test", ["dev-compile", "blanket_mocha", "parallelize:tslint", "jshint", "ts:verifyDefinitionFiles", "jscs", "eslint"]);
  // Disable saucelabs for external pull requests. Check if we can see the SAUCE_USERNAME
  var travisTests = ["test"];
  if (process.env.SAUCE_USERNAME) {
    travisTests.push("test-sauce");
  }
  grunt.registerTask("test-travis", travisTests);
  grunt.registerTask("bm", ["blanket_mocha"]);

  grunt.registerTask("sublime", [
                                  "shell:sublime",
                                  "sed:sublime"
                                  ]);

  var updateQuickTestsJSON = function() {
    var qtJSON = [];
    var rawtests = grunt.file.expand("quicktests/overlaying/tests/**/*.js");
    rawtests.forEach(function(value){
      qtJSON.push({path: value});
    });
    qtJSON = JSON.stringify(qtJSON);
    qtJSON = qtJSON.split(",").join(",\n") + "\n";
    grunt.file.write("quicktests/overlaying/list_of_quicktests.json", qtJSON);
  };

  grunt.registerTask("update-qt", updateQuickTestsJSON);

};
