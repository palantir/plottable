/*
 * grunt-parallelize
 * https://github.com/teppeis/grunt-parallelize
 *
 * Copyright (c) 2013 Teppei Sato <teppeis@gmail.com>
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'lib/*.js',
        '<%= mochaTest.src %>',
      ]
    },

    // Configuration to be run (and then tested).
    parallelize: {
      jshint: {
        options: {
          processes: 2
        },
        all: 2
      },
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['test/*_test.js'],
    },

    watch: {
      test: {
        files: [
          '<%= jshint.all %>',
          'test/**/*'
        ],
        tasks: ['jshint', 'test']
      },
    },

  });

  // Display the elapsed time.
  require('time-grunt')(grunt);

  // Actually load this plugin's tasks.
  grunt.loadTasks('tasks');

  // Load necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Register tasks.
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['parallelize:jshint:all', 'test']);
};
