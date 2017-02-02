/*eslint-env node */

module.exports = function(grunt) {
  "use strict";

  var execConfig = {
    npm: {
      cmd: function (npmCommandName) {
        return "npm run " + npmCommandName;
      }
    }
  };

  var tsConfig = {
    verifyDefinitionFile: {
      src: [
        "plottable.d.ts",
      ],
      options: {
        compiler: "./node_modules/typescript/bin/tsc"
      }
    },
    verifyNpmDefinitionFile: {
      src: [
        "plottable-npm.d.ts",
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

  var sedConfig = {
    versionNumber: {
      pattern: "@VERSION",
      replacement: "<%= pkg.version %>",
      path: "plottable.js"
    }
  };

  var umdConfig = {
    all: {
      src: "plottable.js",
      objectToExport: "Plottable",
      deps: {
        "default": ["d3"],
      }
    },
    npm: {
      src: "plottable.js",
      dest: "plottable-npm.js",
      objectToExport: "Plottable",
      deps: {
        "default": ["d3", "SVGTypewriter"],
        "amd": ["d3", "svg-typewriter"],
        "cjs": ["d3", "svg-typewriter"]
      }
    }
  };

  var concatConfig = {
    header: {
      src: ["license_header.txt", "plottable.js"],
      dest: "plottable.js"
    },
    headerNpm: {
      src: ["license_header.txt", "plottable-npm.js"],
      dest: "plottable-npm.js"
    }
  };

  var tslintConfig = {
    options: {
      configuration: grunt.file.readJSON("tslint.json")
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
      files: ["src/**/*.ts", "webpack.config.plottable.js"]
    },
    tests: {
      tasks: ["test-compile"],
      files: ["test/**/*.ts", "webpack.config.test.js"]
    },
    demo: {
      tasks: ["demo-compile"],
      files: ["demo/**/*.ts"]
    },
    quicktests: {
      tasks: ["update-quicktests"],
      files: ["quicktests/overlaying/tests/**/*.js"]
    }
  };

  var blanketMochaConfig = {
    all: ["test/coverage.html"],
    options: {
      // disable coverage for the time being since we intend to replace grunt-blanket-mocha
      threshold: 0
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

  var FILES_TO_COMMIT = [
    "plottable.js",
    "plottable.min.js",
    "plottable.d.ts",
    "plottable-npm.d.ts",
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
        {src: "plottable.js",       dest: "."},
        {src: "plottable.min.js",   dest: "."},
        {src: "plottable.d.ts",     dest: "."},
        {src: "plottable-npm.js",   dest: "."},
        {src: "plottable-npm.d.ts", dest: "."},
        {src: "plottable.css",      dest: "."},
        {src: "README.md",          dest: "."},
        {src: "LICENSE",            dest: "."},
        {src: ["build/**"],         dest: "."}
      ]
    }
  };

  var uglifyConfig = {
    main: {
      files: {"plottable.min.js": ["plottable.js"]}
    }
  };

  var saucelabsMochaConfig = {
    all: {
      options: {
        urls: ["http://127.0.0.1:9999/test/tests.html"],
        testname: "Plottable Sauce Unit Tests",
        pollInterval: 5000,
        statusCheckAttempts: 60,
        maxRetries: 1,
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
          browserName: "safari",
          platform: "OS X 10.11",
          version: "10.0",
        }]
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
    exec: execConfig,
    parallelize: parallelizeConfig,
    watch: watchConfig,
    "blanket_mocha": blanketMochaConfig,
    connect: connectConfig,
    sed: sedConfig,
    gitcommit: gitcommitConfig,
    compress: compressConfig,
    uglify: uglifyConfig,
    "saucelabs-mocha": saucelabsMochaConfig
  });

  // Loads the tasks specified in package.json
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("test-compile", ["exec:npm:build-test"]);
  grunt.registerTask("src-compile", ["exec:npm:build-src", "generateJS"]);
  grunt.registerTask("demo-compile", ["exec:npm:build-demo"]);

  grunt.registerTask("dev-compile", [
    "src-compile",
    "test-compile",
    "update-quicktests"
  ]);

  grunt.registerTask("generateJS", [
    // adds license_header.txt to plottable.js
    "concat:header",
    // adds license_header.txt to plottable-npm.js
    "concat:headerNpm",
    // replaces plottable.js' @VERSION with package.json's version
    "sed:versionNumber"
  ]);

  grunt.registerTask("release:patch", ["bump:patch", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:minor", ["bump:minor", "dist-compile", "gitcommit:version"]);
  grunt.registerTask("release:major", ["bump:major", "dist-compile", "gitcommit:version"]);

  grunt.registerTask("dist-compile", ["test", "uglify", "compress"]);

  grunt.registerTask("commitjs", ["dist-compile", "gitcommit:built"]);
  grunt.registerTask("default", ["connect", "dev-compile", "demo-compile", "watch-silent"]);

  grunt.registerTask("test", ["dev-compile", "test-local"]);
  grunt.registerTask("test-local", ["blanket_mocha", "ts:verifyDefinitionFile", "ts:verifyNpmDefinitionFile", "lint"]);
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
