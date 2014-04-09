/*global module:false require:true*/
module.exports = function(grunt) {
	"use strict";
	
	var fs = require('fs');
	
	var jshintrcs = {
		tests: JSON.parse(fs.readFileSync('tests/.jshintrc'))
	};

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.contributors[0].name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
				' */',
			'simulate-banner': '/*\n' +
				' * jquery.simulate - simulate browser mouse and keyboard events\n' +
				' * http://jqueryui.com\n' +
				' * \n' +
				' * Copyright 2012 jQuery Foundation and other contributors\n' +
				' * Dual licensed under the MIT or GPL Version 2 licenses.\n' +
				' * http://jquery.org/license\n' +
				'*/'
		},
		lint: {
			src: ['src/*.js', 'libs/jquery.simulate.js'],
			grunt: 'grunt.js',
			tests: ['tests/drag-n-drop.js', 'tests/key-combo.js', 'tests/key-sequence.js', 'tests/testInfrastructure.js']
		},
		qunit: {
			files: ['tests/tests.html']
		},
		concat: {
			'ext-only': {
				src: ['src/jquery.simulate.ext.js', 'src/jquery.simulate.drag-n-drop.js', 'src/jquery.simulate.key-sequence.js', 'src/jquery.simulate.key-combo.js'],
				dest: 'dist/jquery.simulate.ext.<%= pkg.version %>.js'
			},
			complete: {
				src: ['libs/jquery.simulate.js', 'src/jquery.simulate.ext.js', 'src/jquery.simulate.drag-n-drop.js', 'src/jquery.simulate.key-sequence.js', 'src/jquery.simulate.key-combo.js'],
				dest: 'dist/jquery.simulate.ext.<%= pkg.version %>.complete.js'
			}
		},
		min: {
			'ext-only': {
				src: ['<banner:meta.banner>', '<%= concat["ext-only"].dest %>'],
				dest: 'dist/jquery.simulate.ext.<%= pkg.version %>.min.js'
			}
		},
		"multi-banner-min": {
			complete: {
				src: ['<banner:meta.simulate-banner>', 'libs/jquery.simulate.js', '<banner:meta.banner>', '<%= concat["ext-only"].dest %>'],
				dest: 'dist/jquery.simulate.ext.<%= pkg.version %>.complete.min.js'
			}
		},
		watch: {
			files: ['<config:lint.src>', '<config:lint.tests>'],
			tasks: 'lint qunit'
		},
		jshint: {
			options: {
				camelcase: true,
				plusplus: true,
				forin: true,
				noarg: true,
				noempty: true,
				eqeqeq: true,
				bitwise: true,
				strict: true,
				undef: true,
				unused: true,
				curly: true,
				browser: true,
				devel: true,
				white: false,
				onevar: false,
				smarttabs: true
			},
			globals: {
				jQuery: true,
				$: true
			},
			tests: {options: jshintrcs.tests, globals: jshintrcs.tests.globals}
//			tests: {jshintrc: 'tests/.jshintrc'}
		},
		uglify: {}
	});
	
	grunt.registerMultiTask('multi-banner-min', 'Minifies files, each proceeded by a banner', function() {
		var files = grunt.file.expandFiles(this.file.src);

		var output = "";
		function returnEmtpyStr() { return ''; }
		for (var i=0; i < files.length; i+=1) {
			if (i%2 === 0) {
				output += grunt.task.directive(files[i], returnEmtpyStr);
			}
			else {
				output += grunt.helper('uglify', grunt.task.directive(files[i], grunt.file.read), grunt.config('uglify'));
			}
			output += this.data.separator || grunt.utils.linefeed;
		}
		grunt.file.write(this.file.dest, output);

		// Fail task if errors were logged.
		if (this.errorCount) { return false; }

		// Otherwise, print a success message....
		grunt.log.writeln('File "' + this.file.dest + '" created.');

	});

	// Default task.
	grunt.registerTask('default', 'lint qunit concat min multi-banner-min');

};
