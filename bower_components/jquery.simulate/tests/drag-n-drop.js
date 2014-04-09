/*jslint white: true vars: true browser: true todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true $:true */

(function ($, undefined) {
	"use strict";

$(document).ready(function() {
	
	//#################################################################
	//#######                                                   #######
	//#######  NOTE: DO NOT MOVE THE MOUSE DURING THE TESTS !!! #######
	//#######                                                   #######
	//#################################################################

	module("drag-n-drop", {
		setup: function() {
			tests.testSetup();
			$(document).on("simulate-drag simulate-drop", '#qunit-fixture', tests.assertExpectedEvent);
		},
		
		teardown: function() {
			$(document).off("simulate-drag simulate-drop", '#qunit-fixture');
			tests.testTearDown();
			if ($.simulate.activeDrag()) {
				$(document).simulate("drop", {debug: false});
			}
		}
	});
	
	//####### Test Functions #######
	test("drag", function() {
		var testElement = $('#dragArea');
		
		var dragX = 50,
			dragY = 10;
		
		var elementX = Math.round(testElement.offset().left+testElement.outerWidth()/2),
			elementY = Math.round(testElement.offset().top+testElement.outerHeight()/2);
		
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;
		tests.expectedEvents = [
			{type: "mousedown", pageX: elementX, pageY: elementY},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"}
		];
		
		testElement.simulate("drag", {dx: dragX, dy: dragY});
	});
	
	test("drag callback", function() {
		var testElement = $('#dragArea');
		var dragX = 50,
			dragY = 10;
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "callback"}
		];
		
		testElement.simulate("drag", {dx: dragX, dy: dragY, callback: function() {
			tests.assertExpectedEvent({type: "callback"});
		}});
	});

	test("drag on target", function() {
		var testElement = $('#dragArea'),
			dropElement = $('#dropArea');

		var expectedX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			expectedY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"}
		];
		
		testElement.simulate("drag", {dragTarget: dropElement});
	});

	test("drop", function() {
		var testElement = $('#dropArea');
		
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2),
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousemove", pageX: expectedX, pageY: expectedY}, // A drop without an active drag moves the mouse onto the target before dropping
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"}
		];
		
		testElement.simulate("drop");
	});
	
	test("drop callback", function() {
		var testElement = $('#dropArea');
		
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2),
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousemove", pageX: expectedX, pageY: expectedY}, // A drop without an active drag moves the mouse onto the target before dropping
			{type: "mouseup"},
			{type: "simulate-drop"},
			{type: "callback"}
		];
		
		testElement.simulate("drop", {callback: function() {
			tests.assertExpectedEvent({type: "callback"});
		}});
	});
	
	test("drag-n-drop", function() {
		var testElement = $('#dragArea');
		
		var dragX = 50,
			dragY = 10;
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;

		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"}
		];
		
		testElement.simulate("drag-n-drop", {dx: dragX, dy: dragY});
	});
	
	test("drag-n-drop callback", function() {
		var testElement = $('#dragArea');
		
		var dragX = 50,
			dragY = 10;
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;

		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"},
			{type: "callback"}
		];
		
		testElement.simulate("drag-n-drop", {dx: dragX, dy: dragY, callback: function() {
			tests.assertExpectedEvent({type: "callback"});
		}});
	});
	
	test("drag-n-drop on scrolled viewport", function() {
		var testElement = $('#dragArea'),
			dropElement = $('#dropArea');
		
		// Check if we have to move the #qunit-fixture div into the viewport to be able to test this
		if (document.elementFromPoint(-1,-1) === null) {
			$('#qunit-fixture').css({
				top: "auto",
				left: "auto",
				position: "inherit"
			});
			$(document).scrollTop(dropElement.offset().top);
		}
		else {
			$(document).scrollTop(500);
		}
		
		var dragX = 50,
			dragY = Math.round(dropElement.offset().top - testElement.offset().top);
		
		var elementX = Math.round(testElement.offset().left+testElement.outerWidth()/2),
			elementY = Math.round(testElement.offset().top+testElement.outerHeight()/2);
		
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;
		
		tests.expectedEvents = [
			{type: "mousedown", pageX: elementX, pageY: elementY},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY, target: dropElement[0]},
			{type: "simulate-drop"}
		];
		
		testElement.simulate("drag-n-drop", {dx: dragX, dy: dragY});
		
		// Reset #qunit-fixture
		$('#qunit-fixture').css({
			top: "",
			left: "",
			position: ""
		});
		$(document).scrollTop(0);
	});

	test("multiple drags, then drop", function() {
		var testElement = $('#dragArea');
		
		var drag = [ {x: 50, y: 10}, {x: 7, y: -30}, {x: -20, y: -5}];
		
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2),
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2);
		
		tests.expectedEvents = [{type: "mousedown"}];
		var i;
		for (i=0; i < drag.length; i+=1) {
			expectedX += drag[i].x;
			expectedY += drag[i].y;
			tests.expectedEvents.push({type: "mousemove", pageX: expectedX, pageY: expectedY},
				{type: "simulate-drag"});
		}
		tests.expectedEvents.push({type: "mouseup", pageX: expectedX, pageY: expectedY}, {type: "simulate-drop"});
			
		
		for (i=0; i < drag.length; i+=1) {
			testElement.simulate("drag", {dx: drag[i].x, dy: drag[i].y});
		}
		testElement.simulate("drop");
	});
	
	test("drag on target, then drop", function() {
		var testElement = $('#dragArea'),
			dropElement = $('#dropArea');

		var expectedX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			expectedY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"}
		];
		
		testElement.simulate("drag", {dragTarget: dropElement});
		testElement.simulate("drop");
	});

	test("drag, then drop on different target", function() {
		var dragElement = $('#dragArea'),
			dropElement = $('#dropArea');
		
		var dx = 10,
			dy = 20;

		var endOfDragX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2)+dx,
			endOfDragY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2)+dy,
			dropX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			dropY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: endOfDragX, pageY: endOfDragY},
			{type: "simulate-drag"},
			{type: "mousemove", pageX: dropX, pageY: dropY},
			{type: "mouseup", pageX: dropX, pageY: dropY},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag", {dx: dx, dy: dy});
		dropElement.simulate("drop");
	});

	test("drop before another drag", function() {
		var dragElement1 = $('#dragArea'),
			dragElement2 = $('#dropArea');
		
		var drag1X = 10,
			drag1Y = 5,
			drag2X = 50,
			drag2Y = 10;
		
		var expected1X = Math.round(dragElement1.offset().left+dragElement1.outerWidth()/2)+drag1X,
			expected1Y = Math.round(dragElement1.offset().top+dragElement1.outerHeight()/2)+drag1Y,
			expected2X = Math.round(dragElement2.offset().left+dragElement2.outerWidth()/2)+drag2X,
			expected2Y = Math.round(dragElement2.offset().top+dragElement2.outerHeight()/2)+drag2Y;
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expected1X, pageY: expected1Y},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expected1X, pageY: expected1Y},
			{type: "simulate-drop"},
			{type: "mousedown"},
			{type: "mousemove", pageX: expected2X, pageY: expected2Y},
			{type: "simulate-drag"}
		];
		
		dragElement1.simulate("drag", {dx: drag1X, dy: drag1Y});
		dragElement2.simulate("drag", {dx: drag2X, dy: drag2Y});
	});

	
	test("move before drop", function() {
		var dragElement = $('#dragArea'),
			dropElement = $('#dropArea');
		
		var expectedX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			expectedY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "simulate-drag"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "mouseup"},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag");
		dropElement.simulate("drop");
	});

	test("document drop", function() {
		var dragElement = $('#dragArea');
		
		var dx = 17,
			dy = 102;
		
		var expectedX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2)+dx,
			expectedY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2)+dy;
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag", {dx: dx, dy: dy});
		$(document).simulate("drop");
	});

	test("drag-n-drop on target", function() {
		var dragElement = $('#dragArea'),
			dropElement = $('#dropArea');
		
		var expectedX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			expectedY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag-n-drop", {dropTarget: dropElement});
	});

	test("drag-n-drop with drag and drop target", function() {
		var dragElement = $('#dragArea'),
			dropElement = $('#dropArea');
		
		var dx = 10,
			dy = -132;
		
		var dragX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2)+dx,
			dragY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2)+dy,
			dropX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			dropY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: dragX, pageY: dragY},
			{type: "simulate-drag"},
			{type: "mousemove", pageX: dropX, pageY: dropY},
			{type: "mouseup", pageX: dropX, pageY: dropY},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag-n-drop", {dx: dx, dy: dy, dropTarget: dropElement});
	});

	test("drag-n-drop with drag target and drop target", function() {
		var dragElement = $('#dragArea'),
			dragTarget = $('#dropArea'),
			dropElement = $('#dropArea2');
		
		var dragX = Math.round(dragTarget.offset().left+dragTarget.outerWidth()/2),
			dragY = Math.round(dragTarget.offset().top+dragTarget.outerHeight()/2),
			dropX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
			dropY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);
		
		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mousemove", pageX: dragX, pageY: dragY},
			{type: "simulate-drag"},
			{type: "mousemove", pageX: dropX, pageY: dropY},
			{type: "mouseup", pageX: dropX, pageY: dropY},
			{type: "simulate-drop"}
		];
		
		dragElement.simulate("drag-n-drop", {dragTarget: dragTarget, dropTarget: dropElement});
	});

	test("interpolated drag", function() {
		var dragElement = $('#dragArea');
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 5,
			dragX = 60,
			dragY = 40;
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: Math.round(dragStartX+i*dragX/(stepCount+1)), pageY: Math.round(dragStartY+i*dragY/(stepCount+1)) });
		}
		tests.expectedEvents.push(
			{type: "mousemove", pageX: dragStartX+dragX, pageY: dragStartY+dragY },
			{type: "simulate-drag"}
		);
		
		dragElement.simulate("drag", {dx: dragX, dy: dragY, interpolation: {stepCount: stepCount}});
	});
	
	test("interpolated drag across elements", function() {
		var dragElement = $('#dragArea'),
			dragTarget = $('#dropArea');
		
		// Check if we have to move the #qunit-fixture div into the viewport to be able to test this
		if (document.elementFromPoint(-1,-1) === null) {
			$('#qunit-fixture').css({
				top: "auto",
				left: "auto",
				position: "inherit"
			});
			$(document).scrollTop(dragTarget.offset().top);
		}

		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2),
			dragEndX = Math.round(dragTarget.offset().left+dragTarget.outerWidth()/2),
			dragEndY = Math.round(dragTarget.offset().top+dragTarget.outerHeight()/2);
		
		var stepCount = 5,
			dragX = dragEndX - dragStartX,
			dragY = dragEndY - dragStartY,
			eventTarget = dragElement[0],
			eventX,
			eventY;
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount; i+=1) {
			eventX = Math.round(dragStartX+i*dragX/(stepCount+1));
			eventY = Math.round(dragStartY+i*dragY/(stepCount+1));
			if (eventX >= dragTarget.offset().left && eventY >= dragTarget.offset().top) {
				eventTarget = dragTarget[0];
			}
			tests.expectedEvents.push({type: "mousemove", pageX: eventX, pageY: eventY, target: eventTarget});
		}
		tests.expectedEvents.push(
			{type: "mousemove", pageX: dragStartX+dragX, pageY: dragStartY+dragY },
			{type: "simulate-drag"}
		);
		
		dragElement.simulate("drag", {dragTarget: dragTarget, interpolation: {stepCount: stepCount}});
		
		// Reset #qunit-fixture
		$('#qunit-fixture').css({
			top: "",
			left: "",
			position: ""
		});
		$(document).scrollTop(0);
	});

	test("interpolated drag using stepWidth", function() {
		var dragElement = $('#dragArea');
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			stepWidth = 30,
			dragWidth = (stepCount+1)*stepWidth;
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push({type: "simulate-drag"});
		
		dragElement.simulate("drag", {dx: dragWidth, interpolation: {stepWidth: stepWidth}});
	});

	test("interpolated drag using stepCount", function() {
		var dragElement = $('#dragArea');
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			dragWidth = 90,
			stepWidth = dragWidth / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push({type: "simulate-drag"});
		
		dragElement.simulate("drag", {dx: dragWidth, interpolation: {stepCount: stepCount}});
	});

	test("interpolated, shaky drag", function() {
		var dragElement = $('#dragArea');
		var actualYPositions = [];
		
		var shakyAmplitude = 10;
		
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventShaky(event) {
			if (tests.expectedEvents.length === 0) {
				ok(false, "Unexpected event: "+event.type);
				return;
			}
			for (var prop in tests.expectedEvents[0]) {
				if (tests.expectedEvents[0].hasOwnProperty(prop)) {
					if (prop === "pageX" || prop === "pageY") {
						QUnit.close(event[prop], tests.expectedEvents[0][prop], shakyAmplitude, "Comparing "+prop+" (expected: "+tests.expectedEvents[0][prop]+"±"+shakyAmplitude+")");
						if (prop === "pageY") {
							actualYPositions[event[prop]] = actualYPositions[event[prop]]+1 || 1;
						}
					}
					else {
						strictEqual(event[prop], tests.expectedEvents[0][prop], "Comparing "+prop+" (expected: "+tests.expectedEvents[0][prop]+")");
					}
				}
			}
			if (event.type === tests.expectedEvents[0].type) {
				tests.expectedEvents.shift();
			}

		}
		$(document).off("mousemove", "#qunit-fixture", tests.assertExpectedEvent).on("mousemove", "#qunit-fixture", assertExpectedEventShaky);
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			dragWidth = 90,
			stepWidth = dragWidth / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		var i;
		for (i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push({type: "simulate-drag"});
		
		dragElement.simulate("drag", {dx: dragWidth, interpolation: {stepCount: stepCount, shaky: shakyAmplitude}});
		
		var posCounter = 0;
		for (i in actualYPositions) {
			if (actualYPositions.hasOwnProperty(i)) {
				posCounter += 1;
			}
		}
		ok(posCounter > 1, "Verify shaky positions are random (if this test fails, rerun to rule out the unlikely case that all random positions were equal)");
		
	});

	
	test("interpolated, delayed drag", function() {
		var dragElement = $('#dragArea');
		
		var stepDelay = 100,
			lastEventOccurrence;
		
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventDelay(event) {
			var delay = Date.now() - lastEventOccurrence;
			ok(delay >= stepDelay-10, "Verify events occur delayed (delay: "+delay+")"); // stepDelay-10 means tolerance of 10ms
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
			lastEventOccurrence = Date.now();
		}
		$(document).off("mousemove", "#qunit-fixture", tests.assertExpectedEvent).on("mousemove", "#qunit-fixture", assertExpectedEventDelay);
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			dragWidth = 90,
			stepWidth = dragWidth / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push({type: "simulate-drag"});
		
		stop();
		lastEventOccurrence = Date.now();
		dragElement.simulate("drag", {dx: dragWidth, interpolation: {stepCount: stepCount, stepDelay: stepDelay}});
		
		setTimeout(function() {
			start();
		},(stepCount+2)*stepDelay);
	});

	test("interpolated, delayed drag using duration", function() {
		var dragElement = $('#dragArea');
		
		var stepDelay = 100,
			lastEventOccurrence;
		
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventDelay(event) {
			var delay = Date.now() - lastEventOccurrence;
			ok(delay >= stepDelay-10, "Verify events occur delayed (delay: "+delay+")"); // stepDelay-10 means tolerance of 10ms
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
			lastEventOccurrence = Date.now();
		}
		$(document).off("mousemove", "#qunit-fixture", tests.assertExpectedEvent).on("mousemove", "#qunit-fixture", assertExpectedEventDelay);
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			dragWidth = 90,
			stepWidth = dragWidth / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push({type: "simulate-drag"});
		
		stop();
		lastEventOccurrence = Date.now();
		dragElement.simulate("drag", {dx: dragWidth, interpolation: {stepCount: stepCount, duration: (stepCount+1)*stepDelay}});
		
		setTimeout(function() {
			start();
		},(stepCount+2)*stepDelay);
	});

	test("interpolated, delayed drag-n-drop", function() {
		var dragElement = $('#dragArea');
		
		var stepDelay = 100,
			lastEventOccurrence;
		
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventDelay(event) {
			var delay = Date.now() - lastEventOccurrence;
			ok(delay >= stepDelay-10, "Verify events occur delayed (delay: "+delay+")"); // stepDelay-10 means tolerance of 10ms
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
			lastEventOccurrence = Date.now();
		}
		$(document).off("mousemove", "#qunit-fixture", tests.assertExpectedEvent).on("mousemove", "#qunit-fixture", assertExpectedEventDelay);
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2);
		
		var stepCount = 2,
			dragWidth = 90,
			stepWidth = dragWidth / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: dragStartX+i*stepWidth, pageY: dragStartY });
		}
		tests.expectedEvents.push(
			{type: "simulate-drag"},
			{type: "mouseup", pageX: dragStartX+(stepCount+1)*stepWidth, pageY: dragStartY},
			{type: "simulate-drop"}
		);
		
		stop();
		lastEventOccurrence = Date.now();
		dragElement.simulate("drag-n-drop", {dx: dragWidth, interpolation: {stepCount: stepCount, stepDelay: stepDelay}});
		
		setTimeout(function() {
			start();
		},(stepCount+2)*stepDelay);
	});

	test("interpolated, delayed drag-n-drop on target", function() {
		var dragElement = $('#dragArea'),
			dropTarget = $('#dropArea');
		
		var stepDelay = 100,
			lastEventOccurrence;
		
		// Unbind "normal" assertExpectedEvent function and replace with a fuzzy variant of it
		function assertExpectedEventDelay(event) {
			var delay = Date.now() - lastEventOccurrence;
			ok(delay >= stepDelay-10, "Verify events occur delayed (delay: "+delay+")"); // stepDelay-10 means tolerance of 10ms
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
			lastEventOccurrence = Date.now();
		}
		$(document).off("mousemove", "#qunit-fixture", tests.assertExpectedEvent).on("mousemove", "#qunit-fixture", assertExpectedEventDelay);
		
		var dragStartX = Math.round(dragElement.offset().left+dragElement.outerWidth()/2),
			dragStartY = Math.round(dragElement.offset().top+dragElement.outerHeight()/2),
			dragEndX = Math.round(dropTarget.offset().left+dropTarget.outerWidth()/2),
			dragEndY = Math.round(dropTarget.offset().top+dropTarget.outerHeight()/2);
		
		var stepCount = 2,
			stepWidthX = (dragEndX - dragStartX) / (stepCount+1),
			stepWidthY = (dragEndY - dragStartY) / (stepCount+1);
		
		tests.expectedEvents = [{type: "mousedown"}];
		for (var i=1; i <= stepCount+1; i+=1) {
			tests.expectedEvents.push({type: "mousemove", pageX: Math.round(dragStartX+i*stepWidthX), pageY: Math.round(dragStartY+i*stepWidthY) });
		}
		tests.expectedEvents.push(
			{type: "simulate-drag"},
			{type: "mouseup", pageX: dragEndX, pageY: dragEndY},
			{type: "simulate-drop"}
		);
		
		stop();
		lastEventOccurrence = Date.now();
		dragElement.simulate("drag-n-drop", {dropTarget: dropTarget, interpolation: {stepCount: stepCount, stepDelay: stepDelay}});
		
		setTimeout(function() {
			start();
		},(stepCount+2)*stepDelay);
	});
	
	test("drag-n-drop within iFrame", function() {
		
		function actualTest() {
			var iFrameDoc = window.frames[0].document,
				dragElement = $(iFrameDoc.getElementById("iframe-dragArea")),
				dropElement = $(iFrameDoc.getElementById("iframe-dropArea"));
		
			$(document).off("keyup keydown keypress mousedown mouseup mousemove simulate-drag simulate-drop", '#qunit-fixture', tests.assertExpectedEvent);
			$(iFrameDoc).on("keyup keydown keypress mousedown mouseup mousemove simulate-drag simulate-drop", 'body', tests.assertExpectedEvent);

			var expectedX = Math.round(dropElement.offset().left+dropElement.outerWidth()/2),
				expectedY = Math.round(dropElement.offset().top+dropElement.outerHeight()/2);

			tests.expectedEvents = [
				{type: "mousedown"},
				{type: "mousemove", pageX: expectedX, pageY: expectedY},
				{type: "simulate-drag"},
				{type: "mouseup", pageX: expectedX, pageY: expectedY},
				{type: "simulate-drop"}
			];

			$(dragElement).simulate("drag-n-drop", {dropTarget: dropElement});

			$(iFrameDoc).off("keyup keydown keypress mousedown mouseup mousemove simulate-drag simulate-drop", tests.assertExpectedEvent);
		}
		
		// Delay test until iframe is loaded
		stop();
		function delayUntilIFrameLoad() {
			var iFrameDoc = window.frames[0].document,
				dropElement = $(iFrameDoc.getElementById("iframe-dropArea"));
			
			if (dropElement.length !== 0) {
				$(document).scrollTop(500);
				actualTest();
				$(document).scrollTop(0);
				start();
			}
			else {
				setTimeout(delayUntilIFrameLoad, 100);
			}
		}
		delayUntilIFrameLoad();
	});
	
	test("clickToDrag / clickToDrop", function() {
		var testElement = $('#dragArea');
		
		var dragX = 50,
			dragY = 10;
		var expectedX = Math.round(testElement.offset().left+testElement.outerWidth()/2)+dragX,
			expectedY = Math.round(testElement.offset().top+testElement.outerHeight()/2)+dragY;

		tests.expectedEvents = [
			{type: "mousedown"},
			{type: "mouseup"},
			{type: "click"},
			{type: "mousemove", pageX: expectedX, pageY: expectedY},
			{type: "simulate-drag"},
			{type: "mousedown"},
			{type: "mouseup", pageX: expectedX, pageY: expectedY},
			{type: "click"},
			{type: "simulate-drop"}
		];
		
		testElement.simulate("drag-n-drop", {dx: dragX, dy: dragY, clickToDrag: true, clickToDrop: true});
	});


});
	
}(jQuery));