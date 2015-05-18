module.exports = function(grunt) {
  grunt.initConfig({
    sed: {
      test1: {
        pattern: 'search'
      , replacement: 'replace'
      , path: 'test.txt'
      }
    , test2: {
        pattern: /\d\d\d\d/
      , replacement: 'endOfWorld'
      , path: 'test.txt'
      }
    , test3: {
        pattern: 'LOWERCASE'
      , replacement: function(match) { return match.toLowerCase(); }
      , path: 'test.txt'
      }
    , test4: {
        pattern: /Y/g
      , replacement: 'Z'
      , path: 'test.txt'
      }
    }
  });

  grunt.loadTasks('../tasks');
};
