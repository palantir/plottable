# grunt-parallelize [![Build Status](https://secure.travis-ci.org/teppeis/grunt-parallelize.png?branch=master)](https://travis-ci.org/teppeis/grunt-parallelize) [![Dependency Status](https://david-dm.org/teppeis/grunt-parallelize.png)](https://david-dm.org/teppeis/grunt-parallelize) 

> Make your task parallel.

This plugin divides src files of your task and executes them in parallel.

If your task has too many src files and it's CPU intensive like JSHint, this plugin reduces your build time significantly.

#### Before (36sec to jshint 1640 files)

![Before](https://raw.github.com/teppeis/grunt-parallelize/master/misc/before.png "Before")

#### Parallelize!  (14sec to jshint 1640 files by 4 parallel)

![Parallelize!](https://raw.github.com/teppeis/grunt-parallelize/master/misc/after.png "Parallelize!")

## Getting Started
If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide.
Then you can install this plugin to your project with:

```shell
$ npm install grunt-parallelize --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-parallelize');
```

In your project's Gruntfile, add a section named `parallelize` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  jshint: {
    all: {
      src: './**/*.js'
    }
  },
  parallelize: {
    jshint: {
      // Run jshint:all task with 2 child processes in parallel.
      all: 2
    },
  },
});
```

And just prefix `parallelize:` to your task name.

```shell
# Normal single process
$ grunt jshint:all
Running "jshint:all" (jshint) task
>> 101 files lint free.

Done, without errors.

# Parallelize!
$ grunt parallelize:jshint:all
Running "parallelize:jshint:all" (parallelize) task
    
    Running "jshint:all" (jshint) task
    >> 51 files lint free.
    
    Done, without errors.
    
    Running "jshint:all" (jshint) task
    >> 50 files lint free.
    
    Done, without errors.
    
Done, without errors.
```

### Why grunt-parallelize?

There are concurrent or parallel processing grunt plugins like [grunt-concurrent](https://github.com/sindresorhus/grunt-concurrent) or [grunt-parallel](https://github.com/iammerrick/grunt-parallel).
They execute different tasks in parallel, but this plugin divides a task into multi processes.

## Configuration

### Options

#### options.processes
Type: `Number`

A number of processes.

This is equivalent with the above.
```js
  parallelize: {
    options: {
      processes: 2
    },
    jshint: {
      all: true
    },
  },
```

### Files format

Grunt provides [standard files formats](http://gruntjs.com/configuring-tasks#files) in Gruntfile config.

grunt-parallelize supports "Compact Format" and "Files Array Format".

#### Compact Format

```js
grunt.initConfig({
  jshint: {
    all: {
      src: ['src/foo/*.js', 'src/bar.js']
    }
  },
  parallelize: {
    jshint: {
      all: 2
    },
  },
});
```

#### Files Array Format

```js
grunt.initConfig({
  jshint: {
    all: {
      files: [
        {src: ['src/foo/*.js']},
        {src: ['src/bar.js', 'src/baz.js']},
      ],
    }
  },
  parallelize: {
    jshint: {
      all: 2
    },
  },
});
```
## Thanks

This plugin is inspired by [sindresorhus's grunt-concurrent](https://github.com/sindresorhus/grunt-concurrent). Thanks!

## Release History

* 2013-12-23 v1.0.0 Update dependencies
* 2013-11-22 v0.1.1 Replace deprecated grunt.util methods in grunt-0.4.2
* 2013-09-09 v0.1.0 First release
