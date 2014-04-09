jQuery Simulate Extensions: Drag & Drop
========================================

The drag & drop plugin allows simulation of drags and drops.

The plugin simulates the mouse events for dragging and dropping. It can be used to simulate complex
dragging routes by performing multiple, successive drag simulations (the plugin continues to move
the object around until a drop is simulated or until a drag is simulated on another object).

#### Table of Contents ####
- [Usage](#usage)
- [Options](#options)
	- [drag](#drag)
	- [drop](#drop)
	- [drag-n-drop](#drag-n-drop)
- [Events](#events)
- [iframes](#iframes)

Usage
-----
The `.simulate()` type parameter to simulate drags is `"drag"`, for drops it is `"drop"` and to simulate
a complete drag & drop, it is `"drag-n-drop"`:
- `.simulate("drag", options)`
- `.simulate("drop", options)`
- `.simulate("drag-n-drop", options)`

The drags and drops are simulated for the first element in the jQuery set of matched elements since there
can be only one drag at a time. If there is an active drag on one element and a drag is simulated on another
element, the former drag is ended (i.e. a drop is simulated) before the new drag begins.

Information about the currently active drag can be retrieved using `$.simulate.activeDrag()`. It
returns an object with the following structure:
```javascript
{
	dragElement: target,			// The element which is dragged.
	dragStart: { x: x, y: y },		// The position where the drag started. In case of multiple,
									// successive drags, this is the original start position, i.e.
									// the start position of the first drag that occurred.
	dragDistance: { x: dx, y: dy }	// The distance of the drag. In case of multiple, successive drags,
									// this is the total distance, i.e. the sum of all drag distances
									// that already took place.
									// In other words: the current drag ended/will end at dragStart + dragDistance
}
```

In case of a `"drag"` and a `"drag-n-drop"`, the element on which `.simulate()` is called is the
element which will be dragged, i.e. where the drag begins by simulating a `mousedown` event.
In case of a `"drop"`, the element on which `.simulate()` is called is the element where the drop occurs,
i.e. where the drag ends by simulating a `mouseup` event. If that element is currently dragged or if it
is `document`, the drop will take place at the end position of the current drag without further moving/dragging.
All the mouse events will take place on the center of the corresponding element.

#### Examples: ####
```javascript
// Simple drag-n-drop
$('#draggableDiv').simulate("drag-n-drop", {dx: 50});

// Multiple drags, then drop
$('#draggableDiv').simulate("drag", {dx: 50});
$('#draggableDiv').simulate("drag", {dragTarget: otherDiv});
$('#draggableDiv').simulate("drop");
```

Options
-------
#### `drag`: ####
* __dx__ _{Numeric}_: Distance to be dragged in x-direction in pixels. Default: `0`
* __dy__ _{Numeric}_: Distance to be dragged in y-direction in pixels. Default: `0`
* __dragTarget__ _{DOM Element}_: Alternatively to specifying the distance to be dragged using `dx` and
	`dy`, you can specify a DOM element where the dragging should end. The drag will end on the center
	of the given element. When `dragTarget` is specified, `dx` and `dy` are ignored. Default: `undefined`
* __clickToDrag__ _{Boolean}_: Defines whether the plugin should simulate a whole mouse click instead of
	just a `mousedown` event to start the drag. Should be use in combination with the `clickToDrop`
	option of the `drop` simulation. Default: `false`
* __interpolation__ _{Object}_: Defines the properties for an interpolated drag, i.e. a drag where multiple
	`mousemove` events are generated between the start and the end of the drag. Interpolation allows
	to simulate a more human-like drag. For the interpolation to work, the object needs to define either
	`stepWidth` or `stepCount`. If both are given, `stepCount` is ignored.
	* __stepCount__ _{Numeric}_: Defines the number of steps (interpolation points) to be generated
		between the start and the end of the drag. The width between two interpolation points will
		be calculated based on the total distance of the drag. Default: `0`
	* __stepWidth__ _{Numeric}_: Defines the width in pixels between two interpolation points. 
		When `stepWidth` is given, `stepCount` will be ignored. The number of interpolation points
		will be calculated based on the total distance of the drag. Default: `0`
	* __duration__ _{Numeric}_: Defines the total duration for the simulation of the drag. When using this
		option, the delay between two interpolation steps will be calculated based on the number of steps.
		Default: `0`
	* __stepDelay__ _{Numeric}_: Defines the delay in milliseconds between two interpolation steps.
		When `stepDelay` is greater 0, `duration` will be ignored. Default: `0`
	* __shaky__ _{Numeric|Boolean}_: Allows simulation of a shaky drag. With a shaky drag, the interpolation
		points do not lie perfectly on the line between the start and end point. This makes the drag
		more human-like. The value of the option can either be the number of pixels which the events
		may differ from the exact position (the number applies to both x and y direction; the number is
		treated as a maximum value, i.e. the actual variation is generated randomly in the range `[0;shaky]`
		for each interpolation step) or it can be a boolean where `true` is equal to a value of `1` (pixel)
		and `false` is equal to a value of `0`. Default: `false`
* __callback__ _{Function}_: Callback function which is executed as soon as the simulation of the drag
	is finished.

__Note:__ If interpolation is used and either `stepDelay` or `duration` is greater 0, the simulation of the
events takes place asynchronously, i.e. the call to `.simulate()` returns immediately. To detect when
the simulation is finished, use either the `callback` option or trigger on the `simulate-drag` event
(see [below](#events)).

#### `drop`: ####
* __clickToDrag__ _{Boolean}_: Defines whether the plugin should simulate a whole mouse click instead of
	just a `mouseup` event to end the drag. Should be use in combination with the `clickToDrag` option of
	the `drag` simulation. Default: `false`
* __callback__ _{Function}_:  Callback function which is executed as soon as the simulation of the drop
	is finished.

#### `drag-n-drop`: ####
The `drag-n-drop` simulation accepts all options of both the `drag` and `drop` simulations. However,
the `callback` option behaves like the one from the `drop` simulation and there is one additional option: 
* __dropTarget__ _{DOM Element}_: Additionally to the `dragTarget` option (or `dx` and `dy` options) to
	define an end position of the drag, the `dropTarget` position allows to define an element on whose
	center the drop will be simulated. Basically, this produces the same behavior like this:
	```
	$(dragElement).simulate('drag', {dragTarget: dragTarget});
	$(dropTarget).simulate('drop');
	```
	When `dropTarget` is `undefined`, the drop will occur at the end of the drag. Default: `undefined`

Events
------
The simulation of drag and drop generates the following events:

- drag:
	* `mousedown` (target: dragged element; pageX/Y: center of the dragged element)
	* if the option `clickToDrag` is used, then:
		* `mouseup` (target: dragged element; pageX/Y: center of the dragged element)
		* `click` (target: dragged element; pageX/Y: center of the dragged element)
	* one or more `mousemove` events (depending on the `interpolation` options)
	* `simulate-drag` (target: dragged element)
- for each successive drag on the same element:
	* one or more `mousemove` events (depending on the `interpolation` options)
	* `simulate-drag` (target: dragged element)
- drop:
	* if the element on which the drop is simulated (called "drop element" here) is not the currently dragged element or `document`, then:
		* `mousemove` (target: dragged element if one exists, else drop element; pageX/Y: center of the drop element)
	* if the option `clickToDrop` is used, then:
		* `mousedown` (target: dragged element if one exists, else drop element; pageX/Y: same as the last, simulated `mousemove` event)
	* `mouseup` (target: dragged element if one exists, else drop element; pageX/Y: same as the last, simulated `mousemove` event)
	* if the option `clickToDrop` is used, then:
		* `click` (target: dragged element if one exists, else drop element; pageX/Y: same as the last, simulated `mousemove` event)
	* `simulate-drop` (target: dragged element if one exists, else drop element)

It should be noted that the target of the simulated events can differ from the target of a real
drag & drop:
* The target of the drag start events (`mousedown`, `mouseup`, `click`) is always the element on which the drag is simulated.
	With a real drag, the target would be the topmost, visible element at the position of the `mousedown`.
	To see the difference, imagine the following example of two `div` elements:

	![Two nested divs. The inner div covers the center of the outer div.](https://raw.github.com/j-ulrich/jquery-simulate-ext/master/doc/divs.png)
	
	When a drag is _simulated_ on the `#outerDiv`, the events will target `#outerDiv` while a real drag
	on the center of the `#outerDiv` (black cross in the image) would target the `#innerDiv`. The
	way it is implemented makes the behavior of drag simulations more predictable (you explicitly name the
	element to be dragged and don't get surprised that another element is dragged because it covers the
	center of the element you expect to be dragged).
	If you explicitly want to simulate a drag on the element at a given position, retrieve the element
	using `document.elementFromPoint()` and simulate the drag on that element.
* In some browsers (Chrome, Firefox, Safari?), the target of the `mousemove` event is "different
	from a real drag" if the drag is outside of the viewport of	the browser (which is basically not possible
	to achieve with a real drag). The reason is that in those browsers, the function `document.elementFromPoint()`
	returns `null` when the position is outside of the viewport. In such a case, the events are triggered
	on the dragged element. However, this should be a rare use case.
* The same applies to the target of the drop events if the center of the drop target (or the end
	of the drag) lies outside of the viewport. In such a case, the drop is simulated on either the dragged
	element (if one exists) or the element on which the drop is simulated. Again, this should
	be a rare use case.


#### Example: ####
The plugin generates the following events for the call `$('#myDiv').simulate("drag-n-drop", {dx: -71, dy: 71,interpolation: {stepCount: 2}})`
where center of `#myDiv` is at `(299, 1229)`.

```
mousedown (which: 1)
mousemove (pageX: 275, pageY: 1253)
mousemove (pageX: 252, pageY: 1276)
mousemove (pageX: 228, pageY: 1300)
simulate-drag
mouseup   (which: 1)
click     (which: 1)
simulate-drop
```

iframes
-------
__Note:__ With the [current version](https://github.com/jquery/jquery-ui/blob/485ca7192ac57d018b8ce4f03e7dec6e694a53b7/tests/jquery.simulate.js)
of `jquery.simulate.js`, drag & drop simulation within child-iframes does not work correctly when the parent page is scrolled.
Therefore, the jQuery simulate extended repository contains a fixed version of `jquery.simulate.js` at
[`libs/jquery.simulate.js`](https://github.com/j-ulrich/jquery-simulate-ext/tree/master/libs/jquery.simulate.js).

The plugin supports simulation of drag & drop within child-iframes since version 1.1. For the simulation to work,
it is important that the element in the jQuery object is an element from within the iframe, e.g.:

```javascript
$( window.frames[0].document.getElementById("elementWithinIFrame") ).simulate("drag-n-drop", {dx: 50});
```

However, the plugin does __not__ support drag & drop *between elements from different frames*. The element receiving the
drop events will always be from the same document like the dragged element. If you want to drag & drop
between different frames, you have to bind to the drop events (`mouseup` etc.) in the source iframe and
reproduce them in the target iframe manually.

To trigger on the simulation end events (`simulate-drag` and `simulate-drop`) when simulating on an element
within an iframe, it is necessary to use the same jQuery object which performs the simulation.
For example, consider a parent document which contains a jQuery object called `$p` and an iframe
containing a jQuery object called `$i`. If a drag is simulated on an element within the iframe using
`$p` and we want to trigger on the `simulate-drag` event, we need to use `$p` on the element within
the iframe (or an element above in the DOM of the iframe):

```javascript
// Will work:
$p( elementWithinIFrame ).on("simulate-drag", myTrigger);
// Trigger on an element above in the hierarchy like this:
$p( window.frames[0].document ).on("simulate-drag", myTrigger);

// NOT working:
$i( elementWithinIFrame ).on("simulate-drag", myTrigger);
// NOT working either:
$i( window.frames[0].document ).on("simulate-drag", myTrigger);
// NOT working because the event will not bubble out of the iframe:
$p( document ).on("simulate-drag", myTrigger);
```
In other words: the iframe will not see that the interaction was simulated.

