# grunt-mocha-phantomjs

> A simple wrapper to run client-side mocha tests using [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/)

[![Build Status](https://travis-ci.org/jdcataldo/grunt-mocha-phantomjs.png)](https://travis-ci.org/jdcataldo/grunt-mocha-phantomjs)

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mocha-phantomjs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mocha-phantomjs');
```

## The "mocha_phantomjs" task

_Run this task with the `grunt mocha_phantomjs` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

[PhantomJS][] is installed when installing using NPM.

[PhantomJS]: http://www.phantomjs.org/

### Options

#### reporter
Type: `String`  
Default: `spec`

The reporter that should be used. See [the supported reporters](https://github.com/metaskills/mocha-phantomjs#supported-reporters) for more information.

#### output
Type: `String`  

The file that the task should output the results to. If `output` is specified, the task will always complete and not throw an error code if errors are found. The CI will determine if the build failed or not.

#### silent
Type: `Boolean`  

Setting `silent` to true will prevent the results from being printed using stdout.


#### urls
Type: `Array`  
Default: `[]`

Absolute `http://` or `https://` urls to be passed to PhantomJS. Specified URLs will be merged with any specified `src` files first. Note that urls must be served by a web server, and since this task doesn't contain a web server, one will need to be configured separately. The [grunt-contrib-connect plugin](https://github.com/gruntjs/grunt-contrib-connect) provides a basic web server.

Additional arguments may be passed. See [mocha-phantomjs's](https://github.com/metaskills/mocha-phantomjs#usage) usage.

### Usage examples

#### Basic usage (CI checks for error code)

```js
// Project configuration.
grunt.initConfig({
  mocha_phantomjs: {
    all: ['test/**/*.html']
  }
});
```

#### File output for CI

```js
// Project configuration.
grunt.initConfig({
  mocha_phantomjs: {
    options: {
      'reporter': 'xunit',
      'output': 'tests/results/result.xml'
    },
    all: ['test/**/*.html']
  }
});
```

#### Local server
Include the [grunt-contrib-connect plugin][] to run a local server
[grunt-contrib-connect plugin]: https://github.com/gruntjs/grunt-contrib-connect

```js
// Project configuration.
grunt.initConfig({
  mocha_phantomjs: {
    all: {
      options: {
        urls: [
          'http://localhost:8000/test/foo.html',
          'http://localhost:8000/test/bar.html'
        ]
      }
    }
  },
  connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
        }
      }
    }
});

grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
```

## Release History

* 2015-02-26   v0.6.1   Add silent option to suppress stdout
* 2014-07-24   v0.6.0   Upgrade mocha-phantomjs to 3.5.0 and drops node 0.8 support
* 2014-05-08   v0.5.0   Upgrade mocha-phantomjs to 3.4.0
* 2014-03-01   v0.4.3   Add lodash and async as dependencies
* 2014-02-18   v0.4.2   Fix to prevent the stream from closing
* 2014-02-18   v0.4.1   Pipe stdout to a file if supplied
* 2014-01-14   v0.4.0   Upgrade mocha-phantomjs to 3.3.0
* 2013-10-31   v0.3.2   Upgrade mocha-phantomjs to 3.2.0
* 2013-10-31   v0.3.1   Added support for --no-color
* 2013-07-05   v0.3.0   Upgrade mocha-phantomjs to 3.1.0
* 2013-04-19   v0.2.8   Fix path to mocha-phantomjs binary on windows when not installed with plugin
* 2013-04-19   v0.2.7   Fixes error thrown when tests pass and no output file specified
* 2013-04-18   v0.2.6   Fix path to mocha-phantomjs binary on windows
* 2013-04-18   v0.2.5   Added an output option to write test results to a file for CI support
* 2013-04-15   v0.2.2   Added exit code to report failed tests with Travis CI
* 2013-04-11   v0.2.1   Added check for existing local install of mocha-phantomjs
* 2013-04-08   v0.2.0   Update phantomjs to 1.9.0 to fix unzipping issue
* 2013-03-27   v0.1.1   Fix to omit urls from being passed to phantomjs
* 2013-03-27   v0.1.0   Initial release supporting all options for mocha-phantomjs


### Notes
This is a very basic implementation of mocha-phantomjs. Failed tests and errors do not bubble up for custom reporting. The idea of this is to be mainly used by a CI and let the CI manage the error reporting.
