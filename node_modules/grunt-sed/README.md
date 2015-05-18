[![build status](https://secure.travis-ci.org/jharding/grunt-sed.png?branch=master)](http://travis-ci.org/jharding/grunt-sed)
grunt-sed
=========

Built on top of [replace][replace], grunt-sed is a Grunt plugin for performing search and replace on files.

[replace]: https://github.com/harthur/replace

Installation
------------

Install grunt-sed using npm:

```
$ npm install grunt-sed
```

Then add this line to your project's *Gruntfile.js*:

```javascript
grunt.loadNpmTasks('grunt-sed');
```

Usage
-----

This plugin is a [multi task][types_of_tasks], meaning that Grunt will automatically iterate over all exec targets if a target is not specified.

[types_of_tasks]: https://github.com/gruntjs/grunt/blob/master/docs/types_of_tasks.md#multi-tasks

### Properties

* `path` - File or directory to search. Defaults to `'.'`.
* `pattern` -  String or regex that will be replaced by `replacement`. **Required**.
* `replacement` - The string that will replace `pattern`. Can be a function. **Required**.
* `recursive` - If `true`, will recursively search directories. Defaults to `false`.

### Example

```javascript
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),

  sed: {
    version: {
      pattern: '%VERSION%',
      replacement: '<%= pkg.version %>',
      recursive: true 
    }
  }
});
```

Testing
-------

```
$ cd grunt-sed
$ npm test
```

Issues
------

Found a bug? Create an issue on GitHub.

https://github.com/jharding/grunt-sed/issues

Versioning
----------

For transparency and insight into the release cycle, releases will be numbered with the follow format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on semantic versioning, please visit http://semver.org/.

License
-------

Copyright (c) 2013 [Jake Harding](http://thejakeharding.com)  
Licensed under the MIT License.
