jQuery Simulate Extensions: Key Sequences
=========================================

The key sequences plugin allows simulation of successive key presses similar to typing text.

The plugin simulates the key events for the text and even inserts the characters into elements.

__Note:__ The insertion of characters works on **all** elements (not only on input and textarea elements).
In case of elements other than input and textarea, the insertion will change the content of the
element using the `textContent` or `innerText` property.

The plugin is based on the sendkeys plugin by Daniel Wachsstock (http://bililite.com/blog/2008/08/20/the-fnsendkeys-plugin/).

__Note:__ The key-sequence plugin requires bililiteRange.js (can be found in the [libs](https://github.com/j-ulrich/jquery-simulate-ext/tree/master/libs) folder of this repository).

#### Table of Contents ####
- [Usage](#usage)
- [Options](#options)
- [Special Sequences](#special-sequences)
- [Events](#events)
- [Special Characters and keyCodes](#special-characters-and-keycodes)
- [Tips & Tricks](#tips--tricks)


Usage
-----
The `.simulate()` type parameter to simulate key sequences is `"key-sequence"`: `.simulate("key-sequence", options)`

#### Example: ####
```javascript
$('input[name="testInput"]').simulate("key-sequence", {sequence: "This is a test!"});
```

Options
-------
* __sequence__ _{String}_: The key sequence (text) to be simulated.
* __delay__ _{Numeric}_: Delay between the key presses in milliseconds. If delay is greater 0, the key presses
	are simulated asynchronously, i.e. the call to `.simulate()` returns immediately. To detect when the
	simulation is finished, either use the `simulate-keySequence` event (see [below](#events)) or
	provide a `callback` (see below). Default: `0`
* __triggerKeyEvents__ _{Boolean}_: Defines whether the plugin generates events for the key presses. If
	`false`, the plugin only inserts the characters into the target element. Default: `true`
* __callback__ _{Function}_: Callback function which is executed as soon as the simulation of the key presses
	is finished.

Special Sequences
-----------------
Despite of the printable characters, the plugin supports a set of special sequences to manipulate the
content of the element:

* `{backspace}`: Deletes the currently selected characters or the character in front of the selection cursor.
* `{del}`: Deletes the currently selected characters or the character behind the selection cursor.
* `{rightarrow}`: Moves the selection cursor one character to the right. Doesn't work in InternetExplorer.
	Doesn't work correctly in Opera on Windows (cannot be used to move to the next line).
* `{leftarrow}`: Moves the selection cursor one character to the left. Doesn't work in InternetExplorer.
* `{selectall}`: Selects all characters.
* `{enter}`: Inserts a line break. Doesn't work correctly in Opera on Windows (the line break is
	inserted behind the sequence).
* `{{}`: Inserts a literal `{`

Except for the `{selectall}` sequence, the special sequences also generate `keydown` and `keyup`
events for the keys corresponding to the special sequence. The `{enter}` sequence also generates a `keypress`
event.

#### Example: ####
The sequence `"as{leftarrow}{del}bc"` results in the insertion of the text `"abc"` and generates
the following events:

```
keydown   (which: 65)   // a
keypress  (which: 97)   // a
keyup     (which: 65)   // a
keydown   (which: 83)   // s
keypress  (which: 115)  // s
keyup     (which: 83)   // s
keydown   (which: 37)   // {leftarrow}
keyup     (which: 37)   // {leftarrow}
keydown   (which: 46)   // {del}
keyup     (which: 46)   // {del}
keydown   (which: 66)   // b
keypress  (which: 98)   // b
keyup     (which: 66)   // b
keydown   (which: 67)   // c
keypress  (which: 99)   // c
keyup     (which: 67)   // c
```

Events
------
For every key in the sequence (exceptions for special sequences see [above](#special-sequences)),
the plugin generates the following events:

1. `keydown`
2. `keypress` if the key is printable
3. `keyup`

The values of the `keyCode`, `charCode` and `which` properties of the events should be equal to
the corresponding values of native (i.e. non-simulated) events for all browsers.
As a rule of thumb: `keyCode` and `which` are equal for all events. For `keypress` events,
they are the ASCII code of the character. For `keydown` and `keyup` events, they are a "key code"
which differs among browsers. See [below](#special-characters-and-keycodes) for more details.

Additionally, the plugin generates a `simulate-keySequence` event as soon as the simulation of the
key sequence is finished. This `simulate-keySequence` has a property called `sequence` which
contains the key sequence that has been simulated.

#### Example: ####
The plugin generates the following events for the sequence `"Test!"` (the `keyCode` and `charCode` 
properties have been omitted):

```
keydown   (which:  84)  // T
keypress  (which:  84)  // T
keyup     (which:  84)  // T
keydown   (which:  69)  // e
keypress  (which: 101)  // e
keyup     (which:  69)  // e
keydown   (which:  83)  // s
keypress  (which: 115)  // s
keyup     (which:  83)  // s
keydown   (which:  84)  // t
keypress  (which: 116)  // t
keyup     (which:  84)  // t
keydown   (which:  49)  // !
keypress  (which:  33)  // !
keyup     (which:  49)  // !
simulate-keySequence (sequence: "Test!")
```

Special Characters and keyCodes
-------------------------------
The values of the `keyCode` and `which` properties for `keyup` and `keydown` events are not
consistent across browsers. For the alphanumeric characters and for "meta" keys
(Control, Space, Esc, leftarrow, ...), the values are consistent but the values differ for special
characters.
To keep the plugin simple, the current implementation assumes a US keyboard, it uses the same key
codes like InternetExplorer for all browsers and the support of special characters is limited to
the most common ones (see [the code](https://github.com/j-ulrich/jquery-simulate-ext/tree/master/src/jquery.simulate.key-sequence.js#L172-211)
for the complete list). However, this might change in future versions.
For more information about this topic see http://unixpapa.com/js/key.html.

Tips & Tricks
-------------

#### Simulating a text cursor ####
When simulating a key-sequence in a non-input element (e.g. a `div` or `p` element), it is possible
to simulate a text cursor like this:
```javascript
$('div#myDiv').simulate("key-sequence", {sequence: "|{leftarrow}This is a test!{del}", delay: 100});
```
