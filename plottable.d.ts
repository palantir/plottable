
declare module Plottable {
    module Util {
        module Methods {
            /**
            * Checks if x is between a and b.
            *
            * @param {number} x The value to test if in range
            * @param {number} a The beginning of the (inclusive) range
            * @param {number} b The ending of the (inclusive) range
            * @return {boolean} Whether x is in [a, b]
            */
            function inRange(x: number, a: number, b: number): boolean;
            /** Print a warning message to the console, if it is available.
            *
            * @param {string} The warnings to print
            */
            function warn(warning: string): void;
            /**
            * Takes two arrays of numbers and adds them together
            *
            * @param {number[]} alist The first array of numbers
            * @param {number[]} blist The second array of numbers
            * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
            */
            function addArrays(alist: number[], blist: number[]): number[];
            /**
            * Takes two sets and returns the intersection
            *
            * @param {D3.Set} set1 The first set
            * @param {D3.Set} set2 The second set
            * @return {D3.Set} A set that contains elements that appear in both set1 and set2
            */
            function intersection(set1: D3.Set, set2: D3.Set): D3.Set;
            /**
            * Take an accessor object (may be a string to be made into a key, or a value, or a color code)
            * and "activate" it by turning it into a function in (datum, index, metadata)
            */
            function _accessorize(accessor: any): IAccessor;
            /**
            * Takes two sets and returns the union
            *
            * @param{D3.Set} set1 The first set
            * @param{D3.Set} set2 The second set
            * @return{D3.Set} A set that contains elements that appear in either set1 or set2
            */
            function union(set1: D3.Set, set2: D3.Set): D3.Set;
            /**
            * Take an accessor object, activate it, and partially apply it to a Plot's datasource's metadata
            */
            function _applyAccessor(accessor: IAccessor, plot: Abstract.Plot): (d: any, i: number) => any;
            function uniq(strings: string[]): string[];
            function uniqNumbers(a: number[]): number[];
            /**
            * Creates an array of length `count`, filled with value or (if value is a function), value()
            *
            * @param {any} value The value to fill the array with, or, if a function, a generator for values
            * @param {number} count The length of the array to generate
            * @return {any[]}
            */
            function createFilledArray(value: any, count: number): any[];
            /**
            * @param {T[][]} a The 2D array that will have its elements joined together.
            * @return {T[]} Every array in a, concatenated together in the order they appear.
            */
            function flatten<T>(a: T[][]): T[];
            /**
            * Check if two arrays are equal by strict equality.
            */
            function arrayEq<T>(a: T[], b: T[]): boolean;
            /**
            * @param {any} a Object to check against b for equality.
            * @param {any} b Object to check against a for equality.
            *
            * @returns {boolean} whether or not two objects share the same keys, and
            *          values associated with those keys. Values will be compared
            *          with ===.
            */
            function objEq(a: any, b: any): boolean;
        }
    }
}


declare module Plottable {
    module Util {
        module OpenSource {
            /**
            * Returns the sortedIndex for inserting a value into an array.
            * Takes a number and an array of numbers OR an array of objects and an accessor that returns a number.
            * @param {number} value: The numerical value to insert
            * @param {any[]} arr: Array to find insertion index, can be number[] or any[] (if accessor provided)
            * @param {IAccessor} accessor: If provided, this function is called on members of arr to determine insertion index
            * @returns {number} The insertion index.
            * The behavior is undefined for arrays that are unsorted
            * If there are multiple valid insertion indices that maintain sorted order (e.g. addign 1 to [1,1,1,1,1]) then
            * the behavior must satisfy that the array is sorted post-insertion, but is otherwise unspecified.
            * This is a modified version of Underscore.js's implementation of sortedIndex.
            * Underscore.js is released under the MIT License:
            *  Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
            *  Reporters & Editors
            *
            *  Permission is hereby granted, free of charge, to any person
            *  obtaining a copy of this software and associated documentation
            *  files (the "Software"), to deal in the Software without
            *  restriction, including without limitation the rights to use,
            *  copy, modify, merge, publish, distribute, sublicense, and/or sell
            *  copies of the Software, and to permit persons to whom the
            *  Software is furnished to do so, subject to the following
            *  conditions:
            *
            *  The above copyright notice and this permission notice shall be
            *  included in all copies or substantial portions of the Software.
            *
            *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
            *  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
            *  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
            *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
            *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
            *  OTHER DEALINGS IN THE SOFTWARE.
            */
            function sortedIndex(val: number, arr: number[]): number;
            function sortedIndex(val: number, arr: any[], accessor: IAccessor): number;
        }
    }
}


declare module Plottable {
    module Util {
        class IDCounter {
            public increment(id: any): number;
            public decrement(id: any): number;
            public get(id: any): number;
        }
    }
}


declare module Plottable {
    module Util {
        /**
        * An associative array that can be keyed by anything (inc objects).
        * Uses pointer equality checks which is why this works.
        * This power has a price: everything is linear time since it is actually backed by an array...
        */
        class StrictEqualityAssociativeArray {
            /**
            * Set a new key/value pair in the store.
            *
            * @param {any} key Key to set in the store
            * @param {any} value Value to set in the store
            * @return {boolean} True if key already in store, false otherwise
            */
            public set(key: any, value: any): boolean;
            /**
            * Get a value from the store, given a key.
            *
            * @param {any} key Key associated with value to retrieve
            * @return {any} Value if found, undefined otherwise
            */
            public get(key: any): any;
            /**
            * Test whether store has a value associated with given key.
            *
            * Will return true if there is a key/value entry,
            * even if the value is explicitly `undefined`.
            *
            * @param {any} key Key to test for presence of an entry
            * @return {boolean} Whether there was a matching entry for that key
            */
            public has(key: any): boolean;
            /**
            * Return an array of the values in the key-value store
            *
            * @return {any[]} The values in the store
            */
            public values(): any[];
            /**
            * Return an array of keys in the key-value store
            *
            * @return {any[]} The keys in the store
            */
            public keys(): any[];
            /**
            * Execute a callback for each entry in the array.
            *
            * @param {(key: any, val?: any, index?: number) => any} callback The callback to eecute
            * @return {any[]} The results of mapping the callback over the entries
            */
            public map(cb: (key?: any, val?: any, index?: number) => any): any[];
            /**
            * Delete a key from the key-value store. Return whether the key was present.
            *
            * @param {any} The key to remove
            * @return {boolean} Whether a matching entry was found and removed
            */
            public delete(key: any): boolean;
        }
    }
}


declare module Plottable {
    module Util {
        class Cache<T> {
            /**
            * @constructor
            *
            * @param {string} compute The function whose results will be cached.
            * @param {string} [canonicalKey] If present, when clear() is called,
            *        this key will be re-computed. If its result hasn't been changed,
            *        the cache will not be cleared.
            * @param {(v: T, w: T) => boolean} [valueEq]
            *        Used to determine if the value of canonicalKey has changed.
            *        If omitted, defaults to === comparision.
            */
            constructor(compute: (k: string) => T, canonicalKey?: string, valueEq?: (v: T, w: T) => boolean);
            /**
            * Attempt to look up k in the cache, computing the result if it isn't
            * found.
            *
            * @param {string} k The key to look up in the cache.
            * @return {T} The value associated with k; the result of compute(k).
            */
            public get(k: string): T;
            /**
            * Reset the cache empty.
            *
            * If canonicalKey was provided at construction, compute(canonicalKey)
            * will be re-run. If the result matches what is already in the cache,
            * it will not clear the cache.
            *
            * @return {Cache<T>} The calling Cache.
            */
            public clear(): Cache<T>;
        }
    }
}


