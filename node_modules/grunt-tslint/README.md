# grunt-tslint [![NPM version](https://badge.fury.io/js/grunt-tslint.png)](http://badge.fury.io/js/grunt-tslint)

> A grunt plugin for [tslint](https://github.com/palantir/tslint).

## Getting Started
This plugin requires [Grunt](http://gruntjs.com/) `~0.4.1`

	npm install grunt-tslint --save-dev

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

	grunt.loadNpmTasks('grunt-tslint');

## The "tslint" task

### Overview
In your project's Gruntfile, add a section named `tslint` to the data object passed into `grunt.initConfig()`.

	grunt.initConfig({
	  tslint: {
	    options: {
    	  // Task-specific options go here.
	    },
	    your_target: {
    	  // Target-specific file lists and/or options go here.
	    },
	  },
	})

### Options

#### options.configuration
Type: `Object`

A JSON configuration object passed into tslint.

### Usage Example

	grunt.initConfig({
	  tslint: {
	    options: {
	      configuration: grunt.file.readJSON("tslint.json")
	    },
	    files: {
	      src: ['src/file1.ts', 'src/file2.ts']
	    }
	  }
	})

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
**0.1.1** Initial Release
