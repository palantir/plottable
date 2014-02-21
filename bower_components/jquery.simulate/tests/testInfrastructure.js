/*jslint white: true vars: true browser: true todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true $:true */

(function ($, undefined) {
	"use strict";

	//####### Test Infrastructure #######
	// Global object
	window.tests = {
		expectedEvents: [],
		
		assertExpectedEvent: function(event) {
			if (tests.expectedEvents.length === 0) {
				ok(false, "Unexpected event: "+event.type);
				return;
			}
			for (var prop in tests.expectedEvents[0]) {
				if (tests.expectedEvents[0].hasOwnProperty(prop)) {
					strictEqual(event[prop], tests.expectedEvents[0][prop], "Comparing "+prop+" (expected: "+tests.expectedEvents[0][prop]+")");
				}
			}
			if (event.type === tests.expectedEvents[0].type) {
				tests.expectedEvents.shift();
			}
		},
		
		testSetup: function() {
			tests.expectedEvents = [];
			$(document).on("keyup keydown keypress mousedown mouseup mousemove click", '#qunit-fixture', tests.assertExpectedEvent);
		},
		
		testTearDown: function() {
			var event;
			$(document).off("keyup keydown keypress mousedown mouseup mousemove click", '#qunit-fixture');
			while ( (event = tests.expectedEvents.shift()) !== undefined) {
				if (event.type) {
					ok(false, "Missing event: "+event.type);
				}
				else {
					ok(false, "Missing event: "+event);
				}
			}
		}
	};
	
	
}(jQuery));