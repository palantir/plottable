/*jslint white: true vars: true browser: true todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true $:true */

(function ($, undefined) {
	"use strict";

$(document).ready(function() {
	
	module("key-sequence", {
		setup: function() {
			tests.testSetup();
			$(document).on("simulate-keySequence", '#qunit-fixture', tests.assertExpectedEvent);
		},
		
		teardown: function() {
			$(document).off("simulate-keySequence", '#qunit-fixture');
			tests.testTearDown();
		}
	});
	
	//####### Test Functions #######
	test("simple sequence", function() {
		var testElement = $('#textInput');
		
		var testSequence = "fO0BaR1";
		
		tests.expectedEvents = [
			/* f */ {type: "keydown", keyCode: 70}, {type: "keypress", which: "f".charCodeAt(0)}, {type: "keyup", keyCode: 70},
			/* O */ {type: "keydown", keyCode: 79}, {type: "keypress", which: "O".charCodeAt(0)}, {type: "keyup", keyCode: 79},
			/* 0 */ {type: "keydown", keyCode: 48}, {type: "keypress", which: "0".charCodeAt(0)}, {type: "keyup", keyCode: 48},
			/* B */ {type: "keydown", keyCode: 66}, {type: "keypress", which: "B".charCodeAt(0)}, {type: "keyup", keyCode: 66},
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)}, {type: "keyup", keyCode: 65},
			/* R */ {type: "keydown", keyCode: 82}, {type: "keypress", which: "R".charCodeAt(0)}, {type: "keyup", keyCode: 82},
			/* 1 */ {type: "keydown", keyCode: 49}, {type: "keypress", which: "1".charCodeAt(0)}, {type: "keyup", keyCode: 49},
			{type: "simulate-keySequence", sequence: testSequence}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence});
		
		strictEqual(testElement.val(), testSequence, "Verify result of sequence");
	});
	
	test("sequence callback", function() {
		var testElement = $('#textInput');
		
		var testSequence = "test";
		
		tests.expectedEvents = [
			/* t */ {type: "keydown", keyCode: 84}, {type: "keypress", which: "t".charCodeAt(0)}, {type: "keyup", keyCode: 84},
			/* e */ {type: "keydown", keyCode: 69}, {type: "keypress", which: "e".charCodeAt(0)}, {type: "keyup", keyCode: 69},
			/* s */ {type: "keydown", keyCode: 83}, {type: "keypress", which: "s".charCodeAt(0)}, {type: "keyup", keyCode: 83},
			/* t */ {type: "keydown", keyCode: 84}, {type: "keypress", which: "t".charCodeAt(0)}, {type: "keyup", keyCode: 84},
			{type: "simulate-keySequence", sequence: testSequence},
			{type: "callback"}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence, callback: function() {
			tests.assertExpectedEvent({type: "callback"});
		}});
		
	});


	test("no events", function() {
		var testElement = $('#textInput');
		
		var testSequence = "fO0BaR1";
		
		tests.expectedEvents = [
			{type: "simulate-keySequence", sequence: testSequence}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence, triggerKeyEvents: false});
		
		strictEqual(testElement.val(), testSequence, "Verify result of sequence");
	});

	test("special characters", function() {
		var testElement = $('#textInput');
		
		var testSequence = "_-.,;:+!?";
		
		tests.expectedEvents = [
			/* _ */ {type: "keydown", keyCode: 189}, {type: "keypress", which: "_".charCodeAt(0)}, {type: "keyup", keyCode: 189},
			/* - */ {type: "keydown", keyCode: 189}, {type: "keypress", which: "-".charCodeAt(0)}, {type: "keyup", keyCode: 189},
			/* . */ {type: "keydown", keyCode: 190}, {type: "keypress", which: ".".charCodeAt(0)}, {type: "keyup", keyCode: 190},
			/* , */ {type: "keydown", keyCode: 188}, {type: "keypress", which: ",".charCodeAt(0)}, {type: "keyup", keyCode: 188},
			/* ; */ {type: "keydown", keyCode: 186}, {type: "keypress", which: ";".charCodeAt(0)}, {type: "keyup", keyCode: 186},
			/* : */ {type: "keydown", keyCode: 186}, {type: "keypress", which: ":".charCodeAt(0)}, {type: "keyup", keyCode: 186},
			/* + */ {type: "keydown", keyCode: 187}, {type: "keypress", which: "+".charCodeAt(0)}, {type: "keyup", keyCode: 187},
			/* ! */ {type: "keydown", keyCode:  49}, {type: "keypress", which: "!".charCodeAt(0)}, {type: "keyup", keyCode: 49},
			/* ? */ {type: "keydown", keyCode: 191}, {type: "keypress", which: "?".charCodeAt(0)}, {type: "keyup", keyCode: 191},
			{type: "simulate-keySequence", sequence: testSequence}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence});
	});
	
	test("special sequences", function() {
		var testElement = $('#textInput');
		
		var testSequence = "as{selectall}{del}f{leftarrow}{{}b{rightarrow}{backspace}";
		
		tests.expectedEvents = [
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)}, {type: "keyup", keyCode: 65},
			/* s */ {type: "keydown", keyCode: 83}, {type: "keypress", which: "s".charCodeAt(0)}, {type: "keyup", keyCode: 83},
			/* {del} */ {type: "keydown", keyCode: 46}, {type: "keyup", keyCode: 46},
			/* f */ {type: "keydown", keyCode: 70}, {type: "keypress", which: "f".charCodeAt(0)}, {type: "keyup", keyCode: 70},
			/* {leftarrow} */ {type: "keydown", keyCode: 37}, {type: "keyup", keyCode: 37},
			/* { */ {type: "keydown", keyCode: 219}, {type: "keypress", which: "{".charCodeAt(0)}, {type: "keyup", keyCode: 219},
			/* b */ {type: "keydown", keyCode: 66}, {type: "keypress", which: "b".charCodeAt(0)}, {type: "keyup", keyCode: 66},
			/* {rightarrow} */ {type: "keydown", keyCode: 39}, {type: "keyup", keyCode: 39},
			/* {backspace} */ {type: "keydown", keyCode: 8}, {type: "keyup", keyCode: 8},
			{type: "simulate-keySequence", sequence: testSequence}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence});
		
		strictEqual(testElement.val(), "{b", "Verify result of sequence (this is known to fail in IE)");
	});
	
	test("line break", function() {
		var testElement = $('#textInput');
		
		var testSequence = "foo{enter}bar";
		
		tests.expectedEvents = [
			/* f */ {type: "keydown", keyCode: 70}, {type: "keypress", which: "f".charCodeAt(0)}, {type: "keyup", keyCode: 70},
			/* o */ {type: "keydown", keyCode: 79}, {type: "keypress", which: "o".charCodeAt(0)}, {type: "keyup", keyCode: 79},
			/* o */ {type: "keydown", keyCode: 79}, {type: "keypress", which: "o".charCodeAt(0)}, {type: "keyup", keyCode: 79},
			/* {enter} */ {type: "keydown", keyCode: 13}, {type: "keypress", which: 13}, {type: "keyup", keyCode: 13},
			/* b */ {type: "keydown", keyCode: 66}, {type: "keypress", which: "b".charCodeAt(0)}, {type: "keyup", keyCode: 66},
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)}, {type: "keyup", keyCode: 65},
			/* r */ {type: "keydown", keyCode: 82}, {type: "keypress", which: "r".charCodeAt(0)}, {type: "keyup", keyCode: 82},
			{type: "simulate-keySequence", sequence: testSequence}
		];
		
		testElement.simulate("key-sequence", {sequence: testSequence});
		
		strictEqual(testElement.val(), "foo\nbar", "Verify result of sequence (this is known to fail in Opera on Windows)");
	});
	
	test("delay", function() {
		var testElement = $('#textInput');
		
		var keyDelay = 100,
			testSequence = "test",
			lastEventOccurrence;
		
		tests.expectedEvents = [
			/* t */ {type: "keydown", keyCode: 84}, {type: "keypress", which: "t".charCodeAt(0)}, {type: "keyup", keyCode: 84},
			/* e */ {type: "keydown", keyCode: 69}, {type: "keypress", which: "e".charCodeAt(0)}, {type: "keyup", keyCode: 69},
			/* s */ {type: "keydown", keyCode: 83}, {type: "keypress", which: "s".charCodeAt(0)}, {type: "keyup", keyCode: 83},
			/* t */ {type: "keydown", keyCode: 84}, {type: "keypress", which: "t".charCodeAt(0)}, {type: "keyup", keyCode: 84},
			{type: "simulate-keySequence", sequence: testSequence }
		];
		
	
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventDelay(event) {
			var delay = Date.now() - lastEventOccurrence;
			ok(delay >= keyDelay-10, "Verify events occur delayed (delay: "+delay+")"); // keyDelay-10 means tolerance of 10ms
			for (var prop in tests.expectedEvents[0]) {
				if (tests.expectedEvents[0].hasOwnProperty(prop)) {
					strictEqual(event[prop], tests.expectedEvents[0][prop], "Comparing "+prop+" (expected: "+tests.expectedEvents[0][prop]+")");
				}
			}
			if (event.type === tests.expectedEvents[0].type) {
				tests.expectedEvents.shift();
			}
			lastEventOccurrence = Date.now();
		}
		$(document).off("keydown", "#qunit-fixture", tests.assertExpectedEvent).on("keydown", "#qunit-fixture", assertExpectedEventDelay);
		
		stop();
		lastEventOccurrence = Date.now()-keyDelay; // The first key simulated without delay
		
		testElement.simulate("key-sequence", {sequence: testSequence, delay: keyDelay});
		
		setTimeout(function() {
			start();
		},(testSequence.length+2)*keyDelay);

	});
	
	// See issue #6 (https://github.com/j-ulrich/jquery-simulate-ext/issues/6)
	test("delay, spaces in sequence, non-input element", function() {
		var testElement = $('#emptyDiv');
		
		var keyDelay = 5,
			testSequence = "a b c";
		
		tests.expectedEvents = [
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)}, {type: "keyup", keyCode: 65},
			/*   */ {type: "keydown", keyCode: 32}, {type: "keypress", which: " ".charCodeAt(0)}, {type: "keyup", keyCode: 32},
			/* b */ {type: "keydown", keyCode: 66}, {type: "keypress", which: "b".charCodeAt(0)}, {type: "keyup", keyCode: 66},
			/*   */ {type: "keydown", keyCode: 32}, {type: "keypress", which: " ".charCodeAt(0)}, {type: "keyup", keyCode: 32},
			/* c */ {type: "keydown", keyCode: 67}, {type: "keypress", which: "c".charCodeAt(0)}, {type: "keyup", keyCode: 67},
			{type: "simulate-keySequence", sequence: testSequence }
		];

		stop();
		testElement.simulate("key-sequence", {sequence: testSequence, delay: keyDelay,
			callback: function() {
			strictEqual(testElement.text(), testSequence, "Verify result of sequence");
			start();
		}
		});
		


	});

	module("quirk-detection", {
		
	});
	
	asyncTest("quirk detection", 1, function() {
		setTimeout(function() {
			var iFrameDoc = window.frames[0].document;
	
			var jquery = iFrameDoc.createElement('script');
			jquery.src = "../libs/jquery-1.10.2.js";
			iFrameDoc.body.appendChild(jquery);
	
			var bililiteRange = iFrameDoc.createElement('script');
			bililiteRange.src = "../libs/bililiteRange.js";
			iFrameDoc.body.appendChild(bililiteRange);
			
			var jquerySimulate = iFrameDoc.createElement('script');
			jquerySimulate.src = "../libs/jquery.simulate.js";
			iFrameDoc.body.appendChild(jquerySimulate);
			
			var simulateExt = iFrameDoc.createElement('script');
			simulateExt.src = "../src/jquery.simulate.ext.js";
			iFrameDoc.body.appendChild(simulateExt);
	
			var simulateExtKeySequence = iFrameDoc.createElement('script');
			simulateExtKeySequence.src = "../src/jquery.simulate.key-sequence.js";
			iFrameDoc.body.appendChild(simulateExtKeySequence);
			
			setTimeout(function() {
				notStrictEqual(window.frames[0].jQuery.simulate.prototype.quirks.delayedSpacesInNonInputGlitchToEnd, undefined, "Quirk detection was executed");
				start();
			}, 2000);
		}, 1000);
	});
	
	// See issue #9 (https://github.com/j-ulrich/jquery-simulate-ext/issues/9)
	asyncTest("disable quirk detection", 1, function() {
		setTimeout(function() {
			var iFrameDoc = window.frames[0].document;
	
			var jquery = iFrameDoc.createElement('script');
			jquery.src = "../libs/jquery-1.10.2.js";
			iFrameDoc.body.appendChild(jquery);
	
			var bililiteRange = iFrameDoc.createElement('script');
			bililiteRange.src = "../libs/bililiteRange.js";
			iFrameDoc.body.appendChild(bililiteRange);
			
			var jquerySimulate = iFrameDoc.createElement('script');
			jquerySimulate.src = "../libs/jquery.simulate.js";
			iFrameDoc.body.appendChild(jquerySimulate);
			
			setTimeout(function() {
				window.frames[0].jQuery.simulate.ext_disableQuirkDetection = true;
	
				var simulateExt = iFrameDoc.createElement('script');
				simulateExt.src = "../src/jquery.simulate.ext.js";
				iFrameDoc.body.appendChild(simulateExt);
	
				var simulateExtKeySequence = iFrameDoc.createElement('script');
				simulateExtKeySequence.src = "../src/jquery.simulate.key-sequence.js";
				iFrameDoc.body.appendChild(simulateExtKeySequence);
				
				setTimeout(function() {
					strictEqual(window.frames[0].jQuery.simulate.prototype.quirks.delayedSpacesInNonInputGlitchToEnd, undefined, "Quirk detection was disabled");
					start();
				}, 2000);
			}, 2000);
		}, 1000);
	});

});
	
}(jQuery));