declare module Plottable {
    module Util {
        module Text {
            interface Dimensions {
                width: number;
                height: number;
            }
            interface TextMeasurer {
                (s: string): Dimensions;
            }
            /**
            * Returns a quasi-pure function of typesignature (t: string) => Dimensions which measures height and width of text
            *
            * @param {D3.Selection} selection: The selection in which text will be drawn and measured
            * @returns {Dimensions} width and height of the text
            */
            function getTextMeasure(selection: D3.Selection): TextMeasurer;
            /**
            * This class will measure text by measuring each character individually,
            * then adding up the dimensions. It will also cache the dimensions of each
            * letter.
            */
            class CachingCharacterMeasurer {
                /**
                * @param {string} s The string to be measured.
                * @return {Dimensions} The width and height of the measured text.
                */
                public measure: TextMeasurer;
                /**
                * @param {D3.Selection} g The element that will have text inserted into
                *        it in order to measure text. The styles present for text in
                *        this element will to the text being measured.
                */
                constructor(g: D3.Selection);
                /**
                * Clear the cache, if it seems that the text has changed size.
                */
                public clear(): CachingCharacterMeasurer;
            }
            /**
            * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
            *
            * @param {string} text: The string to be truncated
            * @param {number} availableWidth: The available width, in pixels
            * @param {D3.Selection} element: The text element used to measure the text
            * @returns {string} text - the shortened text
            */
            function getTruncatedText(text: string, availableWidth: number, measurer: TextMeasurer): string;
            /**
            * Gets the height of a text element, as rendered.
            *
            * @param {D3.Selection} textElement
            * @return {number} The height of the text element, in pixels.
            */
            function getTextHeight(selection: D3.Selection): number;
            /**
            * Gets the width of a text element, as rendered.
            *
            * @param {D3.Selection} textElement
            * @return {number} The width of the text element, in pixels.
            */
            function getTextWidth(textElement: D3.Selection, text: string): number;
            /**
            * Takes a line, a width to fit it in, and a text measurer. Will attempt to add ellipses to the end of the line,
            * shortening the line as required to ensure that it fits within width.
            */
            function _addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
            function writeLineHorizontally(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeLineVertically(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
                width: number;
                height: number;
            };
            function writeTextHorizontally(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeTextVertically(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
                width: number;
                height: number;
            };
            interface IWriteTextResult {
                textFits: boolean;
                usedWidth: number;
                usedHeight: number;
            }
            interface IWriteOptions {
                g: D3.Selection;
                xAlign: string;
                yAlign: string;
            }
            /**
            * @param {write} [IWriteOptions] If supplied, the text will be written
            *        To the given g. Will align the text vertically if it seems like
            *        that is appropriate.
            * Returns an IWriteTextResult with info on whether the text fit, and how much width/height was used.
            */
            function writeText(text: string, width: number, height: number, tm: TextMeasurer, horizontally?: boolean, write?: IWriteOptions): IWriteTextResult;
        }
    }
}


declare module Plottable {
    module Util {
        module WordWrap {
            interface IWrappedText {
                originalText: string;
                lines: string[];
                textFits: boolean;
            }
            /**
            * Takes a block of text, a width and height to fit it in, and a 2-d text measurement function.
            * Wraps words and fits as much of the text as possible into the given width and height.
            */
            function breakTextToFitRect(text: string, width: number, height: number, measureText: Text.TextMeasurer): IWrappedText;
            /**
            * Determines if it is possible to fit a given text within width without breaking any of the words.
            * Simple algorithm, split the text up into tokens, and make sure that the widest token doesn't exceed
            * allowed width.
            */
            function canWrapWithoutBreakingWords(text: string, width: number, widthMeasure: (s: string) => number): boolean;
        }
    }
}

declare module Plottable {
    module Util {
        module DOM {
            /**
            * Gets the bounding box of an element.
            * @param {D3.Selection} element
            * @returns {SVGRed} The bounding box.
            */
            function getBBox(element: D3.Selection): SVGRect;
            var POLYFILL_TIMEOUT_MSEC: number;
            function requestAnimationFramePolyfill(fn: () => any): void;
            function isSelectionRemovedFromSVG(selection: D3.Selection): boolean;
            function getElementWidth(elem: HTMLScriptElement): number;
            function getElementHeight(elem: HTMLScriptElement): number;
            function getSVGPixelWidth(svg: D3.Selection): number;
            function translate(s: D3.Selection, x?: number, y?: number): any;
            function boxesOverlap(boxA: ClientRect, boxB: ClientRect): boolean;
        }
    }
}


declare module Plottable {
    interface Formatter {
        (d: any): string;
    }
    var MILLISECONDS_IN_ONE_DAY: number;
    class Formatters {
        /**
        * Creates a formatter for currency values.
        *
        * @param {number} [precision] The number of decimal places to show (default 2).
        * @param {string} [symbol] The currency symbol to use (default "$").
        * @param {boolean} [prefix] Whether to prepend or append the currency symbol (default true).
        * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
        *
        * @returns {Formatter} A formatter for currency values.
        */
        static currency(precision?: number, symbol?: string, prefix?: boolean, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
        * Creates a formatter that displays exactly [precision] decimal places.
        *
        * @param {number} [precision] The number of decimal places to show (default 3).
        * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
        *
        * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
        */
        static fixed(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
        * Creates a formatter that formats numbers to show no more than
        * [precision] decimal places. All other values are stringified.
        *
        * @param {number} [precision] The number of decimal places to show (default 3).
        * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
        *
        * @returns {Formatter} A formatter for general values.
        */
        static general(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
        * Creates a formatter that stringifies its input.
        *
        * @returns {Formatter} A formatter that stringifies its input.
        */
        static identity(): (d: any) => string;
        /**
        * Creates a formatter for percentage values.
        * Multiplies the input by 100 and appends "%".
        *
        * @param {number} [precision] The number of decimal places to show (default 0).
        * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
        *
        * @returns {Formatter} A formatter for percentage values.
        */
        static percentage(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
        * Creates a formatter for values that displays [precision] significant figures
        * and puts SI notation.
        *
        * @param {number} [precision] The number of significant figures to show (default 3).
        *
        * @returns {Formatter} A formatter for SI values.
        */
        static siSuffix(precision?: number): (d: any) => string;
        /**
        * Creates a formatter that displays dates.
        *
        * @returns {Formatter} A formatter for time/date values.
        */
        static time(): (d: any) => string;
        /**
        * Creates a formatter for relative dates.
        *
        * @param {number} baseValue The start date (as epoch time) used in computing relative dates (default 0)
        * @param {number} increment The unit used in calculating relative date values (default MILLISECONDS_IN_ONE_DAY)
        * @param {string} label The label to append to the formatted string (default "")
        *
        * @returns {Formatter} A formatter for time/date values.
        */
        static relativeDate(baseValue?: number, increment?: number, label?: string): (d: any) => string;
    }
}


declare module Plottable {
    var version: string;
}


declare module Plottable {
    module Core {
        class Colors {
            static CORAL_RED: string;
            static INDIGO: string;
            static ROBINS_EGG_BLUE: string;
            static FERN: string;
            static BURNING_ORANGE: string;
            static ROYAL_HEATH: string;
            static CONIFER: string;
            static CERISE_RED: string;
            static BRIGHT_SUN: string;
            static JACARTA: string;
            static PLOTTABLE_COLORS: string[];
        }
    }
}


declare module Plottable {
    module Abstract {
        class PlottableObject {
        }
    }
}


declare module Plottable {
    module Core {
        /**
        * This interface represents anything in Plottable which can have a listener attached.
        * Listeners attach by referencing the Listenable's broadcaster, and calling registerListener
        * on it.
        *
        * e.g.:
        * listenable: Plottable.IListenable;
        * listenable.broadcaster.registerListener(callbackToCallOnBroadcast)
        */
        interface IListenable {
            broadcaster: Broadcaster;
        }
        /**
        * This interface represents the callback that should be passed to the Broadcaster on a Listenable.
        *
        * The callback will be called with the attached Listenable as the first object, and optional arguments
        * as the subsequent arguments.
        *
        * The Listenable is passed as the first argument so that it is easy for the callback to reference the
        * current state of the Listenable in the resolution logic.
        */
        interface IBroadcasterCallback {
            (listenable: IListenable, ...args: any[]): any;
        }
        /**
        * The Broadcaster class is owned by an IListenable. Third parties can register and deregister listeners
        * from the broadcaster. When the broadcaster.broadcast method is activated, all registered callbacks are
        * called. The registered callbacks are called with the registered Listenable that the broadcaster is attached
        * to, along with optional arguments passed to the `broadcast` method.
        *
        * The listeners are called synchronously.
        */
        class Broadcaster extends Abstract.PlottableObject {
            public listenable: IListenable;
            /**
            * Construct a broadcaster, taking the Listenable that the broadcaster will be attached to.
            *
            * @constructor
            * @param {IListenable} listenable The Listenable-object that this broadcaster is attached to.
            */
            constructor(listenable: IListenable);
            /**
            * Registers a callback to be called when the broadcast method is called. Also takes a key which
            * is used to support deregistering the same callback later, by passing in the same key.
            * If there is already a callback associated with that key, then the callback will be replaced.
            *
            * @param key The key associated with the callback. Key uniqueness is determined by deep equality.
            * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
            * @returns {Broadcaster} this object
            */
            public registerListener(key: any, callback: IBroadcasterCallback): Broadcaster;
            /**
            * Call all listening callbacks, optionally with arguments passed through.
            *
            * @param ...args A variable number of optional arguments
            * @returns {Broadcaster} this object
            */
            public broadcast(...args: any[]): Broadcaster;
            /**
            * Deregisters the callback associated with a key.
            *
            * @param key The key to deregister.
            * @returns {Broadcaster} this object
            */
            public deregisterListener(key: any): Broadcaster;
            /**
            * Deregisters all listeners and callbacks associated with the broadcaster.
            *
            * @returns {Broadcaster} this object
            */
            public deregisterAllListeners(): void;
        }
    }
}


declare module Plottable {
    class DataSource extends Abstract.PlottableObject implements Core.IListenable {
        public broadcaster: Core.Broadcaster;
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        constructor(data?: any[], metadata?: any);
        /**
        * Gets the data.
        *
        * @returns {any[]} The current data.
        */
        public data(): any[];
        /**
        * Sets new data.
        *
        * @param {any[]} data The new data.
        * @returns {DataSource} The calling DataSource.
        */
        public data(data: any[]): DataSource;
        /**
        * Gets the metadata.
        *
        * @returns {any} The current metadata.
        */
        public metadata(): any;
        /**
        * Sets the metadata.
        *
        * @param {any} metadata The new metadata.
        * @returns {DataSource} The calling DataSource.
        */
        public metadata(metadata: any): DataSource;
    }
}


declare module Plottable {
    module Abstract {
        class Component extends PlottableObject {
            public element: D3.Selection;
            public content: D3.Selection;
            public backgroundContainer: D3.Selection;
            public foregroundContainer: D3.Selection;
            public clipPathEnabled: boolean;
            public availableWidth: number;
            public availableHeight: number;
            public xOrigin: number;
            public yOrigin: number;
            static AUTORESIZE_BY_DEFAULT: boolean;
            /**
            * Renders the Component into a given DOM element.
            *
            * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
            * @return {Component} The calling component.
            */
            public renderTo(element: any): Component;
            /**
            * Cause the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
            *
            * @param {number} [availableWidth]  - the width of the container element
            * @param {number} [availableHeight] - the height of the container element
            */
            public resize(width?: number, height?: number): Component;
            /**
            * Enables and disables auto-resize.
            *
            * If enabled, window resizes will enqueue this component for a re-layout
            * and re-render. Animations are disabled during window resizes when auto-
            * resize is enabled.
            *
            * @param {boolean} flag - Enables (true) or disables (false) auto-resize.
            */
            public autoResize(flag: boolean): Component;
            /**
            * Sets the x alignment of the Component.
            *
            * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
            * @returns {Component} The calling Component.
            */
            public xAlign(alignment: string): Component;
            /**
            * Sets the y alignment of the Component.
            *
            * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
            * @returns {Component} The calling Component.
            */
            public yAlign(alignment: string): Component;
            /**
            * Sets the x offset of the Component.
            *
            * @param {number} offset The desired x offset, in pixels.
            * @returns {Component} The calling Component.
            */
            public xOffset(offset: number): Component;
            /**
            * Sets the y offset of the Component.
            *
            * @param {number} offset The desired y offset, in pixels.
            * @returns {Component} The calling Component.
            */
            public yOffset(offset: number): Component;
            /**
            * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
            *
            * @param {Interaction} interaction The Interaction to attach to the Component.
            * @return {Component} The calling Component.
            */
            public registerInteraction(interaction: Interaction): Component;
            /**
            * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
            *
            * @param {string} cssClass The CSS class to add/remove/check for.
            * @param {boolean} [addClass] Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
            * @return {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
            */
            public classed(cssClass: string): boolean;
            public classed(cssClass: string, addClass: boolean): Component;
            /**
            * Merges this Component with another Component, returning a ComponentGroup.
            * There are four cases:
            * Component + Component: Returns a ComponentGroup with both components inside it.
            * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
            * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
            * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
            *
            * @param {Component} c The component to merge in.
            * @return {ComponentGroup}
            */
            public merge(c: Component): Component.Group;
            /**
            * Detaches a Component from the DOM. The component can be reused.
            *
            * @returns The calling Component.
            */
            public detach(): Component;
            /**
            * Removes a Component from the DOM and disconnects it from everything it's
            * listening to (effectively destroying it).
            */
            public remove(): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class ComponentContainer extends Component {
            /**
            * Returns a list of components in the ComponentContainer
            *
            * @returns{Component[]} the contained Components
            */
            public components(): Component[];
            /**
            * Returns true iff the ComponentContainer is empty.
            *
            * @returns {boolean} Whether the calling ComponentContainer is empty.
            */
            public empty(): boolean;
            /**
            * Detaches all components contained in the ComponentContainer, and
            * empties the ComponentContainer.
            *
            * @returns {ComponentContainer} The calling ComponentContainer
            */
            public detachAll(): ComponentContainer;
            public remove(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Group extends Abstract.ComponentContainer {
            /**
            * Creates a ComponentGroup.
            *
            * @constructor
            * @param {Component[]} [components] The Components in the Group.
            */
            constructor(components?: Abstract.Component[]);
            public merge(c: Abstract.Component): Group;
        }
    }
}


declare module Plottable {
    module Component {
        interface IterateLayoutResult {
            colProportionalSpace: number[];
            rowProportionalSpace: number[];
            guaranteedWidths: number[];
            guaranteedHeights: number[];
            wantsWidth: boolean;
            wantsHeight: boolean;
        }
        class Table extends Abstract.ComponentContainer {
            /**
            * Creates a Table.
            *
            * @constructor
            * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
            * null can be used if a cell is empty.
            */
            constructor(rows?: Abstract.Component[][]);
            /**
            * Adds a Component in the specified cell.
            *
            * @param {number} row The row in which to add the Component.
            * @param {number} col The column in which to add the Component.
            * @param {Component} component The Component to be added.
            */
            public addComponent(row: number, col: number, component: Abstract.Component): Table;
            /**
            * Sets the row and column padding on the Table.
            *
            * @param {number} rowPadding The padding above and below each row, in pixels.
            * @param {number} colPadding the padding to the left and right of each column, in pixels.
            * @returns {Table} The calling Table.
            */
            public padding(rowPadding: number, colPadding: number): Table;
            /**
            * Sets the layout weight of a particular row.
            * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
            *
            * @param {number} index The index of the row.
            * @param {number} weight The weight to be set on the row.
            * @returns {Table} The calling Table.
            */
            public rowWeight(index: number, weight: number): Table;
            /**
            * Sets the layout weight of a particular column.
            * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
            *
            * @param {number} index The index of the column.
            * @param {number} weight The weight to be set on the column.
            * @returns {Table} The calling Table.
            */
            public colWeight(index: number, weight: number): Table;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Scale extends PlottableObject implements Core.IListenable {
            public broadcaster: Core.Broadcaster;
            /**
            * Creates a new Scale.
            *
            * @constructor
            * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
            */
            constructor(scale: D3.Scale.Scale);
            /**
            * Modify the domain on the scale so that it includes the extent of all
            * perspectives it depends on. Extent: The (min, max) pair for a
            * QuantitiativeScale, all covered strings for an OrdinalScale.
            * Perspective: A combination of a DataSource and an Accessor that
            * represents a view in to the data.
            */
            public autoDomain(): Scale;
            /**
            * Returns the range value corresponding to a given domain value.
            *
            * @param value {any} A domain value to be scaled.
            * @returns {any} The range value corresponding to the supplied domain value.
            */
            public scale(value: any): any;
            /**
            * Gets the domain.
            *
            * @returns {any[]} The current domain.
            */
            public domain(): any[];
            /**
            * Sets the Scale's domain to the specified values.
            *
            * @param {any[]} values The new value for the domain. This array may
            *     contain more than 2 values if the scale type allows it (e.g.
            *     ordinal scales). Other scales such as quantitative scales accept
            *     only a 2-value extent array.
            * @returns {Scale} The calling Scale.
            */
            public domain(values: any[]): Scale;
            /**
            * Gets the range.
            *
            * @returns {any[]} The current range.
            */
            public range(): any[];
            /**
            * Sets the Scale's range to the specified values.
            *
            * @param {any[]} values The new values for the range.
            * @returns {Scale} The calling Scale.
            */
            public range(values: any[]): Scale;
            /**
            * Creates a copy of the Scale with the same domain and range but without any registered listeners.
            *
            * @returns {Scale} A copy of the calling Scale.
            */
            public copy(): Scale;
            /**
            * When a renderer determines that the extent of a projector has changed,
            * it will call this function. This function should ensure that
            * the scale has a domain at least large enough to include extent.
            *
            * @param {number} rendererID A unique indentifier of the renderer sending
            *                 the new extent.
            * @param {string} attr The attribute being projected, e.g. "x", "y0", "r"
            * @param {any[]} extent The new extent to be included in the scale.
            */
            public updateExtent(rendererID: number, attr: string, extent: any[]): Scale;
            public removeExtent(rendererID: number, attr: string): Scale;
        }
    }
}


declare module Plottable {
    module Abstract {
        interface _IProjector {
            accessor: IAccessor;
            scale?: Scale;
        }
        interface IAttributeToProjector {
            [attrToSet: string]: IAppliedAccessor;
        }
        class Plot extends Component {
            public renderArea: D3.Selection;
            public element: D3.Selection;
            /**
            * Creates a Plot.
            *
            * @constructor
            * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Plot.
            */
            constructor();
            constructor(dataset: any[]);
            constructor(dataset: DataSource);
            public remove(): void;
            /**
            * Gets the Plot's DataSource.
            *
            * @return {DataSource} The current DataSource.
            */
            public dataSource(): DataSource;
            /**
            * Sets the Plot's DataSource.
            *
            * @param {DataSource} source The DataSource the Plot should use.
            * @return {Plot} The calling Plot.
            */
            public dataSource(source: DataSource): Plot;
            public project(attrToSet: string, accessor: any, scale?: Scale): Plot;
            /**
            * Enables or disables animation.
            *
            * @param {boolean} enabled Whether or not to animate.
            */
            public animate(enabled: boolean): Plot;
            public detach(): Plot;
            /**
            * Gets the animator associated with the specified Animator key.
            *
            * @param {string} animatorKey The key for the Animator.
            * @return {Animator.IPlotAnimator} The Animator for the specified key.
            */
            public animator(animatorKey: string): Animator.IPlotAnimator;
            /**
            * Sets the animator associated with the specified Animator key.
            *
            * @param {string} animatorKey The key for the Animator.
            * @param {Animator.IPlotAnimator} animator An Animator to be assigned to
            *                                          the specified key.
            * @return {Plot} The calling Plot.
            */
            public animator(animatorKey: string, animator: Animator.IPlotAnimator): Plot;
        }
    }
}


declare module Plottable {
    module Core {
        module RenderController {
            module RenderPolicy {
                interface IRenderPolicy {
                    render(): any;
                }
                class Immediate implements IRenderPolicy {
                    public render(): void;
                }
                class AnimationFrame implements IRenderPolicy {
                    public render(): void;
                }
                class Timeout implements IRenderPolicy {
                    public render(): void;
                }
            }
        }
    }
}


declare module Plottable {
    module Core {
        /**
        * The RenderController is responsible for enqueueing and synchronizing
        * layout and render calls for Plottable components.
        *
        * Layouts and renders occur inside an animation callback
        * (window.requestAnimationFrame if available).
        *
        * If you require immediate rendering, call RenderController.flush() to
        * perform enqueued layout and rendering serially.
        */
        module RenderController {
            var _renderPolicy: RenderPolicy.IRenderPolicy;
            function setRenderPolicy(policy: RenderPolicy.IRenderPolicy): any;
            /**
            * If the RenderController is enabled, we enqueue the component for
            * render. Otherwise, it is rendered immediately.
            *
            * @param {Abstract.Component} component Any Plottable component.
            */
            function registerToRender(c: Abstract.Component): void;
            /**
            * If the RenderController is enabled, we enqueue the component for
            * layout and render. Otherwise, it is rendered immediately.
            *
            * @param {Abstract.Component} component Any Plottable component.
            */
            function registerToComputeLayout(c: Abstract.Component): void;
            function flush(): void;
        }
    }
}


declare module Plottable {
    module Core {
        /**
        * The ResizeBroadcaster will broadcast a notification to any registered
        * components when the window is resized.
        *
        * The broadcaster and single event listener are lazily constructed.
        *
        * Upon resize, the _resized flag will be set to true until after the next
        * flush of the RenderController. This is used, for example, to disable
        * animations during resize.
        */
        module ResizeBroadcaster {
            /**
            * Returns true if the window has been resized and the RenderController
            * has not yet been flushed.
            */
            function resizing(): boolean;
            function clearResizing(): any;
            /**
            * Registers a component.
            *
            * When the window is resized, we invoke ._invalidateLayout() on the
            * component, which will enqueue the component for layout and rendering
            * with the RenderController.
            *
            * @param {Abstract.Component} component Any Plottable component.
            */
            function register(c: Abstract.Component): void;
            /**
            * Deregisters the components.
            *
            * The component will no longer receive updates on window resize.
            *
            * @param {Abstract.Component} component Any Plottable component.
            */
            function deregister(c: Abstract.Component): void;
        }
    }
}


declare module Plottable {
    module Animator {
        interface IPlotAnimator {
            /**
            * Applies the supplied attributes to a D3.Selection with some animation.
            *
            * @param {D3.Selection} selection The update selection or transition selection that we wish to animate.
            * @param {Abstract.IAttributeToProjector} attrToProjector The set of
            *     IAccessors that we will use to set attributes on the selection.
            * @param {Abstract.Plot} plot The plot being animated.
            * @return {D3.Selection} Animators should return the selection or
            *     transition object so that plots may chain the transitions between
            *     animators.
            */
            animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any;
        }
        interface IPlotAnimatorMap {
            [animatorKey: string]: IPlotAnimator;
        }
    }
}

declare module Plottable {
    interface IDataset {
        data: any[];
        metadata: IMetadata;
    }
    interface IMetadata {
        cssClass?: string;
        color?: string;
    }
    interface IAccessor {
        (datum: any, index?: number, metadata?: any): any;
    }
    interface IAppliedAccessor {
        (datum: any, index: number): any;
    }
    interface SelectionArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    interface FullSelectionArea {
        pixel: SelectionArea;
        data: SelectionArea;
    }
    interface ISpaceRequest {
        width: number;
        height: number;
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    interface IPixelArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    interface IExtent {
        min: number;
        max: number;
    }
    interface Point {
        x: number;
        y: number;
    }
}


declare module Plottable {
    class Domainer {
        /**
        * @param {(extents: any[][]) => any[]} combineExtents
        *        If present, this function will be used by the Domainer to merge
        *        all the extents that are present on a scale.
        *
        *        A plot may draw multiple things relative to a scale, e.g.
        *        different stocks over time. The plot computes their extents,
        *        which are a [min, max] pair. combineExtents is responsible for
        *        merging them all into one [min, max] pair. It defaults to taking
        *        the min of the first elements and the max of the second arguments.
        */
        constructor(combineExtents?: (extents: any[][]) => any[]);
        /**
        * @param {any[][]} extents The list of extents to be reduced to a single
        *        extent.
        * @param {Abstract.QuantitativeScale} scale
        *        Since nice() must do different things depending on Linear, Log,
        *        or Time scale, the scale must be passed in for nice() to work.
        * @return {any[]} The domain, as a merging of all exents, as a [min, max]
        *                 pair.
        */
        public computeDomain(extents: any[][], scale: Abstract.QuantitativeScale): any[];
        /**
        * Sets the Domainer to pad by a given ratio.
        *
        * @param {number} [padProportion] Proportionally how much bigger the
        *         new domain should be (0.05 = 5% larger).
        *
        *         A domainer will pad equal visual amounts on each side.
        *         On a linear scale, this means both sides are padded the same
        *         amount: [10, 20] will be padded to [5, 25].
        *         On a log scale, the top will be padded more than the bottom, so
        *         [10, 100] will be padded to [1, 1000].
        *
        * @return {Domainer} The calling Domainer.
        */
        public pad(padProportion?: number): Domainer;
        /**
        * Add a padding exception, a value that will not be padded at either end of the domain.
        *
        * Eg, if a padding exception is added at x=0, then [0, 100] will pad to [0, 105] instead of [-2.5, 102.5].
        * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
        * If a key is not provided, it will be added with set semantics (Can be removed by value)
        *
        * @param {any} exception The padding exception to add.
        * @param string [key] The key to register the exception under.
        * @return Domainer The calling domainer
        */
        public addPaddingException(exception: any, key?: string): Domainer;
        /**
        * Remove a padding exception, allowing the domain to pad out that value again.
        *
        * If a string is provided, it is assumed to be a key and the exception associated with that key is removed.
        * If a non-string is provdied, it is assumed to be an unkeyed exception and that exception is removed.
        *
        * @param {any} keyOrException The key for the value to remove, or the value to remove
        * @return Domainer The calling domainer
        */
        public removePaddingException(keyOrException: any): Domainer;
        /**
        * Add an included value, a value that must be included inside the domain.
        *
        * Eg, if a value exception is added at x=0, then [50, 100] will expand to [0, 100] rather than [50, 100].
        * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
        * If a key is not provided, it will be added with set semantics (Can be removed by value)
        *
        * @param {any} value The included value to add.
        * @param string [key] The key to register the value under.
        * @return Domainer The calling domainer
        */
        public addIncludedValue(value: any, key?: string): Domainer;
        /**
        * Remove an included value, allowing the domain to not include that value gain again.
        *
        * If a string is provided, it is assumed to be a key and the value associated with that key is removed.
        * If a non-string is provdied, it is assumed to be an unkeyed value and that value is removed.
        *
        * @param {any} keyOrException The key for the value to remove, or the value to remove
        * @return Domainer The calling domainer
        */
        public removeIncludedValue(valueOrKey: any): Domainer;
        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        * @return {Domainer} The calling Domainer.
        */
        public nice(count?: number): Domainer;
    }
}


declare module Plottable {
    module Abstract {
        class QuantitativeScale extends Scale {
            /**
            * Creates a new QuantitativeScale.
            *
            * @constructor
            * @param {D3.Scale.QuantitativeScale} scale The D3 QuantitativeScale backing the QuantitativeScale.
            */
            constructor(scale: D3.Scale.QuantitativeScale);
            /**
            * Retrieves the domain value corresponding to a supplied range value.
            *
            * @param {number} value: A value from the Scale's range.
            * @returns {number} The domain value corresponding to the supplied range value.
            */
            public invert(value: number): number;
            /**
            * Creates a copy of the QuantitativeScale with the same domain and range but without any registered listeners.
            *
            * @returns {QuantitativeScale} A copy of the calling QuantitativeScale.
            */
            public copy(): QuantitativeScale;
            public domain(): any[];
            public domain(values: any[]): QuantitativeScale;
            /**
            * Sets or gets the QuantitativeScale's output interpolator
            *
            * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
            * @returns {D3.Transition.Interpolate|QuantitativeScale} The current output interpolator, or the calling QuantitativeScale.
            */
            public interpolate(): D3.Transition.Interpolate;
            public interpolate(factory: D3.Transition.Interpolate): QuantitativeScale;
            /**
            * Sets the range of the QuantitativeScale and sets the interpolator to d3.interpolateRound.
            *
            * @param {number[]} values The new range value for the range.
            */
            public rangeRound(values: number[]): QuantitativeScale;
            /**
            * Gets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
            *
            * @returns {boolean} The current clamp status.
            */
            public clamp(): boolean;
            /**
            * Sets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
            *
            * @param {boolean} clamp Whether or not to clamp the QuantitativeScale.
            * @returns {QuantitativeScale} The calling QuantitativeScale.
            */
            public clamp(clamp: boolean): QuantitativeScale;
            /**
            * Generates tick values.
            *
            * @param {number} [count] The number of ticks to generate.
            * @returns {any[]} The generated ticks.
            */
            public ticks(count?: number): any[];
            /**
            * Gets a tick formatting function for displaying tick values.
            *
            * @param {number} count The number of ticks to be displayed
            * @param {string} [format] A format specifier string.
            * @returns {(n: number) => string} A formatting function.
            */
            public tickFormat(count: number, format?: string): (n: number) => string;
            /**
            * Retrieve a Domainer of a scale. A Domainer is responsible for combining
            * multiple extents into a single domain.
            *
            * @return {QuantitativeScale} The scale's current domainer.
            */
            public domainer(): Domainer;
            /**
            * Sets a Domainer of a scale. A Domainer is responsible for combining
            * multiple extents into a single domain.
            *
            * When you set domainer, we assume that you know what you want the domain
            * to look like better that we do. Ensuring that the domain is padded,
            * includes 0, etc., will be the responsability of the new domainer.
            *
            * @param {Domainer} domainer The domainer to be set.
            * @return {QuantitativeScale} The calling scale.
            */
            public domainer(domainer: Domainer): QuantitativeScale;
        }
    }
}


declare module Plottable {
    module Scale {
        class Linear extends Abstract.QuantitativeScale {
            /**
            * Creates a new LinearScale.
            *
            * @constructor
            * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
            */
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            /**
            * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
            *
            * @returns {LinearScale} A copy of the calling LinearScale.
            */
            public copy(): Linear;
        }
    }
}


declare module Plottable {
    module Scale {
        class Log extends Abstract.QuantitativeScale {
            /**
            * Creates a new Scale.Log.
            *
            * Warning: Log is deprecated; if possible, use ModifiedLog. Log scales are
            * very unstable due to the fact that they can't handle 0 or negative
            * numbers. The only time when you would want to use a Log scale over a
            * ModifiedLog scale is if you're plotting very small data, such as all
            * data < 1.
            *
            * @constructor
            * @param {D3.Scale.LogScale} [scale] The D3 Scale.Log backing the Scale.Log. If not supplied, uses a default scale.
            */
            constructor();
            constructor(scale: D3.Scale.LogScale);
            /**
            * Creates a copy of the Scale.Log with the same domain and range but without any registered listeners.
            *
            * @returns {Scale.Log} A copy of the calling Scale.Log.
            */
            public copy(): Log;
        }
    }
}


declare module Plottable {
    module Scale {
        class ModifiedLog extends Abstract.QuantitativeScale {
            /**
            * Creates a new Scale.ModifiedLog.
            *
            * A ModifiedLog scale acts as a regular log scale for large numbers.
            * As it approaches 0, it gradually becomes linear. This means that the
            * scale won't freak out if you give it 0 or a negative number, where an
            * ordinary Log scale would.
            *
            * However, it does mean that scale will be effectively linear as values
            * approach 0. If you want very small values on a log scale, you should use
            * an ordinary Scale.Log instead.
            *
            * @constructor
            * @param {number} [base]
            *        The base of the log. Defaults to 10, and must be > 1.
            *
            *        For base <= x, scale(x) = log(x).
            *
            *        For 0 < x < base, scale(x) will become more and more
            *        linear as it approaches 0.
            *
            *        At x == 0, scale(x) == 0.
            *
            *        For negative values, scale(-x) = -scale(x).
            */
            constructor(base?: number);
            public scale(x: number): number;
            public invert(x: number): number;
            public ticks(count?: number): number[];
            public copy(): ModifiedLog;
            /**
            * @returns {boolean}
            * Whether or not to return tick values other than powers of base.
            *
            * This defaults to false, so you'll normally only see ticks like
            * [10, 100, 1000]. If you turn it on, you might see ticks values
            * like [10, 50, 100, 500, 1000].
            */
            public showIntermediateTicks(): boolean;
            /**
            * @param {boolean} show
            * Whether or not to return ticks values other than powers of the base.
            */
            public showIntermediateTicks(show: boolean): ModifiedLog;
        }
    }
}


declare module Plottable {
    module Scale {
        class Ordinal extends Abstract.Scale {
            /**
            * Creates a new OrdinalScale. Domain and Range are set later.
            *
            * @constructor
            */
            constructor(scale?: D3.Scale.OrdinalScale);
            /**
            * Gets the domain.
            *
            * @returns {any[]} The current domain.
            */
            public domain(): any[];
            /**
            * Sets the domain.
            *
            * @param {any[]} values The new values for the domain. This array may contain more than 2 values.
            * @returns {Ordinal} The calling Ordinal Scale.
            */
            public domain(values: any[]): Ordinal;
            /**
            * Gets the range of pixels spanned by the Ordinal Scale.
            *
            * @returns {number[]} The pixel range.
            */
            public range(): number[];
            /**
            * Sets the range of pixels spanned by the Ordinal Scale.
            *
            * @param {number[]} values The pixel range to to be spanend by the scale.
            * @returns {Ordinal} The calling Ordinal Scale.
            */
            public range(values: number[]): Ordinal;
            /**
            * Returns the width of the range band. Only valid when rangeType is set to "bands".
            *
            * @returns {number} The range band width or 0 if rangeType isn't "bands".
            */
            public rangeBand(): number;
            public innerPadding(): number;
            public fullBandStartAndWidth(v: any): number[];
            /**
            * Gets the range type.
            *
            * @returns {string} The current range type.
            */
            public rangeType(): string;
            /**
            * Sets the range type.
            *
            * @param {string} rangeType Either "points" or "bands" indicating the
            *     d3 method used to generate range bounds.
            * @param {number} [outerPadding] The padding outside the range,
            *     proportional to the range step.
            * @param {number} [innerPadding] The padding between bands in the range,
            *     proportional to the range step. This parameter is only used in
            *     "bands" type ranges.
            * @returns {Ordinal} The calling Ordinal Scale.
            */
            public rangeType(rangeType: string, outerPadding?: number, innerPadding?: number): Ordinal;
            /**
            * Creates a copy of the Scale with the same domain and range but without any registered listeners.
            *
            * @returns {Ordinal} A copy of the calling Scale.
            */
            public copy(): Ordinal;
        }
    }
}


declare module Plottable {
    module Scale {
        class Color extends Abstract.Scale {
            /**
            * Creates a ColorScale.
            *
            * @constructor
            * @param {string} [scaleType] the type of color scale to create
            *     (Category10/Category20/Category20b/Category20c).
            * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
            */
            constructor(scaleType?: string);
        }
    }
}


declare module Plottable {
    module Scale {
        class Time extends Abstract.QuantitativeScale {
            /**
            * Creates a new Time Scale.
            *
            * @constructor
            * @param {D3.Scale.Time} [scale] The D3 LinearScale backing the TimeScale. If not supplied, uses a default scale.
            */
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            public tickInterval(interval: D3.Time.Interval, step?: number): any[];
            public domain(): any[];
            public domain(values: any[]): Time;
            /**
            * Creates a copy of the TimeScale with the same domain and range but without any registered listeners.
            *
            * @returns {TimeScale} A copy of the calling TimeScale.
            */
            public copy(): Time;
        }
    }
}


declare module Plottable {
    module Scale {
        /**
        * This class implements a color scale that takes quantitive input and
        * interpolates between a list of color values. It returns a hex string
        * representing the interpolated color.
        *
        * By default it generates a linear scale internally.
        */
        class InterpolatedColor extends Abstract.QuantitativeScale {
            /**
            * Creates a InterpolatedColorScale.
            *
            * @constructor
            * @param {string|string[]} [colorRange] the type of color scale to
            *     create. Default is "reds". @see {@link colorRange} for further
            *     options.
            * @param {string} [scaleType] the type of underlying scale to use
            *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
            *     for further options.
            */
            constructor(colorRange?: any, scaleType?: string);
            /**
            * Gets the color range.
            *
            * @returns {string[]} the current color values for the range as strings.
            */
            public colorRange(): string[];
            /**
            * Sets the color range.
            *
            * @param {string|string[]} colorRange. If colorRange is one of
            *     (reds/blues/posneg), uses the built-in color groups. If colorRange
            *     is an array of strings with at least 2 values
            *     (e.g. ["#FF00FF", "red", "dodgerblue"], the resulting scale
            *     will interpolate between the color values across the domain.
            * @returns {InterpolatedColor} The calling InterpolatedColor Scale.
            */
            public colorRange(colorRange: any): InterpolatedColor;
            /**
            * Gets the internal scale type.
            *
            * @returns {string} The current scale type.
            */
            public scaleType(): string;
            /**
            * Sets the internal scale type.
            *
            * @param {string} scaleType. The type of d3 scale to use internally.
            *                            (linear/log/sqrt/pow).
            * @returns {InterpolatedColor} The calling InterpolatedColor Scale.
            */
            public scaleType(scaleType: string): InterpolatedColor;
            public autoDomain(): InterpolatedColor;
        }
    }
}


declare module Plottable {
    module Util {
        class ScaleDomainCoordinator {
            /**
            * Creates a ScaleDomainCoordinator.
            *
            * @constructor
            * @param {Scale[]} scales A list of scales whose domains should be linked.
            */
            constructor(scales: Abstract.Scale[]);
            public rescale(scale: Abstract.Scale): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Axis extends Component {
            /**
            * The css class applied to each end tick mark (the line on the end tick).
            */
            static END_TICK_MARK_CLASS: string;
            /**
            * The css class applied to each tick mark (the line on the tick).
            */
            static TICK_MARK_CLASS: string;
            /**
            * The css class applied to each tick label (the text associated with the tick).
            */
            static TICK_LABEL_CLASS: string;
            constructor(scale: Scale, orientation: string, formatter?: (d: any) => string);
            public remove(): void;
            /**
            * Gets the current width.
            *
            * @returns {number} The current width.
            */
            public width(): number;
            /**
            * Sets a user-specified width.
            *
            * @param {number|String} w A fixed width for the Axis, or "auto" for automatic mode.
            * @returns {Axis} The calling Axis.
            */
            public width(w: any): Axis;
            /**
            * Gets the current height.
            *
            * @returns {number} The current height.
            */
            public height(): number;
            /**
            * Sets a user-specified height.
            *
            * @param {number|String} h A fixed height for the Axis, or "auto" for automatic mode.
            * @returns {Axis} The calling Axis.
            */
            public height(h: any): Axis;
            /**
            * Get the current formatter on the axis.
            *
            * @returns {Formatter} the axis formatter
            */
            public formatter(): Formatter;
            /**
            * Sets a new tick formatter.
            *
            * @param {Formatter} formatter
            * @returns {Abstract.Axis} The calling Axis.
            */
            public formatter(formatter: Formatter): Axis;
            /**
            * Gets the current tick mark length.
            *
            * @returns {number} The current tick mark length.
            */
            public tickLength(): number;
            /**
            * Sets the tick mark length.
            *
            * @param {number} length The length of each tick.
            * @returns {BaseAxis} The calling Axis.
            */
            public tickLength(length: number): Axis;
            /**
            * Gets the current end tick mark length.
            *
            * @returns {number} The current end tick mark length.
            */
            public endTickLength(): number;
            /**
            * Sets the end tick mark length.
            *
            * @param {number} length The length of the end ticks.
            * @returns {BaseAxis} The calling Axis.
            */
            public endTickLength(length: number): Axis;
            /**
            * Gets the padding between each tick mark and its associated label.
            *
            * @returns {number} The current padding, in pixels.
            */
            public tickLabelPadding(): number;
            /**
            * Sets the padding between each tick mark and its associated label.
            *
            * @param {number} padding The desired padding, in pixels.
            * @returns {Axis} The calling Axis.
            */
            public tickLabelPadding(padding: number): Axis;
            /**
            * Gets the size of the gutter (the extra space between the tick labels and the outer edge of the axis).
            *
            * @returns {number} The current size of the gutter, in pixels.
            */
            public gutter(): number;
            /**
            * Sets the size of the gutter (the extra space between the tick labels and the outer edge of the axis).
            *
            * @param {number} size The desired size of the gutter, in pixels.
            * @returns {Axis} The calling Axis.
            */
            public gutter(size: number): Axis;
            /**
            * Gets the orientation of the Axis.
            *
            * @returns {string} The current orientation.
            */
            public orient(): string;
            /**
            * Sets the orientation of the Axis.
            *
            * @param {string} newOrientation The desired orientation (top/bottom/left/right).
            * @returns {Axis} The calling Axis.
            */
            public orient(newOrientation: string): Axis;
            /**
            * Checks whether the Axis is currently set to show the first and last
            * tick labels.
            *
            * @returns {boolean}
            */
            public showEndTickLabels(): boolean;
            /**
            * Set whether or not to show the first and last tick labels.
            *
            * @param {boolean} show Whether or not to show the first and last labels.
            * @returns {Axis} The calling Axis.
            */
            public showEndTickLabels(show: boolean): Axis;
        }
    }
}


declare module Plottable {
    module Axis {
        interface ITimeInterval {
            timeUnit: D3.Time.Interval;
            step: number;
            formatString: string;
        }
        class Time extends Abstract.Axis {
            static minorIntervals: ITimeInterval[];
            static majorIntervals: ITimeInterval[];
            /**
            * Creates a TimeAxis
            *
            * @constructor
            * @param {TimeScale} scale The scale to base the Axis on.
            * @param {string} orientation The orientation of the Axis (top/bottom)
            */
            constructor(scale: Scale.Time, orientation: string);
            public calculateWorstWidth(container: D3.Selection, format: string): number;
            public getIntervalLength(interval: ITimeInterval): number;
            public isEnoughSpace(container: D3.Selection, interval: ITimeInterval): boolean;
        }
    }
}


declare module Plottable {
    module Axis {
        class Numeric extends Abstract.Axis {
            /**
            * Creates a NumericAxis.
            *
            * @constructor
            * @param {QuantitativeScale} scale The QuantitativeScale to base the NumericAxis on.
            * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
            * @param {Formatter} [formatter] A function to format tick labels (default Formatters.general(3, false)).
            */
            constructor(scale: Abstract.QuantitativeScale, orientation: string, formatter?: (d: any) => string);
            /**
            * Gets the tick label position relative to the tick marks.
            *
            * @returns {string} The current tick label position.
            */
            public tickLabelPosition(): string;
            /**
            * Sets the tick label position relative to the tick marks.
            *
            * @param {string} position The relative position of the tick label.
            *                          [top/center/bottom] for a vertical NumericAxis,
            *                          [left/center/right] for a horizontal NumericAxis.
            * @returns {NumericAxis} The calling NumericAxis.
            */
            public tickLabelPosition(position: string): Numeric;
            /**
            * Return whether or not the tick labels at the end of the graph are
            * displayed when partially cut off.
            *
            * @param {string} orientation Where on the scale to change tick labels.
            *                 On a "top" or "bottom" axis, this can be "left" or
            *                 "right". On a "left" or "right" axis, this can be "top"
            *                 or "bottom".
            * @returns {boolean} The current setting.
            */
            public showEndTickLabel(orientation: string): boolean;
            /**
            * Control whether or not the tick labels at the end of the graph are
            * displayed when partially cut off.
            *
            * @param {string} orientation Where on the scale to change tick labels.
            *                 On a "top" or "bottom" axis, this can be "left" or
            *                 "right". On a "left" or "right" axis, this can be "top"
            *                 or "bottom".
            * @param {boolean} show Whether or not the given tick should be displayed.
            * @returns {Numeric} The calling Numeric.
            */
            public showEndTickLabel(orientation: string, show: boolean): Numeric;
        }
    }
}


declare module Plottable {
    module Axis {
        class Category extends Abstract.Axis {
            /**
            * Creates a CategoryAxis.
            *
            * A CategoryAxis takes an OrdinalScale and includes word-wrapping algorithms and advanced layout logic to try to
            * display the scale as efficiently as possible.
            *
            * @constructor
            * @param {OrdinalScale} scale The scale to base the Axis on.
            * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
            * @param {Formatter} [formatter] The Formatter for the Axis (default Formatters.identity())
            */
            constructor(scale: Scale.Ordinal, orientation?: string, formatter?: (d: any) => string);
        }
    }
}


declare module Plottable {
    module Component {
        class Label extends Abstract.Component {
            /**
            * Creates a Label.
            *
            * @constructor
            * @param {string} [displayText] The text of the Label.
            * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
            */
            constructor(displayText?: string, orientation?: string);
            public xAlign(alignment: string): Label;
            public yAlign(alignment: string): Label;
            /**
            * Retrieve the current text on the Label.
            *
            * @returns {string} The text on the label.
            */
            public text(): string;
            /**
            * Sets the text on the Label.
            *
            * @param {string} displayText The new text for the Label.
            * @returns {Label} The calling Label.
            */
            public text(displayText: string): Label;
        }
        class TitleLabel extends Label {
            constructor(text?: string, orientation?: string);
        }
        class AxisLabel extends Label {
            constructor(text?: string, orientation?: string);
        }
    }
}


declare module Plottable {
    module Component {
        interface ToggleCallback {
            (datum: string, newState: boolean): any;
        }
        interface HoverCallback {
            (datum?: string): any;
        }
        class Legend extends Abstract.Component {
            /**
            * The css class applied to each legend row
            */
            static SUBELEMENT_CLASS: string;
            /**
            * Creates a Legend.
            *
            * A legend consists of a series of legend rows, each with a color and label taken from the `colorScale`.
            * The rows will be displayed in the order of the `colorScale` domain.
            * This legend also allows interactions, through the functions `toggleCallback` and `hoverCallback`
            * Setting a callback will also put classes on the individual rows.
            *
            * @constructor
            * @param {Scale.Color} colorScale
            */
            constructor(colorScale?: Scale.Color);
            public remove(): void;
            /**
            * Assigns or gets the callback to the Legend
            *
            * This callback is associated with toggle events, which trigger when a legend row is clicked.
            * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
            * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
            * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
            *
            * @param {ToggleCallback} callback The new callback function
            */
            public toggleCallback(callback: ToggleCallback): Legend;
            public toggleCallback(): ToggleCallback;
            /**
            * Assigns or gets the callback to the Legend
            * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
            * Setting a callback will also set the class "hover" to all legend row,
            * as well as the class "focus" to the legend row being hovered over.
            * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
            *
            * @param{HoverCallback} callback The new callback function
            */
            public hoverCallback(callback: HoverCallback): Legend;
            public hoverCallback(): HoverCallback;
            /**
            * Assigns a new ColorScale to the Legend.
            *
            * @param {ColorScale} scale
            * @returns {Legend} The calling Legend.
            */
            public scale(scale: Scale.Color): Legend;
            public scale(): Scale.Color;
        }
    }
}


declare module Plottable {
    module Component {
        class Gridlines extends Abstract.Component {
            /**
            * Creates a set of Gridlines.
            * @constructor
            *
            * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
            * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
            */
            constructor(xScale: Abstract.QuantitativeScale, yScale: Abstract.QuantitativeScale);
            public remove(): Gridlines;
        }
    }
}


declare module Plottable {
    module Abstract {
        class XYPlot extends Plot {
            public xScale: Scale;
            public yScale: Scale;
            /**
            * Creates an XYPlot.
            *
            * @constructor
            * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            public project(attrToSet: string, accessor: any, scale?: Scale): XYPlot;
        }
    }
}


declare module Plottable {
    module Plot {
        class Scatter extends Abstract.XYPlot {
            /**
            * Creates a ScatterPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Scatter;
        }
    }
}


declare module Plottable {
    module Plot {
        class Grid extends Abstract.XYPlot {
            public colorScale: Abstract.Scale;
            public xScale: Scale.Ordinal;
            public yScale: Scale.Ordinal;
            /**
            * Creates a GridPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {OrdinalScale} xScale The x scale to use.
            * @param {OrdinalScale} yScale The y scale to use.
            * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
            *     cell.
            */
            constructor(dataset: any, xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Abstract.Scale);
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Grid;
        }
    }
}


declare module Plottable {
    module Abstract {
        class BarPlot extends XYPlot {
            static _BarAlignmentToFactor: {
                [alignment: string]: number;
            };
            /**
            * Creates an AbstractBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            /**
            * Sets the baseline for the bars to the specified value.
            *
            * @param {number} value The value to position the baseline at.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public baseline(value: number): BarPlot;
            /**
            * Sets the bar alignment relative to the independent axis.
            * VerticalBarPlot supports "left", "center", "right"
            * HorizontalBarPlot supports "top", "center", "bottom"
            *
            * @param {string} alignment The desired alignment.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public barAlignment(alignment: string): BarPlot;
            /**
            * Selects the bar under the given pixel position (if [xValOrExtent]
            * and [yValOrExtent] are {number}s), under a given line (if only one
            * of [xValOrExtent] or [yValOrExtent] are {IExtent}s) or are under a
            * 2D area (if [xValOrExtent] and [yValOrExtent] are both {IExtent}s).
            *
            * @param {any} xValOrExtent The pixel x position, or range of x values.
            * @param {any} yValOrExtent The pixel y position, or range of y values.
            * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
            * @return {D3.Selection} The selected bar, or null if no bar was selected.
            */
            public selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            /**
            * Deselects all bars.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public deselectAll(): BarPlot;
        }
    }
}


declare module Plottable {
    module Plot {
        /**
        * A VerticalBarPlot draws bars vertically.
        * Key projected attributes:
        *  - "width" - the horizontal width of a bar.
        *      - if an ordinal scale is attached, this defaults to ordinalScale.rangeBand()
        *      - if a quantitative scale is attached, this defaults to 10
        *  - "x" - the horizontal position of a bar
        *  - "y" - the vertical height of a bar
        */
        class VerticalBar extends Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [alignment: string]: number;
            };
            /**
            * Creates a VerticalBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {QuantitativeScale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale);
        }
    }
}


declare module Plottable {
    module Plot {
        /**
        * A HorizontalBarPlot draws bars horizontally.
        * Key projected attributes:
        *  - "width" - the vertical height of a bar (since the bar is rotated horizontally)
        *      - if an ordinal scale is attached, this defaults to ordinalScale.rangeBand()
        *      - if a quantitative scale is attached, this defaults to 10
        *  - "x" - the horizontal length of a bar
        *  - "y" - the vertical position of a bar
        */
        class HorizontalBar extends Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [alignment: string]: number;
            };
            public isVertical: boolean;
            /**
            * Creates a HorizontalBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {QuantitativeScale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.QuantitativeScale, yScale: Abstract.Scale);
        }
    }
}


declare module Plottable {
    module Plot {
        class Line extends Abstract.XYPlot {
            /**
            * Creates a LinePlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
        }
    }
}


declare module Plottable {
    module Plot {
        /**
        * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
        */
        class Area extends Line {
            /**
            * Creates an AreaPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Area;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
        * An animator implementation with no animation. The attributes are
        * immediately set on the selection.
        */
        class Null implements IPlotAnimator {
            public animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
        * The default animator implementation with easing, duration, and delay.
        */
        class Default implements IPlotAnimator {
            public animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any;
            /**
            * Gets the duration of the animation in milliseconds.
            *
            * @returns {Number} The current duration.
            */
            public duration(): Number;
            /**
            * Sets the duration of the animation in milliseconds.
            *
            * @param {Number} duration The duration in milliseconds.
            * @returns {Default} The calling Default Animator.
            */
            public duration(duration: Number): Default;
            /**
            * Gets the delay of the animation in milliseconds.
            *
            * @returns {Number} The current delay.
            */
            public delay(): Number;
            /**
            * Sets the delay of the animation in milliseconds.
            *
            * @param {Number} delay The delay in milliseconds.
            * @returns {Default} The calling Default Animator.
            */
            public delay(delay: Number): Default;
            /**
            * Gets the current easing of the animation.
            *
            * @returns {string} the current easing mode.
            */
            public easing(): string;
            /**
            * Sets the easing mode of the animation.
            *
            * @param {string} easing The desired easing mode.
            * @returns {Default} The calling Default Animator.
            */
            public easing(easing: string): Default;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
        * An animator that delays the animation of the attributes using the index
        * of the selection data.
        *
        * The delay between animations can be configured with the .delay getter/setter.
        */
        class IterativeDelay extends Default {
            public animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any;
        }
    }
}


declare module Plottable {
    module Core {
        interface IKeyEventListenerCallback {
            (e: D3.D3Event): any;
        }
        module KeyEventListener {
            function initialize(): void;
            function addCallback(keyCode: number, cb: IKeyEventListenerCallback): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Interaction {
            public hitBox: D3.Selection;
            public componentToListenTo: Component;
            /**
            * Creates an Interaction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for interactions on.
            */
            constructor(componentToListenTo: Component);
            /**
            * Registers the Interaction on the Component it's listening to.
            * This needs to be called to activate the interaction.
            */
            public registerWithComponent(): Interaction;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Click extends Abstract.Interaction {
            /**
            * Creates a ClickInteraction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for clicks on.
            */
            constructor(componentToListenTo: Abstract.Component);
            /**
            * Sets an callback to be called when a click is received.
            *
            * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
            */
            public callback(cb: (x: number, y: number) => any): Click;
        }
        class DoubleClick extends Click {
            /**
            * Creates a DoubleClickInteraction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for clicks on.
            */
            constructor(componentToListenTo: Abstract.Component);
        }
    }
}


declare module Plottable {
    module Interaction {
        class Mousemove extends Abstract.Interaction {
            constructor(componentToListenTo: Abstract.Component);
            public mousemove(x: number, y: number): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Key extends Abstract.Interaction {
            /**
            * Creates a KeyInteraction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for keypresses on.
            * @param {number} keyCode The key code to listen for.
            */
            constructor(componentToListenTo: Abstract.Component, keyCode: number);
            /**
            * Sets an callback to be called when the designated key is pressed.
            *
            * @param {() => any} cb: Callback to be called.
            */
            public callback(cb: () => any): Key;
        }
    }
}


declare module Plottable {
    module Interaction {
        class PanZoom extends Abstract.Interaction {
            public xScale: Abstract.QuantitativeScale;
            public yScale: Abstract.QuantitativeScale;
            /**
            * Creates a PanZoomInteraction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for interactions on.
            * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
            * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
            */
            constructor(componentToListenTo: Abstract.Component, xScale?: Abstract.QuantitativeScale, yScale?: Abstract.QuantitativeScale);
            public resetZoom(): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Drag extends Abstract.Interaction {
            public origin: number[];
            public location: number[];
            public callbackToCall: (dragInfo: any) => any;
            /**
            * Creates a Drag.
            *
            * @param {Component} componentToListenTo The component to listen for interactions on.
            */
            constructor(componentToListenTo: Abstract.Component);
            /**
            * Adds a callback to be called when the AreaInteraction triggers.
            *
            * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
            * @returns {AreaInteraction} The calling AreaInteraction.
            */
            public callback(cb?: (a: any) => any): Drag;
            public setupZoomCallback(xScale?: Abstract.QuantitativeScale, yScale?: Abstract.QuantitativeScale): Drag;
        }
    }
}


declare module Plottable {
    module Interaction {
        class DragBox extends Drag {
            public dragBox: D3.Selection;
            public boxIsDrawn: boolean;
            /**
            * Clears the highlighted drag-selection box drawn by the AreaInteraction.
            *
            * @returns {AreaInteraction} The calling AreaInteraction.
            */
            public clearBox(): DragBox;
            public setBox(x0: number, x1: number, y0: number, y1: number): DragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XDragBox extends DragBox {
            public setBox(x0: number, x1: number): XDragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XYDragBox extends DragBox {
        }
    }
}


declare module Plottable {
    module Interaction {
        class YDragBox extends DragBox {
            public setBox(y0: number, y1: number): YDragBox;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Dispatcher extends PlottableObject {
            /**
            * Creates a Dispatcher with the specified target.
            *
            * @param {D3.Selection} target The selection to listen for events on.
            */
            constructor(target: D3.Selection);
            /**
            * Gets the target of the Dispatcher.
            *
            * @returns {D3.Selection} The Dispatcher's current target.
            */
            public target(): D3.Selection;
            /**
            * Sets the target of the Dispatcher.
            *
            * @param {D3.Selection} target The element to listen for updates on.
            * @returns {Dispatcher} The calling Dispatcher.
            */
            public target(targetElement: D3.Selection): Dispatcher;
            /**
            * Attaches the Dispatcher's listeners to the Dispatcher's target element.
            *
            * @returns {Dispatcher} The calling Dispatcher.
            */
            public connect(): Dispatcher;
            /**
            * Detaches the Dispatcher's listeners from the Dispatchers' target element.
            *
            * @returns {Dispatcher} The calling Dispatcher.
            */
            public disconnect(): Dispatcher;
        }
    }
}


declare module Plottable {
    module Dispatcher {
        class Mouse extends Abstract.Dispatcher {
            /**
            * Creates a Mouse Dispatcher with the specified target.
            *
            * @param {D3.Selection} target The selection to listen for events on.
            */
            constructor(target: D3.Selection);
            /**
            * Gets the current callback to be called on mouseover.
            *
            * @return {(location: Point) => any} The current mouseover callback.
            */
            public mouseover(): (location: Point) => any;
            /**
            * Attaches a callback to be called on mouseover.
            *
            * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
            *                                            Pass in null to remove the callback.
            * @return {Mouse} The calling Mouse Handler.
            */
            public mouseover(callback: (location: Point) => any): Mouse;
            /**
            * Gets the current callback to be called on mousemove.
            *
            * @return {(location: Point) => any} The current mousemove callback.
            */
            public mousemove(): (location: Point) => any;
            /**
            * Attaches a callback to be called on mousemove.
            *
            * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
            *                                            Pass in null to remove the callback.
            * @return {Mouse} The calling Mouse Handler.
            */
            public mousemove(callback: (location: Point) => any): Mouse;
            /**
            * Gets the current callback to be called on mouseout.
            *
            * @return {(location: Point) => any} The current mouseout callback.
            */
            public mouseout(): (location: Point) => any;
            /**
            * Attaches a callback to be called on mouseout.
            *
            * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
            *                                            Pass in null to remove the callback.
            * @return {Mouse} The calling Mouse Handler.
            */
            public mouseout(callback: (location: Point) => any): Mouse;
        }
    }
}


declare module Plottable {
    module Template {
        class StandardChart extends Component.Table {
            constructor();
            public yAxis(y: Abstract.Axis): StandardChart;
            public yAxis(): Abstract.Axis;
            public xAxis(x: Abstract.Axis): StandardChart;
            public xAxis(): Abstract.Axis;
            public yLabel(y: Component.AxisLabel): StandardChart;
            public yLabel(y: string): StandardChart;
            public yLabel(): Component.AxisLabel;
            public xLabel(x: Component.AxisLabel): StandardChart;
            public xLabel(x: string): StandardChart;
            public xLabel(): Component.AxisLabel;
            public titleLabel(x: Component.TitleLabel): StandardChart;
            public titleLabel(x: string): StandardChart;
            public titleLabel(): Component.TitleLabel;
            public center(c: Abstract.Component): StandardChart;
        }
    }
}
