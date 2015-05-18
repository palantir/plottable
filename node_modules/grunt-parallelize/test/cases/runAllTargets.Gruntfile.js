'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    echofilesrc: {
      test_src: {
        src: '../fixtures/*.js',
      },
      test_filesArray: {
        files: [
          {src: ['../fixtures/*.js']},
        ]
      }
    },

    parallelize: {
      echofilesrc: {
        test_src: 2,
        test_filesArray: 2
      }
    }
  });

  // Load this tasks.
  grunt.loadTasks('../../tasks');
  // Load tasks for testing.
  grunt.loadTasks('../tasks');
  // Set defaut task.
  grunt.registerTask('default', ['parallelize:echofilesrc']);
};
