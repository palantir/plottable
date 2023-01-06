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
      threshold: 0,
      reporter: "spec"
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

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jscs: jscsConfig,
    eslint: eslintConfig,
    exec: execConfig,
    watch: watchConfig,
    "blanket_mocha": blanketMochaConfig,
    connect: connectConfig,
  });

  // Loads the tasks specified in package.json
  require("load-grunt-tasks")(grunt);

  grunt.registerTask("dev-compile", [
    "exec:yarn:build:tsc",
    "exec:yarn:build:webpack",
    "update-quicktests"
  ]);

  grunt.registerTask("default", ["exec:yarn:start"]);

  grunt.registerTask("test", ["dev-compile", "test-local"]);
  grunt.registerTask("test-local", ["blanket_mocha"]);

  grunt.registerTask("watch-quicktests", function() {
    // Surpresses the "Running 'foo' task" messages
    grunt.log.header = function() {};
    grunt.task.run(["watch"]);
  });

  grunt.registerTask("lint", ["exec:yarn:lint", "jscs", "eslint"]);

  grunt.registerTask("test-ci", ["dev-compile", "lint", "test-local"]);

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
