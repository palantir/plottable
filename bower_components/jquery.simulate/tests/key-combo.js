/*jslint white: true vars: true browser: true todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true $:true */

(function ($, undefined) {
	"use strict";

$(document).ready(function() {
	
	module("key-combo", {
		setup: function() {
			tests.testSetup();
			$('#textInput').val("");
		},
		teardown: function() {
			tests.testTearDown();
		}
	});
	
	//####### Test Functions #######
	test("simple combo", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)},
			/* S */ {type: "keydown", keyCode: 83}, {type: "keypress", which: "S".charCodeAt(0)},
			/* d */ {type: "keydown", keyCode: 68}, {type: "keypress", which: "d".charCodeAt(0)},
			/* F */ {type: "keydown", keyCode: 70}, {type: "keypress", which: "F".charCodeAt(0)},
			/* F */ {type: "keyup", keyCode: 70},
			/* d */ {type: "keyup", keyCode: 68},
			/* S */ {type: "keyup", keyCode: 83},
			/* a */ {type: "keyup", keyCode: 65}
		];
		
		testElement.simulate("key-combo", {combo: "a+S+d+F"});
		
		strictEqual(testElement.val(), "aSdF", "Verify result of sequence");
	});

	test("events only", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* a */ {type: "keydown", keyCode: 65}, {type: "keypress", which: "a".charCodeAt(0)},
			/* S */ {type: "keydown", keyCode: 83}, {type: "keypress", which: "S".charCodeAt(0)},
			/* d */ {type: "keydown", keyCode: 68}, {type: "keypress", which: "d".charCodeAt(0)},
			/* F */ {type: "keydown", keyCode: 70}, {type: "keypress", which: "F".charCodeAt(0)},
			/* F */ {type: "keyup", keyCode: 70},
			/* d */ {type: "keyup", keyCode: 68},
			/* S */ {type: "keyup", keyCode: 83},
			/* a */ {type: "keyup", keyCode: 65}
		];
		
		testElement.simulate("key-combo", {combo: "a+S+d+F", eventsOnly: true});
		
		strictEqual(testElement.val(), "", "Verify result of sequence");
	});

	test("modifiers", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* ctrl */	{type: "keydown", keyCode: 17, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* shift */	{type: "keydown", keyCode: 16, ctrlKey: true, shiftKey: true, altKey: false, metaKey: false},
			/* alt */	{type: "keydown", keyCode: 18, ctrlKey: true, shiftKey: true, altKey: true, metaKey: false},
			/* meta */	{type: "keydown", keyCode: 91, ctrlKey: true, shiftKey: true, altKey: true, metaKey: true},
			/* a */		{type: "keydown", keyCode: 65, ctrlKey: true, shiftKey: true, altKey: true, metaKey: true}, {type: "keypress", which: 65, ctrlKey: true, shiftKey: true, altKey: true, metaKey: true},
			/* a */		{type: "keyup", keyCode: 65, ctrlKey: true, shiftKey: true, altKey: true, metaKey: true},
			/* meta */	{type: "keyup", keyCode: 91, ctrlKey: true, shiftKey: true, altKey: true, metaKey: false},
			/* alt */	{type: "keyup", keyCode: 18, ctrlKey: true, shiftKey: true, altKey: false, metaKey: false},
			/* shift */	{type: "keyup", keyCode: 16, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* ctrl */	{type: "keyup", keyCode: 17, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false}
		];
		
		testElement.simulate("key-combo", {combo: "ctrl+shift+alt+meta+a"});
		
		strictEqual(testElement.val(), "", "Verify result of sequence");
	});
	
	
	test("shift", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* shift */	{type: "keydown", keyCode: 16, ctrlKey: false, shiftKey: true, altKey: false, metaKey: false},
			/* a */		{type: "keydown", keyCode: 65, ctrlKey: false, shiftKey: true, altKey: false, metaKey: false}, {type: "keypress", which: "A".charCodeAt(0), ctrlKey: false, shiftKey: true, altKey: false, metaKey: false},
			/* a */		{type: "keyup", keyCode: 65, ctrlKey: false, shiftKey: true, altKey: false, metaKey: false},
			/* shift */	{type: "keyup", keyCode: 16, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false}
		];
		
		testElement.simulate("key-combo", {combo: "shift+a"});
		
		strictEqual(testElement.val(), "A", "Verify result of sequence");
	});

	test("modifier without shift", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* ctrl */	{type: "keydown", keyCode: 17, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* a */		{type: "keydown", keyCode: 65, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false}, {type: "keypress", which: "a".charCodeAt(0), ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* a */		{type: "keyup", keyCode: 65, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* ctrl */	{type: "keyup", keyCode: 17, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false}
		];
		
		testElement.simulate("key-combo", {combo: "ctrl+a"});
		
		strictEqual(testElement.val(), "", "Verify result of sequence");
	});

	test("special character combo", function() {
		var testElement = $('#textInput');
		
		tests.expectedEvents = [
			/* ctrl */	{type: "keydown", keyCode: 17, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* + */		{type: "keydown", keyCode: 187, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false}, {type: "keypress", which: "+".charCodeAt(0), ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* + */		{type: "keyup", keyCode: 187, ctrlKey: true, shiftKey: false, altKey: false, metaKey: false},
			/* ctrl */	{type: "keyup", keyCode: 17, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false}
		];
		
		testElement.simulate("key-combo", {combo: "ctrl++"});
		
		strictEqual(testElement.val(), "", "Verify result of sequence");
	});

});
	
}(jQuery));
