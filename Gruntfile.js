/*eslint-env node */

module.exports = function(grunt) {
  "use strict";

  var tsConfig = {
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
      src: ["test/**/*.ts", "typings/**/*.d.ts", "build/plottable.d.ts"],
      outDir: "build/test/",
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
      src: [
        "typings/d3/d3.d.ts",
        "plottable.d.ts",
        "bower_components/svg-typewriter/svgtypewriter.d.ts"
      ],
      options: {
        compiler: "./node_modules/typescript/bin/tsc"
      }
    }
  };

  var bumpConfig = {
    options: {
      files: ["package.json", "bower.json"],
      updateConfigs: ["pkg"],
      commit: false,
      createTag: false,
      push: false,
      prereleaseName: "rc"
    }
  };

  var prefixMatch = "\\n *(function |var |static )?";
  var varNameMatch = "[^(:;]*(\\([^)]*\\))?"; // catch function args too
  var nestedBraceMatch = ": \\{[^{}]*\\}";
  var typeNameMatch = ": [^;]*";
  var finalMatch = "((" + nestedBraceMatch + ")|(" + typeNameMatch + "))?\\n?;";
  var jsdocInit = "\\n *\\/\\*\\* *\\n";
  var jsdocMid = "( *\\*[^\\n]*\\n)+";
  var jsdocEnd = " *\\*\\/ *";
  var jsdoc = "(" + jsdocInit + jsdocMid + jsdocEnd + ")?";

  var sedConfig = {
    privateDefinitions: {
      pattern: jsdoc + prefixMatch + "private " + varNameMatch + finalMatch,
      replacement: "",
      path: "build/plottable.d.ts"
    },
    definitions: {
      pattern: '/// *<reference path=[\'"].*[\'"] */>',
      replacement: "",
      path: "build/plottable.d.ts"
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
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter(function(s) {
        return s !== "";
      }).map(function(s) {
        return s.match(/"(.*\.ts)"/)[1];
      });
  };
  updateTsFiles();

  var testTsFiles;
  var updateTestTsFiles = function() {
    testTsFiles = grunt.file.read("test/testReference.ts")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter(function(s) {
        return s !== "";
      }).map(function(s) {
        return s.match(/"(.*\.ts)"/)[1];
      });
  };
  updateTestTsFiles();

  var umdConfig = {
    all: {
      src: "plottable.js",
      template: "unit",
      objectToExport: "Plottable"
    }
  };

  var concatConfig = {
    header: {
      src: ["license_header.txt", "plottable.js"],
      dest: "plottable.js"
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
  };

  var tslintConfig = {
    options: {
      configuration: grunt.file.readJSON(".tslintrc")
    },
    all: {
      src: ["src/**/*.ts", "test/**/*.ts"]
    }
  };

  var jscsConfig = {
    files: ["Gruntfile.js", "quicktests/**/*.js"],
    options: {
      config: ".jscsrc"
    }
  };

  var eslintConfig = {
    target: ["Gruntfile.js", "quicktests/**/*.js"],
    options: {
      configFile: ".eslintrc"
    }
  };

  var parallelizeConfig = {
    tslint: {
      all: 4
    }
  };

  var watchConfig = {
    options: {
      livereload: true,
      spawn: false
    },
    rebuild: {
      tasks: ["src-compile"],
      files: ["src/**/*.ts"]
    },
    tests: {
      tasks: ["test-compile"],
      files: ["test/**/*.ts"]
    },
    quicktests: {
      tasks: ["update-quicktests"],
      files: ["quicktests/overlaying/tests/**/*.js"]
    }
  };

  var blanketMochaConfig = {
    all: ["test/coverage.html"],
    options: {
      threshold: 70
    }
  };

  var connectConfig = {
    server: {
      options: {
        port: 9999,
        hostname: "*",
        base: "",
        livereload: true
      }
    }
  };

  var cleanConfig = {
    tscommand: ["tscommand*.tmp.txt"]
  };

  var FILES_TO_COMMIT = [
    "plottable.js",
    "plottable.min.js",
    "plottable.d.ts",
    "plottable.css",
    "plottable.zip",
    "bower.json",
    "package.json"
  ];

  var gitcommitConfig = {
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
  };

  var compressConfig = {
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
        {src: "LICENSE",          dest: "."}
      ]
    }
  };

  var uglifyConfig = {
    main: {
      files: {"plottable.min.js": ["plottable.js"]}
    }
  };

  var shellConfig = {
    sublime: {
      command: "(echo 'src/reference.ts'; find typings -name '*.d.ts') > build/sublime.d.ts"
    }
  };

  var saucelabsMochaConfig = {
    all: {
      options: {
        urls: ["http://127.0.0.1:9999/test/tests.html"],
        testname: "Plottable Sauce Unit Tests",
        pollInterval: 5000,
        statusCheckAttempts: 60,
        browsers: [{
          browserName: "firefox",
          platform: "linux"
        }, {
          browserName: "chrome",
          platform: "linux"
        }, {
          browserName: "internet explorer",
          version: "9",
          platform: "WIN7"
        }, {
          browserName: "iphone",
          platform: "OS X 10.10",
          version: "8.0",
          deviceName: "iPad Simulator",
          deviceOrientation: "portrait"
        }],
        build: process.env.TRAVIS_JOB_ID,
        "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER
      }
    }
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    bump: bumpConfig,
    umd: umdConfig,
    concat: concatConfig,
    ts: tsConfig,
    tslint: tslintConfig,
    jscs: jscsConfig,
    eslint: eslintConfig,
    parallelize: parallelizeConfig,
    watch: watchConfig,
    "blanket_mocha": blanketMochaConfig,
    connect: connectConfig,
    clean: cleanConfig,
    sed: sedConfig,
    gitcommit: gitcommitConfig,
    compress: compressConfig,
    uglify: uglifyConfig,
    shell: shellConfig,
    "saucelabs-mocha": saucelabsMochaConfig
  });

  // Loads the tasks specified in package.json
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("update_ts_files", updateTsFiles);
  grunt.registerTask("update_test_ts_files", updateTestTsFiles);

  grunt.registerTask("definitions_prod", function() {
    grunt.file.copy("build/plottable.d.ts", "plottable.d.ts");
  });

  grunt.registerTask("test-compile", ["ts:test", "concat:tests"]);
  grunt.registerTask("src-compile", ["ts:dev", "generateJS"]);

  grunt.registerTask("dev-compile", [
    "update_ts_files",
    "update_test_ts_files",
    "src-compile",
    "test-compile",
    "clean:tscommand",
    "update-quicktests"
  ]);

  grunt.registerTask("generateJS", [
    "concat:plottable",
    "concat:svgtypewriter",
    "concat:definitions",
    "sed:definitions",
    "sed:privateDefinitions",
    "umd:all",
    "concat:header",
    "sed:versionNumber",
    "definitions_prod"
  ]);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", ["test", "uglify", "compress"]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);
  grunt.registerTask("default", ["connect", "dev-compile", "watch-silent"]);

  grunt.registerTask("test", ["dev-compile", "test-local"]);
  grunt.registerTask("test-local", ["blanket_mocha", "ts:verifyDefinitionFiles", "lint"]);
  grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);

  grunt.registerTask("watch-silent", function() {
    // Surpresses the "Running 'foo' task" messages
    grunt.log.header = function() {};
    grunt.task.run(["watch"]);
  });

  grunt.registerTask("lint", ["parallelize:tslint", "jscs", "eslint"]);

  // Disable saucelabs on dev environments by checking if SAUCE_USERNAME is an environment variable
  if (process.env.SAUCE_USERNAME) {
    grunt.registerTask("test-travis", ["dev-compile", "test-local", "test-sauce"]);
  } else {
    grunt.registerTask("test-travis", ["dev-compile", "test-local"]);
  }

  // Tooling
  grunt.registerTask("sublime", ["shell:sublime", "sed:sublime"]);

  grunt.registerTask("update-quicktests", function() {
    var qtJSON = [];
    var rawtests = grunt.file.expand("quicktests/overlaying/tests/**/*.js");
    rawtests.forEach(function(value) {
      qtJSON.push({ path: value });
    });
    qtJSON = JSON.stringify(qtJSON);
    qtJSON = qtJSON.split(",").join(",\n") + "\n";
    grunt.file.write("quicktests/overlaying/list_of_quicktests.json", qtJSON);
  });

};
