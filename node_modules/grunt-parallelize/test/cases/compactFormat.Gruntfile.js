'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    echofilesrc: {
      test_src: {
        src: '../fixtures/*.js',
      }
    },

    parallelize: {
      echofilesrc: {
        test_src: 2,
      }
    }
  });

  // Load this tasks.
  grunt.loadTasks('../../tasks');
  // Load tasks for testing.
  grunt.loadTasks('../tasks');
  // Set defaut task.
  grunt.registerTask('default', ['parallelize:echofilesrc:test_src']);
};
