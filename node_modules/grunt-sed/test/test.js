var grunt = require('grunt')
  , path = require('path')
  , fs = require('fs')
  , assert = require('assert')
  , testDir = path.join(process.cwd(), 'test')
  , opts = { gruntfile: path.join(testDir, 'Gruntfile.js') }
  , tasks = ['sed']
  , testFilePath = path.join(testDir, 'test.txt')
  , input = ['search', '12-21-2012', 'LOWERCASE', 'YY'].join('\n')
  , output = ['replace', '12-21-endOfWorld', 'lowercase', 'ZZ'].join('\n')

fs.writeFileSync(testFilePath, input);

grunt.tasks(tasks, opts, function() {
  assert.equal(fs.readFileSync(testFilePath), output);

  // clean up
  fs.unlinkSync(testFilePath);
  grunt.log.ok('tests passed');
});
