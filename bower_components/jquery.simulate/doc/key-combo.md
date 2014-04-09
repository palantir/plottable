jQuery Simulate Extensions: Key Combinations
============================================

The key combinations plugin allows simulation of simultaneous key presses, i.e. key combinations.
Typical examples are `"ctrl+c"`, `"ctrl+v"` or `"shift+a"`.

The plugin simulates the key events for the combination and even inserts the characters into elements
where appropriate (e.g. when the combo is `"shift+a"`, it inserts an `A`).

__Note:__ The insertion of characters works on **all** elements (not only on input and textarea elements).
In case of elements other than input and textarea, the insertion will change the content of the
element using the `textContent` or `innerText` property.

__Note:__ The key-combo plugin requires the key-sequence plugin and bililiteRange.js (can be found in the [libs](https://github.com/j-ulrich/jquery-simulate-ext/tree/master/libs) folder of this repository).

#### Table of Contents ####
- [Usage](#usage)
- [Options](#options)
- [Combo Syntax](#combo-syntax)
- [Events](#events)

Usage
-----
The `.simulate()` type parameter to simulate key combinations is `"key-combo"`: `.simulate("key-combo", options)`

#### Example: ####
```javascript
$('input[name="testInput"]').simulate("key-combo", {combo: "ctrl+shift+a"});
```

Options
-------
* __combo__ _{String}_: A string describing the combination to be simulated. See [below](#combo-syntax)
	for a description of the syntax of the combo string.
* __eventsOnly__ _{Boolean}_: Defines whether the characters shall be inserted into the element. If `true`,
	the characters will not be inserted into the element and the plugin will only simulate the events
	for the key presses. Default: `false`

Combo Syntax
------------
The syntax of the combo string is simple: the keys to be pressed are concatenated with plus characters (`+`)
in between. The key presses are simulated in the order they appear within the string.
For example: `"ctrl+alt+a+b+c"`

As already seen in the example, the plugin supports some modifier keys:
- `"ctrl"`: Control key
- `"alt"`: Alt key (or option key)
- `"shift"`: Shift key
- `"meta"`: Command key on Apple keyboards

The plugin is case-sensitive which means that the `which` property of the `keypress` events is different
for lowercase characters (e.g.: `"a"` gives a value of `97` while `"A"` gives a value of `65`). `keydown`
and `keyup` events are not affected by the case-sensitivity, i.e. they always contain the keycode of
the uppercase character. The only exception from this behavior is when the combo contains the `"shift"`
modifier. In that case, the `which` property always contains the charCode of the uppercase character.

Events
------
The plugin generates the following events to simulate the key combination:

1. It generates one `keydown` event for every key in the combo.
2. If the key corresponding to the last `keydown` event is a printable character, the plugin generates
	one `keypress` event for that key.
3. It generates one `keyup` event for every key in the combo.

This simulated behavior differs from the native behavior that some browsers show. For example,
InternetExplorer and Chrome do not generate keypress events for native key combos that contain the
control or alt (or meta?) modifier. However, unifying the event generation in the plugin makes the
plugin easier to maintain and should generally not be a problem since it's just additional `keypress`
events that are generated.

Although the event generation partly differs from the native behavior, the values of the `keyCode`,
`charCode` and `which` properties of the events should be equal to the corresponding values of
native (i.e. non-simulated) events for all browsers.

#### Example: ####
The plugin generates the following events for the combo `"ctrl+alt+a+f"`:

InternetExplorer and Opera:
```
keydown   (which:  17, keyCode:  17, charCode: undefined, modifiers: ctrl)      // ctrl
keydown   (which:  18, keyCode:  18, charCode: undefined, modifiers: alt+ctrl)  // alt
keydown   (which:  65, keyCode:  65, charCode: undefined, modifiers: alt+ctrl)  // a
keypress  (which:  97, keyCode:  97, charCode: undefined, modifiers: alt+ctrl)  // a
keydown   (which:  70, keyCode:  70, charCode: undefined, modifiers: alt+ctrl)  // f
keypress  (which: 102, keyCode: 102, charCode: undefined, modifiers: alt+ctrl)  // f
keyup     (which:  70, keyCode:  70, charCode: undefined, modifiers: alt+ctrl)  // f
keyup     (which:  65, keyCode:  65, charCode: undefined, modifiers: alt+ctrl)  // a
keyup     (which:  18, keyCode:  18, charCode: undefined, modifiers: ctrl)      // alt
keyup     (which:  17, keyCode:  17, charCode: undefined)                       // ctrl
```

Firefox:
```
keydown   (which:  17, keyCode:  17, charCode:         0, modifiers: ctrl)      // ctrl
keydown   (which:  18, keyCode:  18, charCode:         0, modifiers: alt+ctrl)  // alt
keydown   (which:  65, keyCode:  65, charCode:         0, modifiers: alt+ctrl)  // a
keypress  (which:  97, keyCode:  97, charCode:        97, modifiers: alt+ctrl)  // a
keydown   (which:  70, keyCode:  70, charCode:         0, modifiers: alt+ctrl)  // f
keypress  (which: 102, keyCode: 102, charCode:       102, modifiers: alt+ctrl)  // f
keyup     (which:  70, keyCode:  70, charCode:         0, modifiers: alt+ctrl)  // f
keyup     (which:  65, keyCode:  65, charCode:         0, modifiers: alt+ctrl)  // a
keyup     (which:  18, keyCode:  18, charCode:         0, modifiers: ctrl)      // alt
keyup     (which:  17, keyCode:  17, charCode:         0)                       // ctrl
```

Chrome:
```
keydown   (which:  17, keyCode:  17, charCode: undefined, modifiers: ctrl)      // ctrl
keydown   (which:  18, keyCode:  18, charCode: undefined, modifiers: alt+ctrl)  // alt
keydown   (which:  65, keyCode:  65, charCode: undefined, modifiers: alt+ctrl)  // a
keypress  (which:  97, keyCode:  97, charCode:        97, modifiers: alt+ctrl)  // a
keydown   (which:  70, keyCode:  70, charCode: undefined, modifiers: alt+ctrl)  // f
keypress  (which: 102, keyCode: 102, charCode:       102, modifiers: alt+ctrl)  // f
keyup     (which:  70, keyCode:  70, charCode: undefined, modifiers: alt+ctrl)  // f
keyup     (which:  65, keyCode:  65, charCode: undefined, modifiers: alt+ctrl)  // a
keyup     (which:  18, keyCode:  18, charCode: undefined, modifiers: ctrl)      // alt
keyup     (which:  17, keyCode:  17, charCode: undefined)                       // ctrl
```