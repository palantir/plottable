jQuery Simulate
===============

The jQuery simulate plugin allows to simulate user interaction using mouse and key events.

#### Table of Contents ####
- [Usage](#usage)
- [Options](#options)
	- [Key Events](#key-events)
	- [Mouse Events](#mouse-events)

Usage
-----
The simulations are executed by calling the `.simulate()` function on a jQuery object. The simulation
is then executed on all elements in the collection of the jQuery object.

- Synopsis: `.simulate(type, options)`
- Parameters:
	* __type__ _{String}_: The type of the interaction to be simulated.
	* __options__ _{Object}_: An option object containing the options for the action to be simulated.
		Default: `undefined`

The possible types of simulated actions are:

- From the simulate plugin:
	- Mouse Events: `"mousemove"`, `"mousedown"`, `"mouseup"`, `"click"`, `dblclick"`,
		`"mouseover"`, `"mouseout"`, `"mouseenter"`, `"mouseleave"`, `"contextmenu"`
	- Key Events: `"keydown"`, `"keyup"`, `"keypress"`
	- `"focus"`
	- `"blur"`
- From the simulate-ext plugins:
	- Drag & Drop: `"drag-n-drop"`, `"drag"`, `"drop"`
	- `"key-sequence"`
	- `"key-combo"`

Some of the simulated actions also trigger default actions (`"click"`, `"focus"` and `"blur"`) while
the others do not (e.g. neither `"keypress"` nor `"keyup"` will insert a character into an input or
textarea element). It also depends on the used browser whether the default action will be triggered.
However, at least for the character insertions, the `key-sequence` plugin from simulate-ext provides
simulation of key presses including insertion of characters. 

Options
-------
For the options of the simulate-ext plugins, see other files in the [doc folder](https://github.com/j-ulrich/jquery-simulate-ext/tree/master/doc).

#### Key Events: ####
For more information about the options, see https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent.
* __bubbles__ _{Boolean}_: Defines whether the event bubbles up the DOM tree. Default: `true`
* __cancelable__ _{Boolean}_: Defines whether the default action of the event can be canceled. Default: `true`
* __keyCode__ _{Numeric}_: The key code of the key to be pressed. The key code depends on the browser
	being used. Default: `0`
* __charCode__ _{Numeric}_: The character code of the key to be pressed. This property is required
	for some combinations of browser and key event. Default: `undefined`
	
__Note:__ For more information about the `keyCode` and `charCode` properties, see http://unixpapa.com/js/key.html.
	
* __ctrlKey__ _{Boolean}_: Defines whether the control modifier should be marked as pressed. Default: `false`
* __shiftKey__ _{Boolean}_: Defines whether the shift modifier should be marked as pressed. Default: `false`
* __altKey__ _{Boolean}_: Defines whether the alt modifier should be marked as pressed. Default: `false`
* __metaKey__ _{Boolean}_: Defines whether the meta modifier should be marked as pressed. Default: `false`

__Note:__ If you want to simulate a real key combination (i.e. including the simulation of the key presses
of the modifier keys), you should use the `key-combo` plugin instead.


#### Mouse Events: ####
For more information about the options, see https://developer.mozilla.org/en-US/docs/DOM/MouseEvent.
* __bubbles__ _{Boolean}_: Defines whether the event bubbles up the DOM tree. Default: `true`
* __cancelable__ _{Boolean}_: Defines whether the default action of the event can be canceled.
	Default: `true` for all events except `mousemove`, for `mousemove` it's `false`
* __clientX__ _{Numeric}_: The x position where the event is simulated, relative to the upper left corner
	of the browser viewport. Default: `1`
* __clientY__ _{Numeric}_: The y position where the event is simulated, relative to the upper left corner
	of the browser viewport. Default: `1`
* __button__ _{Numeric}_: The mouse button which should be marked as pressed. Default: `0` (i.e. left mouse button)
* __ctrlKey__ _{Boolean}_: Defines whether the control modifier should be marked as pressed. Default: `false`
* __shiftKey__ _{Boolean}_: Defines whether the shift modifier should be marked as pressed. Default: `false`
* __altKey__ _{Boolean}_: Defines whether the alt modifier should be marked as pressed. Default: `false`
* __metaKey__ _{Boolean}_: Defines whether the meta modifier should be marked as pressed. Default: `false`
	