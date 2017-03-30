/*eslint-env node */

module.exports = function(grunt) {
  "use strict";

  // run an arbitrary yarn command through grunt, e.g. grunt exec:yarn:build:test -> yarn run build:test
  var execConfig = {
    yarn: {
      cmd: function () {
        var yarnCommandName = Array.prototype.slice.call(arguments).join(":");
        return "yarn run " + yarnCommandName;
      }
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

  var watchConfig = {
    options: {
      livereload: true,
      spawn: false
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
          version: "11",
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
    jscs: jscsConfig,
    eslint: eslintConfig,
    exec: execConfig,
    watch: watchConfig,
    "blanket_mocha": blanketMochaConfig,
    connect: connectConfig,
    "saucelabs-mocha": saucelabsMochaConfig
  });

  // Loads the tasks specified in package.json
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("dev-compile", [
    "exec:yarn:build",
    "update-quicktests"
  ]);

  grunt.registerTask("default", ["exec:yarn:start"]);

  grunt.registerTask("test", ["dev-compile", "test-local"]);
  grunt.registerTask("test-local", ["blanket_mocha", "lint"]);
  grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);

  grunt.registerTask("watch-quicktests", function() {
    // Surpresses the "Running 'foo' task" messages
    grunt.log.header = function() {};
    grunt.task.run(["watch"]);
  });

  grunt.registerTask("lint", ["jscs", "eslint"]);

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
