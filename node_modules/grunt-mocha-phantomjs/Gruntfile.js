/*
 * grunt-mocha-phantomjs
 * https://github.com/jdcataldo/grunt-mocha-phantomjs
 *
 * Copyright (c) 2013 Justin Cataldo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
        }
      }
    },
    mocha_phantomjs: {
      no_output: {
        options: {
          'reporter': 'dot'
        },
        files: {
          src: ['test/index.html']
        }
      },
      output: {
        options: {
          'reporter': 'xunit',
          'output': 'results/result.xml'
        },
        files: {
          src: ['test/index.html']
        }
      },
      silent: {
        options: {
          'reporter': 'xunit',
          'output': 'results/results_silent.xml',
          'silent': true
        },
        files: {
          src: ['test/index.html']
        }
      },
      server: {
        options: {
          urls: ['http://localhost:8000/test/index.html'],
          'reporter': 'dot'
        }
      },
      coverage: {
        options: {
          urls: ['http://localhost:8000/test-cov/index.html'],
          'reporter': 'json-cov',
          'output': 'results/coverage.json'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['jshint', 'connect', 'mocha_phantomjs']);

};
