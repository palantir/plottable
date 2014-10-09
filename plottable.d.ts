
declare module Plottable {
    module _Util {
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
             * Due to the fact that D3.Sets store strings internally, return type is always a string set
             *
             * @param {D3.Set<T>} set1 The first set
             * @param {D3.Set<T>} set2 The second set
             * @return {D3.Set<string>} A set that contains elements that appear in both set1 and set2
             */
            function intersection<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            /**
             * Take an accessor object (may be a string to be made into a key, or a value, or a color code)
             * and "activate" it by turning it into a function in (datum, index, metadata)
             */
            function accessorize(accessor: any): _Accessor;
            /**
             * Take an accessor object, activate it, and partially apply it to a Plot's datasource's metadata.
             * Temporarily always grabs the metadata of the first dataset.
             * HACKHACK #1089 - The accessor currently only grabs the first dataset's metadata
             */
            function _applyAccessor(accessor: _Accessor, plot: Plot.AbstractPlot): (d: any, i: number) => any;
            /**
             * Takes two sets and returns the union
             *
             * Due to the fact that D3.Sets store strings internally, return type is always a string set
             *
             * @param {D3.Set<T>} set1 The first set
             * @param {D3.Set<T>} set2 The second set
             * @return {D3.Set<string>} A set that contains elements that appear in either set1 or set2
             */
            function union<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            /**
             * Populates a map from an array of keys and a transformation function.
             *
             * @param {string[]} keys The array of keys.
             * @param {(string, number) => T} transform A transformation function to apply to the keys.
             * @return {D3.Map<T>} A map mapping keys to their transformed values.
             */
            function populateMap<T>(keys: string[], transform: (key: string, index: number) => T): D3.Map<T>;
            /**
             * Take an array of values, and return the unique values.
             * Will work iff ∀ a, b, a.toString() == b.toString() => a == b; will break on Object inputs
             *
             * @param {T[]} values The values to find uniqueness for
             * @return {T[]} The unique values
             */
            function uniq<T>(arr: T[]): T[];
            /**
             * Creates an array of length `count`, filled with value or (if value is a function), value()
             *
             * @param {any} value The value to fill the array with, or, if a function, a generator for values (called with index as arg)
             * @param {number} count The length of the array to generate
             * @return {any[]}
             */
            function createFilledArray<T>(value: T, count: number): T[];
            function createFilledArray<T>(func: (index?: number) => T, count: number): T[];
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
            function max(arr: number[], default_val?: number): number;
            function max<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
            function min(arr: number[], default_val?: number): number;
            function min<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
        }
    }
}


declare module Plottable {
    module _Util {
        module OpenSource {
            /**
             * Returns the sortedIndex for inserting a value into an array.
             * Takes a number and an array of numbers OR an array of objects and an accessor that returns a number.
             * @param {number} value: The numerical value to insert
             * @param {any[]} arr: Array to find insertion index, can be number[] or any[] (if accessor provided)
             * @param {_Accessor} accessor: If provided, this function is called on members of arr to determine insertion index
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
            function sortedIndex(val: number, arr: any[], accessor: _Accessor): number;
        }
    }
}


declare module Plottable {
    module _Util {
        class IDCounter {
            increment(id: any): number;
            decrement(id: any): number;
            get(id: any): number;
        }
    }
}


declare module Plottable {
    module _Util {
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
            set(key: any, value: any): boolean;
            /**
             * Get a value from the store, given a key.
             *
             * @param {any} key Key associated with value to retrieve
             * @return {any} Value if found, undefined otherwise
             */
            get(key: any): any;
            /**
             * Test whether store has a value associated with given key.
             *
             * Will return true if there is a key/value entry,
             * even if the value is explicitly `undefined`.
             *
             * @param {any} key Key to test for presence of an entry
             * @return {boolean} Whether there was a matching entry for that key
             */
            has(key: any): boolean;
            /**
             * Return an array of the values in the key-value store
             *
             * @return {any[]} The values in the store
             */
            values(): any[];
            /**
             * Return an array of keys in the key-value store
             *
             * @return {any[]} The keys in the store
             */
            keys(): any[];
            /**
             * Execute a callback for each entry in the array.
             *
             * @param {(key: any, val?: any, index?: number) => any} callback The callback to eecute
             * @return {any[]} The results of mapping the callback over the entries
             */
            map(cb: (key?: any, val?: any, index?: number) => any): any[];
            /**
             * Delete a key from the key-value store. Return whether the key was present.
             *
             * @param {any} The key to remove
             * @return {boolean} Whether a matching entry was found and removed
             */
            delete(key: any): boolean;
        }
    }
}


declare module Plottable {
    module _Util {
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
            get(k: string): T;
            /**
             * Reset the cache empty.
             *
             * If canonicalKey was provided at construction, compute(canonicalKey)
             * will be re-run. If the result matches what is already in the cache,
             * it will not clear the cache.
             *
             * @return {Cache<T>} The calling Cache.
             */
            clear(): Cache<T>;
        }
    }
}


declare module Plottable {
    module _Util {
        module Text {
            var HEIGHT_TEXT: string;
            interface Dimensions {
                width: number;
                height: number;
            }
            interface TextMeasurer {
                (s: string): Dimensions;
            }
            /**
             * Returns a quasi-pure function of typesignature (t: string) => Dimensions which measures height and width of text
             * in the given text selection
             *
             * @param {D3.Selection} selection: A temporary text selection that the string will be placed into for measurement.
             *                                  Will be removed on function creation and appended only for measurement.
             * @returns {Dimensions} width and height of the text
             */
            function getTextMeasurer(selection: D3.Selection): TextMeasurer;
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
                measure: TextMeasurer;
                /**
                 * @param {D3.Selection} textSelection The element that will have text inserted into
                 *        it in order to measure text. The styles present for text in
                 *        this element will to the text being measured.
                 */
                constructor(textSelection: D3.Selection);
                /**
                 * Clear the cache, if it seems that the text has changed size.
                 */
                clear(): CachingCharacterMeasurer;
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
             * Takes a line, a width to fit it in, and a text measurer. Will attempt to add ellipses to the end of the line,
             * shortening the line as required to ensure that it fits within width.
             */
            function addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
            function writeLineHorizontally(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeLineVertically(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
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
            function writeText(text: string, width: number, height: number, tm: TextMeasurer, orientation?: string, write?: IWriteOptions): IWriteTextResult;
        }
    }
}


declare module Plottable {
    module _Util {
        module WordWrap {
            interface WrappedText {
                originalText: string;
                lines: string[];
                textFits: boolean;
            }
            /**
             * Takes a block of text, a width and height to fit it in, and a 2-d text measurement function.
             * Wraps words and fits as much of the text as possible into the given width and height.
             */
            function breakTextToFitRect(text: string, width: number, height: number, measureText: Text.TextMeasurer): WrappedText;
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
    module _Util {
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
    module Formatters {
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
        function currency(precision?: number, symbol?: string, prefix?: boolean, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
         * Creates a formatter that displays exactly [precision] decimal places.
         *
         * @param {number} [precision] The number of decimal places to show (default 3).
         * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
         *
         * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
         */
        function fixed(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
         * Creates a formatter that formats numbers to show no more than
         * [precision] decimal places. All other values are stringified.
         *
         * @param {number} [precision] The number of decimal places to show (default 3).
         * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
         *
         * @returns {Formatter} A formatter for general values.
         */
        function general(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
         * Creates a formatter that stringifies its input.
         *
         * @returns {Formatter} A formatter that stringifies its input.
         */
        function identity(): (d: any) => string;
        /**
         * Creates a formatter for percentage values.
         * Multiplies the input by 100 and appends "%".
         *
         * @param {number} [precision] The number of decimal places to show (default 0).
         * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
         *
         * @returns {Formatter} A formatter for percentage values.
         */
        function percentage(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        /**
         * Creates a formatter for values that displays [precision] significant figures
         * and puts SI notation.
         *
         * @param {number} [precision] The number of significant figures to show (default 3).
         *
         * @returns {Formatter} A formatter for SI values.
         */
        function siSuffix(precision?: number): (d: any) => string;
        /**
         * Creates a formatter that displays dates.
         *
         * @returns {Formatter} A formatter for time/date values.
         */
        function time(): (d: any) => string;
        /**
         * Creates a formatter for relative dates.
         *
         * @param {number} baseValue The start date (as epoch time) used in computing relative dates (default 0)
         * @param {number} increment The unit used in calculating relative date values (default MILLISECONDS_IN_ONE_DAY)
         * @param {string} label The label to append to the formatted string (default "")
         *
         * @returns {Formatter} A formatter for time/date values.
         */
        function relativeDate(baseValue?: number, increment?: number, label?: string): (d: any) => string;
    }
}


declare module Plottable {
    var version: string;
}


declare module Plottable {
    module Core {
        /**
         * Colors we use as defaults on a number of graphs.
         */
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
    module Core {
        /**
         * A class most other Plottable classes inherit from, in order to have a
         * unique ID.
         */
        class PlottableObject {
            _plottableID: number;
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
         * listenable: Plottable.Listenable;
         * listenable.broadcaster.registerListener(callbackToCallOnBroadcast)
         */
        interface Listenable {
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
        interface BroadcasterCallback {
            (listenable: Listenable, ...args: any[]): any;
        }
        /**
         * The Broadcaster class is owned by an Listenable. Third parties can register and deregister listeners
         * from the broadcaster. When the broadcaster.broadcast method is activated, all registered callbacks are
         * called. The registered callbacks are called with the registered Listenable that the broadcaster is attached
         * to, along with optional arguments passed to the `broadcast` method.
         *
         * The listeners are called synchronously.
         */
        class Broadcaster extends PlottableObject {
            listenable: Listenable;
            /**
             * Constructs a broadcaster, taking the Listenable that the broadcaster will be attached to.
             *
             * @constructor
             * @param {Listenable} listenable The Listenable-object that this broadcaster is attached to.
             */
            constructor(listenable: Listenable);
            /**
             * Registers a callback to be called when the broadcast method is called. Also takes a key which
             * is used to support deregistering the same callback later, by passing in the same key.
             * If there is already a callback associated with that key, then the callback will be replaced.
             *
             * @param key The key associated with the callback. Key uniqueness is determined by deep equality.
             * @param {BroadcasterCallback} callback A callback to be called when the Scale's domain changes.
             * @returns {Broadcaster} this object
             */
            registerListener(key: any, callback: BroadcasterCallback): Broadcaster;
            /**
             * Call all listening callbacks, optionally with arguments passed through.
             *
             * @param ...args A variable number of optional arguments
             * @returns {Broadcaster} this object
             */
            broadcast(...args: any[]): Broadcaster;
            /**
             * Deregisters the callback associated with a key.
             *
             * @param key The key to deregister.
             * @returns {Broadcaster} this object
             */
            deregisterListener(key: any): Broadcaster;
            /**
             * Deregisters all listeners and callbacks associated with the broadcaster.
             *
             * @returns {Broadcaster} this object
             */
            deregisterAllListeners(): void;
        }
    }
}


declare module Plottable {
    class Dataset extends Core.PlottableObject implements Core.Listenable {
        broadcaster: any;
        /**
         * Constructs a new set.
         *
         * A Dataset is mostly just a wrapper around an any[], Dataset is the
         * data you're going to plot.
         *
         * @constructor
         * @param {any[]} data The data for this DataSource (default = []).
         * @param {any} metadata An object containing additional information (default = {}).
         */
        constructor(data?: any[], metadata?: any);
        /**
         * Gets the data.
         *
         * @returns {DataSource|any[]} The calling DataSource, or the current data.
         */
        data(): any[];
        /**
         * Sets the data.
         *
         * @param {any[]} data The new data.
         * @returns {Dataset} The calling Dataset.
         */
        data(data: any[]): Dataset;
        /**
         * Get the metadata.
         *
         * @returns {any} the current
         * metadata.
         */
        metadata(): any;
        /**
         * Set the metadata.
         *
         * @param {any} metadata The new metadata.
         * @returns {Dataset} The calling Dataset.
         */
        metadata(metadata: any): Dataset;
        _getExtent(accessor: _Accessor, typeCoercer: (d: any) => any): any[];
    }
}


declare module Plottable {
    module Core {
        module RenderController {
            module RenderPolicy {
                /**
                 * A policy to render components.
                 */
                interface RenderPolicy {
                    render(): any;
                }
                /**
                 * Never queue anything, render everything immediately. Useful for
                 * debugging, horrible for performance.
                 */
                class Immediate implements RenderPolicy {
                    render(): void;
                }
                /**
                 * The default way to render, which only tries to render every frame
                 * (usually, 1/60th of a second).
                 */
                class AnimationFrame implements RenderPolicy {
                    render(): void;
                }
                /**
                 * Renders with `setTimeout`. This is generally an inferior way to render
                 * compared to `requestAnimationFrame`, but it's still there if you want
                 * it.
                 */
                class Timeout implements RenderPolicy {
                    _timeoutMsec: number;
                    render(): void;
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
         *
         * If you want to always have immediate rendering (useful for debugging),
         * call
         * ```typescript
         * Plottable.Core.RenderController.setRenderPolicy(
         *   new Plottable.Core.RenderController.RenderPolicy.Immediate()
         * );
         * ```
         */
        module RenderController {
            var _renderPolicy: RenderPolicy.RenderPolicy;
            function setRenderPolicy(policy: string): void;
            function setRenderPolicy(policy: RenderPolicy.RenderPolicy): void;
            /**
             * If the RenderController is enabled, we enqueue the component for
             * render. Otherwise, it is rendered immediately.
             *
             * @param {AbstractComponent} component Any Plottable component.
             */
            function registerToRender(c: Component.AbstractComponent): void;
            /**
             * If the RenderController is enabled, we enqueue the component for
             * layout and render. Otherwise, it is rendered immediately.
             *
             * @param {AbstractComponent} component Any Plottable component.
             */
            function registerToComputeLayout(c: Component.AbstractComponent): void;
            /**
             * Render everything that is waiting to be rendered right now, instead of
             * waiting until the next frame.
             *
             * Useful to call when debugging.
             */
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
             * Checks if the window has been resized and the RenderController
             * has not yet been flushed.
             *
             * @returns {boolean} If the window has been resized/RenderController
             * has not yet been flushed.
             */
            function resizing(): boolean;
            /**
             * Sets that it is not resizing anymore. Good if it stubbornly thinks
             * it is still resizing, or for cancelling the effects of resizing
             * prematurely.
             */
            function clearResizing(): void;
            /**
             * Registers a component.
             *
             * When the window is resized, ._invalidateLayout() is invoked on the
             * component, which will enqueue the component for layout and rendering
             * with the RenderController.
             *
             * @param {Component} component Any Plottable component.
             */
            function register(c: Component.AbstractComponent): void;
            /**
             * Deregisters the components.
             *
             * The component will no longer receive updates on window resize.
             *
             * @param {Component} component Any Plottable component.
             */
            function deregister(c: Component.AbstractComponent): void;
        }
    }
}

declare module Plottable {
    interface DatasetInterface {
        data: any[];
        metadata: Metadata;
    }
    interface Metadata {
        cssClass?: string;
        color?: string;
    }
    interface _Accessor {
        (datum: any, index?: number, metadata?: any): any;
    }
    /**
     * A function to map across the data in a DataSource. For example, if your
     * data looked like `{foo: 5, bar: 6}`, then a popular function might be
     * `function(d) { return d.foo; }`.
     *
     * Index, if used, will be the index of the datum in the array.
     */
    interface AppliedAccessor {
        (datum?: any, index?: number): any;
    }
    interface _Projector {
        accessor: _Accessor;
        scale?: Scale.AbstractScale<any, any>;
        attribute: string;
    }
    /**
     * A mapping from attributes ("x", "fill", etc.) to the functions that get
     * that information out of the data.
     *
     * So if my data looks like `{foo: 5, bar: 6}` and I want the radius to scale
     * with both `foo` and `bar`, an entry in this type might be `{"r":
     * function(d) { return foo + bar; }`.
     */
    interface AttributeToProjector {
        [attrToSet: string]: AppliedAccessor;
    }
    /**
     * A simple bounding box.
     */
    interface SelectionArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    interface _SpaceRequest {
        width: number;
        height: number;
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    interface _PixelArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    /**
     * The range of your current data. For example, [1, 2, 6, -5] has the Extent
     * `{min: -5, max: 6}`.
     *
     * The point of this type is to hopefully replace the less-elegant `[min,
     * max]` extents produced by d3.
     */
    interface Extent {
        min: number;
        max: number;
    }
    /**
     * A simple location on the screen.
     */
    interface Point {
        x: number;
        y: number;
    }
    /**
     * A key that is also coupled with a dataset and a drawer.
     */
    interface DatasetDrawerKey {
        dataset: Dataset;
        drawer: _Drawer.AbstractDrawer;
        key: string;
    }
}


declare module Plottable {
    class Domainer {
        /**
         * Constructs a new Domainer.
         *
         * @constructor
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
         * @param {QuantitativeScale} scale
         *        Since nice() must do different things depending on Linear, Log,
         *        or Time scale, the scale must be passed in for nice() to work.
         * @returns {any[]} The domain, as a merging of all exents, as a [min, max]
         *                 pair.
         */
        computeDomain(extents: any[][], scale: Scale.AbstractQuantitative<any>): any[];
        /**
         * Sets the Domainer to pad by a given ratio.
         *
         * @param {number} padProportion Proportionally how much bigger the
         *         new domain should be (0.05 = 5% larger).
         *
         *         A domainer will pad equal visual amounts on each side.
         *         On a linear scale, this means both sides are padded the same
         *         amount: [10, 20] will be padded to [5, 25].
         *         On a log scale, the top will be padded more than the bottom, so
         *         [10, 100] will be padded to [1, 1000].
         *
         * @returns {Domainer} The calling Domainer.
         */
        pad(padProportion?: number): Domainer;
        /**
         * Adds a padding exception, a value that will not be padded at either end of the domain.
         *
         * Eg, if a padding exception is added at x=0, then [0, 100] will pad to [0, 105] instead of [-2.5, 102.5].
         * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
         * If a key is not provided, it will be added with set semantics (Can be removed by value)
         *
         * @param {any} exception The padding exception to add.
         * @param {string} key The key to register the exception under.
         * @returns {Domainer} The calling domainer
         */
        addPaddingException(exception: any, key?: string): Domainer;
        /**
         * Removes a padding exception, allowing the domain to pad out that value again.
         *
         * If a string is provided, it is assumed to be a key and the exception associated with that key is removed.
         * If a non-string is provdied, it is assumed to be an unkeyed exception and that exception is removed.
         *
         * @param {any} keyOrException The key for the value to remove, or the value to remove
         * @return {Domainer} The calling domainer
         */
        removePaddingException(keyOrException: any): Domainer;
        /**
         * Adds an included value, a value that must be included inside the domain.
         *
         * Eg, if a value exception is added at x=0, then [50, 100] will expand to [0, 100] rather than [50, 100].
         * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
         * If a key is not provided, it will be added with set semantics (Can be removed by value)
         *
         * @param {any} value The included value to add.
         * @param {string} key The key to register the value under.
         * @returns {Domainer} The calling domainer
         */
        addIncludedValue(value: any, key?: string): Domainer;
        /**
         * Remove an included value, allowing the domain to not include that value gain again.
         *
         * If a string is provided, it is assumed to be a key and the value associated with that key is removed.
         * If a non-string is provdied, it is assumed to be an unkeyed value and that value is removed.
         *
         * @param {any} keyOrException The key for the value to remove, or the value to remove
         * @return {Domainer} The calling domainer
         */
        removeIncludedValue(valueOrKey: any): Domainer;
        /**
         * Extends the scale's domain so it starts and ends with "nice" values.
         *
         * @param {number} count The number of ticks that should fit inside the new domain.
         * @return {Domainer} The calling Domainer.
         */
        nice(count?: number): Domainer;
    }
}


declare module Plottable {
    module Scale {
        class AbstractScale<D, R> extends Core.PlottableObject implements Core.Listenable {
            _d3Scale: D3.Scale.Scale;
            _autoDomainAutomatically: boolean;
            broadcaster: any;
            _rendererAttrID2Extent: {
                [x: string]: D[];
            };
            _typeCoercer: (d: any) => any;
            /**
             * Constructs a new Scale.
             *
             * A Scale is a wrapper around a D3.Scale.Scale. A Scale is really just a
             * function. Scales have a domain (input), a range (output), and a function
             * from domain to range.
             *
             * @constructor
             * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
             */
            constructor(scale: D3.Scale.Scale);
            _getAllExtents(): D[][];
            _getExtent(): D[];
            /**
             * Modifies the domain on the scale so that it includes the extent of all
             * perspectives it depends on. This will normally happen automatically, but
             * if you set domain explicitly with `plot.domain(x)`, you will need to
             * call this function if you want the domain to neccessarily include all
             * the data.
             *
             * Extent: The [min, max] pair for a Scale.Quantitative, all covered
             * strings for a Scale.Ordinal.
             *
             * Perspective: A combination of a Dataset and an Accessor that
             * represents a view in to the data.
             *
             * @returns {Scale} The calling Scale.
             */
            autoDomain(): AbstractScale<D, R>;
            _autoDomainIfAutomaticMode(): void;
            /**
             * Computes the range value corresponding to a given domain value. In other
             * words, apply the function to value.
             *
             * @param {R} value A domain value to be scaled.
             * @returns {R} The range value corresponding to the supplied domain value.
             */
            scale(value: D): R;
            /**
             * Gets the domain.
             *
             * @returns {D[]} The current domain.
             */
            domain(): D[];
            /**
             * Sets the domain.
             *
             * @param {D[]} values If provided, the new value for the domain. On
             * a QuantitativeScale, this is a [min, max] pair, or a [max, min] pair to
             * make the function decreasing. On Scale.Ordinal, this is an array of all
             * input values.
             * @returns {Scale} The calling Scale.
             */
            domain(values: D[]): AbstractScale<D, R>;
            _getDomain(): any[];
            _setDomain(values: D[]): void;
            /**
             * Gets the range.
             *
             * In the case of having a numeric range, it will be a [min, max] pair. In
             * the case of string range (e.g. Scale.InterpolatedColor), it will be a
             * list of all possible outputs.
             *
             * @returns {R[]} The current range.
             */
            range(): R[];
            /**
             * Sets the range.
             *
             * In the case of having a numeric range, it will be a [min, max] pair. In
             * the case of string range (e.g. Scale.InterpolatedColor), it will be a
             * list of all possible outputs.
             *
             * @param {R[]} values If provided, the new values for the range.
             * @returns {Scale} The calling Scale.
             */
            range(values: R[]): AbstractScale<D, R>;
            /**
             * Constructs a copy of the Scale with the same domain and range but without
             * any registered listeners.
             *
             * @returns {Scale} A copy of the calling Scale.
             */
            copy(): AbstractScale<D, R>;
            /**
             * When a renderer determines that the extent of a projector has changed,
             * it will call this function. This function should ensure that
             * the scale has a domain at least large enough to include extent.
             *
             * @param {number} rendererID A unique indentifier of the renderer sending
             *                 the new extent.
             * @param {string} attr The attribute being projected, e.g. "x", "y0", "r"
             * @param {D[]} extent The new extent to be included in the scale.
             */
            _updateExtent(plotProvidedKey: string, attr: string, extent: D[]): AbstractScale<D, R>;
            _removeExtent(plotProvidedKey: string, attr: string): AbstractScale<D, R>;
        }
    }
}


declare module Plottable {
    module Scale {
        class AbstractQuantitative<D> extends AbstractScale<D, number> {
            _d3Scale: D3.Scale.QuantitativeScale;
            _numTicks: number;
            _PADDING_FOR_IDENTICAL_DOMAIN: number;
            _userSetDomainer: boolean;
            _domainer: Domainer;
            _typeCoercer: (d: any) => number;
            /**
             * Constructs a new QuantitativeScale.
             *
             * A QuantitativeScale is a Scale that maps anys to numbers. It
             * is invertible and continuous.
             *
             * @constructor
             * @param {D3.Scale.QuantitativeScale} scale The D3 QuantitativeScale
             * backing the QuantitativeScale.
             */
            constructor(scale: D3.Scale.QuantitativeScale);
            _getExtent(): D[];
            /**
             * Retrieves the domain value corresponding to a supplied range value.
             *
             * @param {number} value: A value from the Scale's range.
             * @returns {D} The domain value corresponding to the supplied range value.
             */
            invert(value: number): D;
            /**
             * Creates a copy of the QuantitativeScale with the same domain and range but without any registered list.
             *
             * @returns {AbstractQuantitative} A copy of the calling QuantitativeScale.
             */
            copy(): AbstractQuantitative<D>;
            domain(): D[];
            domain(values: D[]): AbstractQuantitative<D>;
            _setDomain(values: D[]): void;
            /**
             * Sets or gets the QuantitativeScale's output interpolator
             *
             * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
             * @returns {D3.Transition.Interpolate|AbstractQuantitative} The current output interpolator, or the calling QuantitativeScale.
             */
            interpolate(): D3.Transition.Interpolate;
            interpolate(factory: D3.Transition.Interpolate): AbstractQuantitative<D>;
            /**
             * Sets the range of the QuantitativeScale and sets the interpolator to d3.interpolateRound.
             *
             * @param {number[]} values The new range value for the range.
             */
            rangeRound(values: number[]): AbstractQuantitative<D>;
            /**
             * Gets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
             *
             * @returns {boolean} The current clamp status.
             */
            clamp(): boolean;
            /**
             * Sets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
             *
             * @param {boolean} clamp Whether or not to clamp the QuantitativeScale.
             * @returns {AbstractQuantitative} The calling QuantitativeScale.
             */
            clamp(clamp: boolean): AbstractQuantitative<D>;
            /**
             * Gets a set of tick values spanning the domain.
             *
             * @param {number} [count] The approximate number of ticks to generate.
             *                         If not supplied, the number specified by
             *                         numTicks() is used instead.
             * @returns {any[]} The generated ticks.
             */
            ticks(count?: number): any[];
            /**
             * Gets the default number of ticks.
             *
             * @returns {number} The default number of ticks.
             */
            numTicks(): number;
            /**
             * Sets the default number of ticks to generate.
             *
             * @param {number} count The new default number of ticks.
             * @returns {Quantitative} The calling QuantitativeScale.
             */
            numTicks(count: number): AbstractQuantitative<D>;
            /**
             * Given a domain, expands its domain onto "nice" values, e.g. whole
             * numbers.
             */
            _niceDomain(domain: any[], count?: number): any[];
            /**
             * Gets a Domainer of a scale. A Domainer is responsible for combining
             * multiple extents into a single domain.
             *
             * @return {Domainer} The scale's current domainer.
             */
            domainer(): Domainer;
            /**
             * Sets a Domainer of a scale. A Domainer is responsible for combining
             * multiple extents into a single domain.
             *
             * When you set domainer, we assume that you know what you want the domain
             * to look like better that we do. Ensuring that the domain is padded,
             * includes 0, etc., will be the responsability of the new domainer.
             *
             * @param {Domainer} domainer If provided, the new domainer.
             * @return {AbstractQuantitative} The calling QuantitativeScale.
             */
            domainer(domainer: Domainer): AbstractQuantitative<D>;
            _defaultExtent(): any[];
        }
    }
}


declare module Plottable {
    module Scale {
        class Linear extends AbstractQuantitative<number> {
            /**
             * Constructs a new LinearScale.
             *
             * This scale maps from domain to range with a simple `mx + b` formula.
             *
             * @constructor
             * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the
             * LinearScale. If not supplied, uses a default scale.
             */
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            /**
             * Constructs a copy of the LinearScale with the same domain and range but
             * without any registered listeners.
             *
             * @returns {Linear} A copy of the calling LinearScale.
             */
            copy(): Linear;
        }
    }
}


declare module Plottable {
    module Scale {
        class Log extends AbstractQuantitative<number> {
            /**
             * Constructs a new Scale.Log.
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
             * @returns {Log} A copy of the calling Log.
             */
            copy(): Log;
            _defaultExtent(): number[];
        }
    }
}


declare module Plottable {
    module Scale {
        class ModifiedLog extends AbstractQuantitative<number> {
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
            scale(x: number): number;
            invert(x: number): number;
            _getDomain(): number[];
            _setDomain(values: number[]): void;
            ticks(count?: number): number[];
            copy(): ModifiedLog;
            _niceDomain(domain: any[], count?: number): any[];
            /**
             * Gets whether or not to return tick values other than powers of base.
             *
             * This defaults to false, so you'll normally only see ticks like
             * [10, 100, 1000]. If you turn it on, you might see ticks values
             * like [10, 50, 100, 500, 1000].
             * @returns {boolean} the current setting.
             */
            showIntermediateTicks(): boolean;
            /**
             * Sets whether or not to return ticks values other than powers or base.
             *
             * @param {boolean} show If provided, the desired setting.
             * @returns {ModifiedLog} The calling ModifiedLog.
             */
            showIntermediateTicks(show: boolean): ModifiedLog;
        }
    }
}


declare module Plottable {
    module Scale {
        class Ordinal extends AbstractScale<string, number> {
            _d3Scale: D3.Scale.OrdinalScale;
            _typeCoercer: (d: any) => any;
            /**
             * Creates an OrdinalScale.
             *
             * An OrdinalScale maps strings to numbers. A common use is to map the
             * labels of a bar plot (strings) to their pixel locations (numbers).
             *
             * @constructor
             */
            constructor(scale?: D3.Scale.OrdinalScale);
            _getExtent(): string[];
            domain(): string[];
            domain(values: string[]): Ordinal;
            _setDomain(values: string[]): void;
            range(): number[];
            range(values: number[]): Ordinal;
            /**
             * Returns the width of the range band. Only valid when rangeType is set to "bands".
             *
             * @returns {number} The range band width or 0 if rangeType isn't "bands".
             */
            rangeBand(): number;
            innerPadding(): number;
            fullBandStartAndWidth(v: string): number[];
            /**
             * Get the range type.
             *
             * @returns {string} The current range type.
             */
            rangeType(): string;
            /**
             * Set the range type.
             *
             * @param {string} rangeType If provided, either "points" or "bands" indicating the
             *     d3 method used to generate range bounds.
             * @param {number} [outerPadding] If provided, the padding outside the range,
             *     proportional to the range step.
             * @param {number} [innerPadding] If provided, the padding between bands in the range,
             *     proportional to the range step. This parameter is only used in
             *     "bands" type ranges.
             * @returns {Ordinal} The calling Ordinal.
             */
            rangeType(rangeType: string, outerPadding?: number, innerPadding?: number): Ordinal;
            copy(): Ordinal;
        }
    }
}


declare module Plottable {
    module Scale {
        class Color extends AbstractScale<string, string> {
            /**
             * Constructs a ColorScale.
             *
             * @constructor
             * @param {string} [scaleType] the type of color scale to create
             *     (Category10/Category20/Category20b/Category20c).
             * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
             */
            constructor(scaleType?: string);
            _getExtent(): string[];
        }
    }
}


declare module Plottable {
    module Scale {
        class Time extends AbstractQuantitative<any> {
            _typeCoercer: (d: any) => any;
            /**
             * Constructs a TimeScale.
             *
             * A TimeScale maps Date objects to numbers.
             *
             * @constructor
             * @param {D3.Scale.Time} scale The D3 LinearScale backing the Scale.Time. If not supplied, uses a default scale.
             */
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            _tickInterval(interval: D3.Time.Interval, step?: number): any[];
            _setDomain(values: any[]): void;
            copy(): Time;
            _defaultExtent(): any[];
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
        class InterpolatedColor extends AbstractScale<number, string> {
            /**
             * Constructs an InterpolatedColorScale.
             *
             * An InterpolatedColorScale maps numbers evenly to color strings.
             *
             * @constructor
             * @param {string|string[]} colorRange the type of color scale to
             *     create. Default is "reds". @see {@link colorRange} for further
             *     options.
             * @param {string} scaleType the type of underlying scale to use
             *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
             *     for further options.
             */
            constructor(colorRange?: any, scaleType?: string);
            /**
             * Gets the color range.
             *
             * @returns {string[]} the current color values for the range as strings.
             */
            colorRange(): string[];
            /**
             * Sets the color range.
             *
             * @param {string|string[]} [colorRange]. If provided and if colorRange is one of
             * (reds/blues/posneg), uses the built-in color groups. If colorRange is an
             * array of strings with at least 2 values (e.g. ["#FF00FF", "red",
             * "dodgerblue"], the resulting scale will interpolate between the color
             * values across the domain.
             * @returns {InterpolatedColor} The calling InterpolatedColor.
             */
            colorRange(colorRange: any): InterpolatedColor;
            /**
             * Gets the internal scale type.
             *
             * @returns {string} The current scale type.
             */
            scaleType(): string;
            /**
             * Sets the internal scale type.
             *
             * @param {string} scaleType If provided, the type of d3 scale to use internally.  (linear/log/sqrt/pow).
             * @returns {InterpolatedColor} The calling InterpolatedColor.
             */
            scaleType(scaleType: string): InterpolatedColor;
            autoDomain(): InterpolatedColor;
        }
    }
}


declare module Plottable {
    module _Util {
        class ScaleDomainCoordinator<D> {
            /**
             * Constructs a ScaleDomainCoordinator.
             *
             * @constructor
             * @param {Scale[]} scales A list of scales whose domains should be linked.
             */
            constructor(scales: Scale.AbstractScale<D, any>[]);
            rescale(scale: Scale.AbstractScale<D, any>): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class AbstractDrawer {
            _renderArea: D3.Selection;
            key: string;
            /**
             * Constructs a Drawer
             *
             * @constructor
             * @param{string} key The key associated with this Drawer
             */
            constructor(key: string);
            /**
             * Removes the Drawer and its renderArea
             */
            remove(): void;
            /**
             * Draws the data into the renderArea using the attrHash for attributes
             *
             * @param{any[]} data The data to be drawn
             * @param{attrHash} AttributeToProjector The list of attributes to set on the data
             */
            draw(data: any[], attrToProjector: AttributeToProjector, animator?: Animator.Null): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Arc extends AbstractDrawer {
            draw(data: any[], attrToProjector: AttributeToProjector, animator?: Animator.Null): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Area extends AbstractDrawer {
            draw(data: any[], attrToProjector: AttributeToProjector): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Rect extends AbstractDrawer {
            draw(data: any[], attrToProjector: AttributeToProjector, animator?: Animator.Null): void;
        }
    }
}


declare module Plottable {
    module Component {
        class AbstractComponent extends Core.PlottableObject {
            static AUTORESIZE_BY_DEFAULT: boolean;
            _element: D3.Selection;
            _content: D3.Selection;
            _backgroundContainer: D3.Selection;
            _foregroundContainer: D3.Selection;
            clipPathEnabled: boolean;
            _parent: AbstractComponentContainer;
            _xAlignProportion: number;
            _yAlignProportion: number;
            _fixedHeightFlag: boolean;
            _fixedWidthFlag: boolean;
            _isSetup: boolean;
            _isAnchored: boolean;
            /**
             * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
             *
             * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
             */
            _anchor(element: D3.Selection): void;
            /**
             * Creates additional elements as necessary for the Component to function.
             * Called during _anchor() if the Component's element has not been created yet.
             * Override in subclasses to provide additional functionality.
             */
            _setup(): void;
            _requestedSpace(availableWidth: number, availableHeight: number): _SpaceRequest;
            /**
             * Computes the size, position, and alignment from the specified values.
             * If no parameters are supplied and the component is a root node,
             * they are inferred from the size of the component's element.
             *
             * @param {number} xOrigin x-coordinate of the origin of the component
             * @param {number} yOrigin y-coordinate of the origin of the component
             * @param {number} availableWidth available width for the component to render in
             * @param {number} availableHeight available height for the component to render in
             */
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _render(): void;
            _scheduleComputeLayout(): void;
            _doRender(): void;
            _invalidateLayout(): void;
            /**
             * Renders the Component into a given DOM element. The element must be as <svg>.
             *
             * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
             * @returns {Component} The calling component.
             */
            renderTo(selector: String): AbstractComponent;
            renderTo(element: D3.Selection): AbstractComponent;
            /**
             * Causes the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
             *
             * This function should be called when CSS changes could influence the size
             * of the components, e.g. changing the font size.
             *
             * @param {number} [availableWidth]  - the width of the container element
             * @param {number} [availableHeight] - the height of the container element
             * @returns {Component} The calling component.
             */
            resize(width?: number, height?: number): AbstractComponent;
            /**
             * Enables or disables resize on window resizes.
             *
             * If enabled, window resizes will enqueue this component for a re-layout
             * and re-render. Animations are disabled during window resizes when auto-
             * resize is enabled.
             *
             * @param {boolean} flag Enable (true) or disable (false) auto-resize.
             * @returns {Component} The calling component.
             */
            autoResize(flag: boolean): AbstractComponent;
            /**
             * Sets the x alignment of the Component. This will be used if the
             * Component is given more space than it needs.
             *
             * For example, you may want to make a Legend postition itself it the top
             * right, so you would call `legend.xAlign("right")` and
             * `legend.yAlign("top")`.
             *
             * @param {string} alignment The x alignment of the Component (one of ["left", "center", "right"]).
             * @returns {Component} The calling Component.
             */
            xAlign(alignment: string): AbstractComponent;
            /**
             * Sets the y alignment of the Component. This will be used if the
             * Component is given more space than it needs.
             *
             * For example, you may want to make a Legend postition itself it the top
             * right, so you would call `legend.xAlign("right")` and
             * `legend.yAlign("top")`.
             *
             * @param {string} alignment The x alignment of the Component (one of ["top", "center", "bottom"]).
             * @returns {Component} The calling Component.
             */
            yAlign(alignment: string): AbstractComponent;
            /**
             * Sets the x offset of the Component. This will be used if the Component
             * is given more space than it needs.
             *
             * @param {number} offset The desired x offset, in pixels, from the left
             * side of the container.
             * @returns {Component} The calling Component.
             */
            xOffset(offset: number): AbstractComponent;
            /**
             * Sets the y offset of the Component. This will be used if the Component
             * is given more space than it needs.
             *
             * @param {number} offset The desired y offset, in pixels, from the top
             * side of the container.
             * @returns {Component} The calling Component.
             */
            yOffset(offset: number): AbstractComponent;
            /**
             * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
             *
             * @param {Interaction} interaction The Interaction to attach to the Component.
             * @returns {Component} The calling Component.
             */
            registerInteraction(interaction: Interaction.AbstractInteraction): AbstractComponent;
            /**
             * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
             *
             * @param {string} cssClass The CSS class to add/remove/check for.
             * @param {boolean} addClass Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
             * @returns {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
             */
            classed(cssClass: string): boolean;
            classed(cssClass: string, addClass: boolean): AbstractComponent;
            /**
             * Checks if the Component has a fixed width or false if it grows to fill available space.
             * Returns false by default on the base Component class.
             *
             * @returns {boolean} Whether the component has a fixed width.
             */
            _isFixedWidth(): boolean;
            /**
             * Checks if the Component has a fixed height or false if it grows to fill available space.
             * Returns false by default on the base Component class.
             *
             * @returns {boolean} Whether the component has a fixed height.
             */
            _isFixedHeight(): boolean;
            /**
             * Merges this Component with another Component, returning a
             * ComponentGroup. This is used to layer Components on top of each other.
             *
             * There are four cases:
             * Component + Component: Returns a ComponentGroup with both components inside it.
             * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
             * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
             * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
             *
             * @param {Component} c The component to merge in.
             * @returns {ComponentGroup} The relevant ComponentGroup out of the above four cases.
             */
            merge(c: AbstractComponent): Group;
            /**
             * Detaches a Component from the DOM. The component can be reused.
             *
             * This should only be used if you plan on reusing the calling
             * Components. Otherwise, use remove().
             *
             * @returns The calling Component.
             */
            detach(): AbstractComponent;
            /**
             * Removes a Component from the DOM and disconnects it from everything it's
             * listening to (effectively destroying it).
             */
            remove(): void;
            /**
             * Return the width of the component
             *
             * @return {number} width of the component
             */
            width(): number;
            /**
             * Return the height of the component
             *
             * @return {number} height of the component
             */
            height(): number;
        }
    }
}


declare module Plottable {
    module Component {
        class AbstractComponentContainer extends AbstractComponent {
            _components: AbstractComponent[];
            _anchor(element: D3.Selection): void;
            _render(): void;
            _removeComponent(c: AbstractComponent): void;
            _addComponent(c: AbstractComponent, prepend?: boolean): boolean;
            /**
             * Returns a list of components in the ComponentContainer.
             *
             * @returns {Component[]} the contained Components
             */
            components(): AbstractComponent[];
            /**
             * Returns true iff the ComponentContainer is empty.
             *
             * @returns {boolean} Whether the calling ComponentContainer is empty.
             */
            empty(): boolean;
            /**
             * Detaches all components contained in the ComponentContainer, and
             * empties the ComponentContainer.
             *
             * @returns {ComponentContainer} The calling ComponentContainer
             */
            detachAll(): AbstractComponentContainer;
            remove(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Group extends AbstractComponentContainer {
            /**
             * Constructs a GroupComponent.
             *
             * A GroupComponent is a set of Components that will be rendered on top of
             * each other. When you call Component.merge(Component), it creates and
             * returns a GroupComponent.
             *
             * @constructor
             * @param {Component[]} components The Components in the Group (default = []).
             */
            constructor(components?: AbstractComponent[]);
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            merge(c: AbstractComponent): Group;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Group;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Axis {
        class AbstractAxis extends Component.AbstractComponent {
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
            _tickMarkContainer: D3.Selection;
            _tickLabelContainer: D3.Selection;
            _baseline: D3.Selection;
            _scale: Scale.AbstractScale<any, number>;
            _formatter: Formatter;
            _orientation: string;
            _computedWidth: number;
            _computedHeight: number;
            /**
             * Constructs an axis. An axis is a wrapper around a scale for rendering.
             *
             * @constructor
             * @param {Scale} scale The scale for this axis to render.
             * @param {string} orientation One of ["top", "left", "bottom", "right"];
             * on which side the axis will appear. On most axes, this is either "left"
             * or "bottom".
             * @param {Formatter} Data is passed through this formatter before being
             * displayed.
             */
            constructor(scale: Scale.AbstractScale<any, number>, orientation: string, formatter?: (d: any) => string);
            remove(): void;
            _isHorizontal(): boolean;
            _computeWidth(): number;
            _computeHeight(): number;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _isFixedHeight(): boolean;
            _isFixedWidth(): boolean;
            _rescale(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _setup(): void;
            _getTickValues(): any[];
            _doRender(): void;
            _generateBaselineAttrHash(): {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
            };
            _generateTickMarkAttrHash(isEndTickMark?: boolean): {
                x1: any;
                y1: any;
                x2: any;
                y2: any;
            };
            _invalidateLayout(): void;
            _setDefaultAlignment(): void;
            /**
             * Gets the current formatter on the axis. Data is passed through the
             * formatter before being displayed.
             *
             * @returns {Formatter} The calling Axis, or the current
             * Formatter.
             */
            formatter(): Formatter;
            /**
             * Sets the current formatter on the axis. Data is passed through the
             * formatter before being displayed.
             *
             * @param {Formatter} formatter If provided, data will be passed though `formatter(data)`.
             * @returns {Axis} The calling Axis.
             */
            formatter(formatter: Formatter): AbstractAxis;
            /**
             * Gets the current tick mark length.
             *
             * @returns {number} the current tick mark length.
             */
            tickLength(): number;
            /**
             * Sets the current tick mark length.
             *
             * @param {number} length If provided, length of each tick.
             * @returns {Axis} The calling Axis.
             */
            tickLength(length: number): AbstractAxis;
            /**
             * Gets the current end tick mark length.
             *
             * @returns {number} The current end tick mark length.
             */
            endTickLength(): number;
            /**
             * Sets the end tick mark length.
             *
             * @param {number} length If provided, the length of the end ticks.
             * @returns {BaseAxis} The calling Axis.
             */
            endTickLength(length: number): AbstractAxis;
            _maxLabelTickLength(): number;
            /**
             * Gets the padding between each tick mark and its associated label.
             *
             * @returns {number} the current padding.
             * length.
             */
            tickLabelPadding(): number;
            /**
             * Sets the padding between each tick mark and its associated label.
             *
             * @param {number} padding If provided, the desired padding.
             * @returns {Axis} The calling Axis.
             */
            tickLabelPadding(padding: number): AbstractAxis;
            /**
             * Gets the size of the gutter (the extra space between the tick
             * labels and the outer edge of the axis).
             *
             * @returns {number} the current gutter.
             * length.
             */
            gutter(): number;
            /**
             * Sets the size of the gutter (the extra space between the tick
             * labels and the outer edge of the axis).
             *
             * @param {number} size If provided, the desired gutter.
             * @returns {Axis} The calling Axis.
             */
            gutter(size: number): AbstractAxis;
            /**
             * Gets the orientation of the Axis.
             *
             * @returns {number} the current orientation.
             */
            orient(): string;
            /**
             * Sets the orientation of the Axis.
             *
             * @param {number} newOrientation If provided, the desired orientation
             * (top/bottom/left/right).
             * @returns {Axis} The calling Axis.
             */
            orient(newOrientation: string): AbstractAxis;
            /**
             * Gets whether the Axis is currently set to show the first and last
             * tick labels.
             *
             * @returns {boolean} whether or not the last
             * tick labels are showing.
             */
            showEndTickLabels(): boolean;
            /**
             * Sets whether the Axis is currently set to show the first and last tick
             * labels.
             *
             * @param {boolean} show Whether or not to show the first and last
             * labels.
             * @returns {Axis} The calling Axis.
             */
            showEndTickLabels(show: boolean): AbstractAxis;
            _hideEndTickLabels(): void;
            _hideOverlappingTickLabels(): void;
        }
    }
}


declare module Plottable {
    module Axis {
        interface _TimeInterval {
            timeUnit: D3.Time.Interval;
            step: number;
            formatString: string;
        }
        class Time extends AbstractAxis {
            _majorTickLabels: D3.Selection;
            _minorTickLabels: D3.Selection;
            _scale: Scale.Time;
            static _minorIntervals: _TimeInterval[];
            static _majorIntervals: _TimeInterval[];
            /**
             * Constructs a TimeAxis.
             *
             * A TimeAxis is used for rendering a TimeScale.
             *
             * @constructor
             * @param {TimeScale} scale The scale to base the Axis on.
             * @param {string} orientation The orientation of the Axis (top/bottom)
             */
            constructor(scale: Scale.Time, orientation: string);
            _computeHeight(): number;
            _setup(): void;
            _getTickIntervalValues(interval: _TimeInterval): any[];
            _getTickValues(): any[];
            _measureTextHeight(container: D3.Selection): number;
            _doRender(): Time;
        }
    }
}


declare module Plottable {
    module Axis {
        class Numeric extends AbstractAxis {
            _scale: Scale.AbstractQuantitative<number>;
            /**
             * Constructs a NumericAxis.
             *
             * Just as an CategoryAxis is for rendering an OrdinalScale, a NumericAxis
             * is for rendering a QuantitativeScale.
             *
             * @constructor
             * @param {QuantitativeScale} scale The QuantitativeScale to base the axis on.
             * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
             * @param {Formatter} formatter A function to format tick labels (default Formatters.general(3, false)).
             */
            constructor(scale: Scale.AbstractQuantitative<number>, orientation: string, formatter?: (d: any) => string);
            _setup(): void;
            _computeWidth(): number;
            _computeHeight(): number;
            _getTickValues(): any[];
            _rescale(): void;
            _doRender(): void;
            /**
             * Gets the tick label position relative to the tick marks.
             *
             * @returns {string} The current tick label position.
             */
            tickLabelPosition(): string;
            /**
             * Sets the tick label position relative to the tick marks.
             *
             * @param {string} position If provided, the relative position of the tick label.
             *                          [top/center/bottom] for a vertical NumericAxis,
             *                          [left/center/right] for a horizontal NumericAxis.
             *                          Defaults to center.
             * @returns {Numeric} The calling Axis.Numeric.
             */
            tickLabelPosition(position: string): Numeric;
            /**
             * Gets whether or not the tick labels at the end of the graph are
             * displayed when partially cut off.
             *
             * @param {string} orientation Where on the scale to change tick labels.
             *                 On a "top" or "bottom" axis, this can be "left" or
             *                 "right". On a "left" or "right" axis, this can be "top"
             *                 or "bottom".
             * @returns {boolean} The current setting.
             */
            showEndTickLabel(orientation: string): boolean;
            /**
             * Sets whether or not the tick labels at the end of the graph are
             * displayed when partially cut off.
             *
             * @param {string} orientation If provided, where on the scale to change tick labels.
             *                 On a "top" or "bottom" axis, this can be "left" or
             *                 "right". On a "left" or "right" axis, this can be "top"
             *                 or "bottom".
             * @param {boolean} show Whether or not the given tick should be
             * displayed.
             * @returns {Numeric} The calling NumericAxis.
             */
            showEndTickLabel(orientation: string, show: boolean): Numeric;
        }
    }
}


declare module Plottable {
    module Axis {
        class Category extends AbstractAxis {
            _scale: Scale.Ordinal;
            /**
             * Constructs a CategoryAxis.
             *
             * A CategoryAxis takes an OrdinalScale and includes word-wrapping
             * algorithms and advanced layout logic to try to display the scale as
             * efficiently as possible.
             *
             * @constructor
             * @param {OrdinalScale} scale The scale to base the Axis on.
             * @param {string} orientation The orientation of the Axis (top/bottom/left/right) (default = "bottom").
             * @param {Formatter} formatter The Formatter for the Axis (default Formatters.identity())
             */
            constructor(scale: Scale.Ordinal, orientation?: string, formatter?: (d: any) => string);
            _setup(): void;
            _rescale(): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _getTickValues(): string[];
            /**
             * Sets the angle for the tick labels. Right now vertical-left (-90), horizontal (0), and vertical-right (90) are the only options.
             * @param {number} angle The angle for the ticks
             * @returns {Category} The calling Category Axis.
             *
             * Warning - this is not currently well supported and is likely to behave badly unless all the tick labels are short.
             * See tracking at https://github.com/palantir/plottable/issues/504
             */
            tickLabelAngle(angle: number): Category;
            /**
             * Gets the tick label angle
             * @returns {number} the tick label angle
             */
            tickLabelAngle(): number;
            _doRender(): Category;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Label extends AbstractComponent {
            /**
             * Creates a Label.
             *
             * A label is component that renders just text. The most common use of
             * labels is to create a title or axis labels.
             *
             * @constructor
             * @param {string} displayText The text of the Label (default = "").
             * @param {string} orientation The orientation of the Label (horizontal/left/right) (default = "horizontal").
             */
            constructor(displayText?: string, orientation?: string);
            /**
             * Sets the horizontal side the label will go to given the label is given more space that it needs
             *
             * @param {string} alignment The new setting, one of `["left", "center",
             * "right"]`. Defaults to `"center"`.
             * @returns {Label} The calling Label.
             */
            xAlign(alignment: string): Label;
            /**
             * Sets the vertical side the label will go to given the label is given more space that it needs
             *
             * @param {string} alignment The new setting, one of `["top", "center",
             * "bottom"]`. Defaults to `"center"`.
             * @returns {Label} The calling Label.
             */
            yAlign(alignment: string): Label;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _setup(): void;
            /**
             * Gets the current text on the Label.
             *
             * @returns {string} the text on the label.
             */
            text(): string;
            /**
             * Sets the current text on the Label.
             *
             * @param {string} displayText If provided, the new text for the Label.
             * @returns {Label} The calling Label.
             */
            text(displayText: string): Label;
            /**
             * Gets the orientation of the Label.
             *
             * @returns {string} the current orientation.
             */
            orient(): string;
            /**
             * Sets the orientation of the Label.
             *
             * @param {string} newOrientation If provided, the desired orientation
             * (horizontal/left/right).
             * @returns {Label} The calling Label.
             */
            orient(newOrientation: string): Label;
            _doRender(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Label;
        }
        class TitleLabel extends Label {
            /**
             * Creates a TitleLabel, a type of label made for rendering titles.
             *
             * @constructor
             */
            constructor(text?: string, orientation?: string);
        }
        class AxisLabel extends Label {
            /**
             * Creates a AxisLabel, a type of label made for rendering axis labels.
             *
             * @constructor
             */
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
        class Legend extends AbstractComponent {
            /**
             * The css class applied to each legend row
             */
            static SUBELEMENT_CLASS: string;
            /**
             * Constructs a Legend.
             *
             * A legend consists of a series of legend rows, each with a color and label taken from the `colorScale`.
             * The rows will be displayed in the order of the `colorScale` domain.
             * This legend also allows interactions, through the functions `toggleCallback` and `hoverCallback`
             * Setting a callback will also put classes on the individual rows.
             *
             * @constructor
             * @param {ColorScale} colorScale
             */
            constructor(colorScale?: Scale.Color);
            remove(): void;
            /**
             * Gets the toggle callback from the Legend.
             *
             * This callback is associated with toggle events, which trigger when a legend row is clicked.
             * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
             * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
             * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
             *
             * @returns {ToggleCallback} The current toggle callback.
             */
            toggleCallback(): ToggleCallback;
            /**
             * Assigns a toggle callback to the Legend.
             *
             * This callback is associated with toggle events, which trigger when a legend row is clicked.
             * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
             * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
             * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
             *
             * @param {ToggleCallback} callback The new callback function.
             * @returns {Legend} The calling Legend.
             */
            toggleCallback(callback: ToggleCallback): Legend;
            /**
             * Gets the hover callback from the Legend.
             *
             * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
             * Setting a callback will also set the class "hover" to all legend row,
             * as well as the class "focus" to the legend row being hovered over.
             * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
             *
             * @returns {HoverCallback} The new current hover callback.
             */
            hoverCallback(): HoverCallback;
            /**
             * Assigns a hover callback to the Legend.
             *
             * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
             * Setting a callback will also set the class "hover" to all legend row,
             * as well as the class "focus" to the legend row being hovered over.
             * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
             *
             * @param {HoverCallback} callback If provided, the new callback function.
             * @returns {Legend} The calling Legend.
             */
            hoverCallback(callback: HoverCallback): Legend;
            /**
             * Gets the current color scale from the Legend.
             *
             * @returns {ColorScale} The current color scale.
             */
            scale(): Scale.Color;
            /**
             * Assigns a new color scale to the Legend.
             *
             * @param {Scale.Color} scale If provided, the new scale.
             * @returns {Legend} The calling Legend.
             */
            scale(scale: Scale.Color): Legend;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class HorizontalLegend extends AbstractComponent {
            /**
             * The css class applied to each legend row
             */
            static LEGEND_ROW_CLASS: string;
            /**
             * The css class applied to each legend entry
             */
            static LEGEND_ENTRY_CLASS: string;
            /**
             * Creates a Horizontal Legend.
             *
             * The legend consists of a series of legend entries, each with a color and label taken from the `colorScale`.
             * The entries will be displayed in the order of the `colorScale` domain.
             *
             * @constructor
             * @param {Scale.Color} colorScale
             */
            constructor(colorScale: Scale.Color);
            remove(): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Gridlines extends AbstractComponent {
            /**
             * Creates a set of Gridlines.
             * @constructor
             *
             * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
             * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
             */
            constructor(xScale: Scale.AbstractQuantitative<any>, yScale: Scale.AbstractQuantitative<any>);
            remove(): Gridlines;
            _setup(): void;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
        interface _IterateLayoutResult {
            colProportionalSpace: number[];
            rowProportionalSpace: number[];
            guaranteedWidths: number[];
            guaranteedHeights: number[];
            wantsWidth: boolean;
            wantsHeight: boolean;
        }
        class Table extends AbstractComponentContainer {
            /**
             * Constructs a Table.
             *
             * A Table is used to combine multiple Components in the form of a grid. A
             * common case is combining a y-axis, x-axis, and the plotted data via
             * ```typescript
             * new Table([[yAxis, plot],
             *            [null,  xAxis]]);
             * ```
             *
             * @constructor
             * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
             * null can be used if a cell is empty. (default = [])
             */
            constructor(rows?: AbstractComponent[][]);
            /**
             * Adds a Component in the specified cell. The cell must be unoccupied.
             *
             * For example, instead of calling `new Table([[a, b], [null, c]])`, you
             * could call
             * ```typescript
             * var table = new Table();
             * table.addComponent(0, 0, a);
             * table.addComponent(0, 1, b);
             * table.addComponent(1, 1, c);
             * ```
             *
             * @param {number} row The row in which to add the Component.
             * @param {number} col The column in which to add the Component.
             * @param {Component} component The Component to be added.
             * @returns {Table} The calling Table.
             */
            addComponent(row: number, col: number, component: AbstractComponent): Table;
            _removeComponent(component: AbstractComponent): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            /**
             * Sets the row and column padding on the Table.
             *
             * @param {number} rowPadding The padding above and below each row, in pixels.
             * @param {number} colPadding the padding to the left and right of each column, in pixels.
             * @returns {Table} The calling Table.
             */
            padding(rowPadding: number, colPadding: number): Table;
            /**
             * Sets the layout weight of a particular row.
             * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
             *
             * A common case would be to have one graph take up 2/3rds of the space,
             * and the other graph take up 1/3rd.
             *
             * @param {number} index The index of the row.
             * @param {number} weight The weight to be set on the row.
             * @returns {Table} The calling Table.
             */
            rowWeight(index: number, weight: number): Table;
            /**
             * Sets the layout weight of a particular column.
             * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
             *
             * A common case would be to have one graph take up 2/3rds of the space,
             * and the other graph take up 1/3rd.
             *
             * @param {number} index The index of the column.
             * @param {number} weight The weight to be set on the column.
             * @returns {Table} The calling Table.
             */
            colWeight(index: number, weight: number): Table;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Plot {
        class AbstractPlot extends Component.AbstractComponent {
            _dataChanged: boolean;
            _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
            _datasetKeysInOrder: string[];
            _renderArea: D3.Selection;
            _projectors: {
                [x: string]: _Projector;
            };
            _animate: boolean;
            _animators: Animator.PlotAnimatorMap;
            _ANIMATION_DURATION: number;
            /**
             * Constructs a Plot.
             *
             * Plots render data. Common example include Plot.Scatter, Plot.Bar, and Plot.Line.
             *
             * A bare Plot has a DataSource and any number of projectors, which take
             * data and "project" it onto the Plot, such as "x", "y", "fill", "r".
             *
             * @constructor
             * @param {any[]|Dataset} [dataset] If provided, the data or Dataset to be associated with this Plot.
             */
            constructor();
            _anchor(element: D3.Selection): void;
            _setup(): void;
            remove(): void;
            /**
             * Adds a dataset to this plot. Identify this dataset with a key.
             *
             * A key is automatically generated if not supplied.
             *
             * @param {string} [key] The key of the dataset.
             * @param {any[]|Dataset} dataset dataset to add.
             * @returns {Plot} The calling Plot.
             */
            addDataset(key: string, dataset: Dataset): AbstractPlot;
            addDataset(key: string, dataset: any[]): AbstractPlot;
            addDataset(dataset: Dataset): AbstractPlot;
            addDataset(dataset: any[]): AbstractPlot;
            _addDataset(key: string, dataset: Dataset): void;
            _getDrawer(key: string): _Drawer.AbstractDrawer;
            _getAnimator(drawer: _Drawer.AbstractDrawer, index: number): Animator.PlotAnimator;
            _onDatasetUpdate(): void;
            /**
             * Sets an attribute of every data point.
             *
             * Here's a common use case:
             * ```typescript
             * plot.attr("r", function(d) { return d.foo; });
             * ```
             * This will set the radius of each datum `d` to be `d.foo`.
             *
             * @param {string} attrToSet The attribute to set across each data
             * point. Popular examples include "x", "y", "r". Scales that inherit from
             * Plot define their meaning.
             *
             * @param {Function|string|any} accessor Function to apply to each element
             * of the dataSource. If a Function, use `accessor(d, i)`. If a string,
             * `d[accessor]` is used. If anything else, use `accessor` as a constant
             * across all data points.
             *
             * @param {Scale.AbstractScale} scale If provided, the result of the accessor
             * is passed through the scale, such as `scale.scale(accessor(d, i))`.
             *
             * @returns {Plot} The calling Plot.
             */
            attr(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): AbstractPlot;
            /**
             * Identical to plot.attr
             */
            project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): AbstractPlot;
            _generateAttrToProjector(): AttributeToProjector;
            _doRender(): void;
            /**
             * Enables or disables animation.
             *
             * @param {boolean} enabled Whether or not to animate.
             */
            animate(enabled: boolean): AbstractPlot;
            detach(): AbstractPlot;
            /**
             * This function makes sure that all of the scales in this._projectors
             * have an extent that includes all the data that is projected onto them.
             */
            _updateScaleExtents(): void;
            _updateScaleExtent(attr: string): void;
            /**
             * Applies attributes to the selection.
             *
             * If animation is enabled and a valid animator's key is specified, the
             * attributes are applied with the animator. Otherwise, they are applied
             * immediately to the selection.
             *
             * The animation will not animate during auto-resize renders.
             *
             * @param {D3.Selection} selection The selection of elements to update.
             * @param {string} animatorKey The key for the animator.
             * @param {AttributeToProjector} attrToProjector The set of attributes to set on the selection.
             * @returns {D3.Selection} The resulting selection (potentially after the transition)
             */
            _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: AttributeToProjector): any;
            /**
             * Get the animator associated with the specified Animator key.
             *
             * @return {PlotAnimator} The Animator for the specified key.
             */
            animator(animatorKey: string): Animator.PlotAnimator;
            /**
             * Set the animator associated with the specified Animator key.
             *
             * @param {string} animatorKey The key for the Animator.
             * @param {PlotAnimator} animator An Animator to be assigned to
             * the specified key.
             * @returns {Plot} The calling Plot.
             */
            animator(animatorKey: string, animator: Animator.PlotAnimator): AbstractPlot;
            /**
             * Gets the dataset order by key
             *
             * @returns {string[]} A string array of the keys in order
             */
            datasetOrder(): string[];
            /**
             * Sets the dataset order by key
             *
             * @param {string[]} order If provided, a string array which represents the order of the keys.
             * This must be a permutation of existing keys.
             *
             * @returns {Plot} The calling Plot.
             */
            datasetOrder(order: string[]): AbstractPlot;
            /**
             * Removes a dataset by string key
             *
             * @param {string} key The key of the dataset
             * @return {Plot} The calling Plot.
             */
            removeDataset(key: string): AbstractPlot;
            /**
             * Remove a dataset given the dataset itself
             *
             * @param {Dataset} dataset The dataset to remove
             * @return {Plot} The calling Plot.
             */
            removeDataset(dataset: Dataset): AbstractPlot;
            /**
             * Remove a dataset given the underlying data array
             *
             * @param {any[]} dataArray The data to remove
             * @return {Plot} The calling Plot.
             */
            removeDataset(dataArray: any[]): AbstractPlot;
            _removeDataset(key: string): AbstractPlot;
            datasets(): Dataset[];
            _getDrawersInOrder(): _Drawer.AbstractDrawer[];
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class Pie extends AbstractPlot {
            /**
             * Constructs a PiePlot.
             *
             * @constructor
             */
            constructor();
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _addDataset(key: string, dataset: Dataset): void;
            _generateAttrToProjector(): AttributeToProjector;
            _getDrawer(key: string): _Drawer.AbstractDrawer;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class AbstractXYPlot<X, Y> extends AbstractPlot {
            _xScale: Scale.AbstractScale<X, number>;
            _yScale: Scale.AbstractScale<Y, number>;
            /**
             * Constructs an XYPlot.
             *
             * An XYPlot is a plot from drawing 2-dimensional data. Common examples
             * include Scale.Line and Scale.Bar.
             *
             * @constructor
             * @param {any[]|Dataset} [dataset] The data or Dataset to be associated with this Renderer.
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>);
            /**
             * @param {string} attrToSet One of ["x", "y"] which determines the point's
             * x and y position in the Plot.
             */
            project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): AbstractXYPlot<X, Y>;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _updateXDomainer(): void;
            _updateYDomainer(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class Scatter<X, Y> extends AbstractXYPlot<X, Y> {
            _animators: Animator.PlotAnimatorMap;
            /**
             * Constructs a ScatterPlot.
             *
             * @constructor
             * @param {DatasetInterface | any} dataset The dataset to render.
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>);
            /**
             * @param {string} attrToSet One of ["x", "y", "cx", "cy", "r",
             * "fill"]. "cx" and "cy" are aliases for "x" and "y". "r" is the datum's
             * radius, and "fill" is the CSS color of the datum.
             */
            project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): Scatter<X, Y>;
            _generateAttrToProjector(): AttributeToProjector;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class Grid extends AbstractXYPlot<string, string> {
            _colorScale: Scale.AbstractScale<any, string>;
            _xScale: Scale.Ordinal;
            _yScale: Scale.Ordinal;
            _animators: Animator.PlotAnimatorMap;
            /**
             * Constructs a GridPlot.
             *
             * A GridPlot is used to shade a grid of data. Each datum is a cell on the
             * grid, and the datum can control what color it is.
             *
             * @constructor
             * @param {Scale.Ordinal} xScale The x scale to use.
             * @param {Scale.Ordinal} yScale The y scale to use.
             * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
             * to use for each grid cell.
             */
            constructor(xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Scale.AbstractScale<any, string>);
            _addDataset(key: string, dataset: Dataset): void;
            /**
             * @param {string} attrToSet One of ["x", "y", "fill"]. If "fill" is used,
             * the data should return a valid CSS color.
             */
            project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): Grid;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class AbstractBarPlot<X, Y> extends AbstractXYPlot<X, Y> {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            _baseline: D3.Selection;
            _baselineValue: number;
            _barAlignmentFactor: number;
            _isVertical: boolean;
            _animators: Animator.PlotAnimatorMap;
            /**
             * Constructs a BarPlot.
             *
             * @constructor
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>);
            _getDrawer(key: string): _Drawer.Rect;
            _setup(): void;
            _paint(): void;
            /**
             * Sets the baseline for the bars to the specified value.
             *
             * The baseline is the line that the bars are drawn from, defaulting to 0.
             *
             * @param {number} value The value to position the baseline at.
             * @returns {AbstractBarPlot} The calling AbstractBarPlot.
             */
            baseline(value: number): AbstractBarPlot<X, Y>;
            /**
             * Sets the bar alignment relative to the independent axis.
             * VerticalBarPlot supports "left", "center", "right"
             * HorizontalBarPlot supports "top", "center", "bottom"
             *
             * @param {string} alignment The desired alignment.
             * @returns {AbstractBarPlot} The calling AbstractBarPlot.
             */
            barAlignment(alignment: string): AbstractBarPlot<X, Y>;
            /**
             * Selects the bar under the given pixel position (if [xValOrExtent]
             * and [yValOrExtent] are {number}s), under a given line (if only one
             * of [xValOrExtent] or [yValOrExtent] are {Extent}s) or are under a
             * 2D area (if [xValOrExtent] and [yValOrExtent] are both {Extent}s).
             *
             * @param {any} xValOrExtent The pixel x position, or range of x values.
             * @param {any} yValOrExtent The pixel y position, or range of y values.
             * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
             * @returns {D3.Selection} The selected bar, or null if no bar was selected.
             */
            selectBar(xValOrExtent: Extent, yValOrExtent: Extent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: Extent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: Extent, yValOrExtent: number, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            /**
             * Deselects all bars.
             * @returns {AbstractBarPlot} The calling AbstractBarPlot.
             */
            deselectAll(): AbstractBarPlot<X, Y>;
            _updateDomainer(scale: Scale.AbstractScale<any, number>): void;
            _updateYDomainer(): void;
            _updateXDomainer(): void;
            _generateAttrToProjector(): AttributeToProjector;
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
        class VerticalBar<X> extends AbstractBarPlot<X, number> {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            /**
             * Constructs a VerticalBarPlot.
             *
             * @constructor
             * @param {DatasetInterface | any} dataset The dataset to render.
             * @param {Scale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractQuantitative<number>);
            _updateYDomainer(): void;
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
        class HorizontalBar<Y> extends AbstractBarPlot<number, Y> {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            /**
             * Constructs a HorizontalBarPlot.
             *
             * @constructor
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractQuantitative<number>, yScale: Scale.AbstractScale<Y, number>);
            _updateXDomainer(): void;
            _generateAttrToProjector(): AttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plot {
        class Line<X> extends AbstractXYPlot<X, number> {
            _yScale: Scale.AbstractQuantitative<number>;
            _animators: Animator.PlotAnimatorMap;
            /**
             * Constructs a LinePlot.
             *
             * @constructor
             * @param {any | DatasetInterface} dataset The dataset to render.
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>);
            _getResetYFunction(): (d: any, i: number) => number;
            _generateAttrToProjector(): AttributeToProjector;
            _rejectNullsAndNaNs(d: any, i: number, projector: AppliedAccessor): boolean;
            _paint(): void;
            _wholeDatumAttributes(): string[];
        }
    }
}


declare module Plottable {
    module Plot {
        /**
         * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
         */
        class Area<X> extends Line<X> {
            /**
             * Constructs an AreaPlot.
             *
             * @constructor
             * @param {DatasetInterface | any} dataset The dataset to render.
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>);
            _onDatasetUpdate(): void;
            _updateYDomainer(): void;
            project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>): Area<X>;
            _getResetYFunction(): AppliedAccessor;
            _paint(): void;
            _wholeDatumAttributes(): string[];
        }
    }
}


declare module Plottable {
    module Plot {
        class ClusteredBar<X, Y> extends AbstractBarPlot<X, Y> {
            /**
             * Creates a ClusteredBarPlot.
             *
             * A ClusteredBarPlot is a plot that plots several bar plots next to each
             * other. For example, when plotting life expectancy across each country,
             * you would want each country to have a "male" and "female" bar.
             *
             * @constructor
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>, isVertical?: boolean);
            _generateAttrToProjector(): AttributeToProjector;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class AbstractStacked<X, Y> extends AbstractXYPlot<X, Y> {
            _isVertical: boolean;
            _onDatasetUpdate(): void;
            _updateScaleExtents(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedArea<X> extends AbstractStacked<X, number> {
            _baseline: D3.Selection;
            _baselineValue: number;
            /**
             * Constructs a StackedArea plot.
             *
             * @constructor
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>);
            _getDrawer(key: string): _Drawer.Area;
            _setup(): void;
            _paint(): void;
            _updateYDomainer(): void;
            _onDatasetUpdate(): void;
            _generateAttrToProjector(): AttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedBar<X, Y> extends AbstractStacked<X, Y> {
            _baselineValue: number;
            _baseline: D3.Selection;
            _barAlignmentFactor: number;
            /**
             * Constructs a StackedBar plot.
             * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
             * other.
             * @constructor
             * @param {Scale} xScale the x scale of the plot.
             * @param {Scale} yScale the y scale of the plot.
             * @param {boolean} isVertical if the plot if vertical.
             */
            constructor(xScale?: Scale.AbstractScale<X, number>, yScale?: Scale.AbstractScale<Y, number>, isVertical?: boolean);
            _setup(): void;
            _getAnimator(drawer: _Drawer.AbstractDrawer, index: number): Animator.MovingRect;
            _getDrawer(key: string): any;
            _generateAttrToProjector(): any;
            _paint(): void;
            baseline(value: number): any;
            _updateDomainer(scale: Scale.AbstractScale<any, number>): any;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
        }
    }
}


declare module Plottable {
    module Animator {
        interface PlotAnimator {
            /**
             * Applies the supplied attributes to a D3.Selection with some animation.
             *
             * @param {D3.Selection} selection The update selection or transition selection that we wish to animate.
             * @param {AttributeToProjector} attrToProjector The set of
             *     IAccessors that we will use to set attributes on the selection.
             * @return {any} Animators should return the selection or
             *     transition object so that plots may chain the transitions between
             *     animators.
             */
            animate(selection: any, attrToProjector: AttributeToProjector): any;
        }
        interface PlotAnimatorMap {
            [animatorKey: string]: PlotAnimator;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
         * An animator implementation with no animation. The attributes are
         * immediately set on the selection.
         */
        class Null implements PlotAnimator {
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
         * The base animator implementation with easing, duration, and delay.
         */
        class Base implements PlotAnimator {
            /**
             * The default duration of the animation in milliseconds
             */
            static DEFAULT_DURATION_MILLISECONDS: number;
            /**
             * The default starting delay of the animation in milliseconds
             */
            static DEFAULT_DELAY_MILLISECONDS: number;
            /**
             * The default easing of the animation
             */
            static DEFAULT_EASING: string;
            /**
             * Constructs the default animator
             *
             * @constructor
             */
            constructor();
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition;
            /**
             * Gets the duration of the animation in milliseconds.
             *
             * @returns {number} The current duration.
             */
            duration(): number;
            /**
             * Sets the duration of the animation in milliseconds.
             *
             * @param {number} duration The duration in milliseconds.
             * @returns {Default} The calling Default Animator.
             */
            duration(duration: number): Base;
            /**
             * Gets the delay of the animation in milliseconds.
             *
             * @returns {number} The current delay.
             */
            delay(): number;
            /**
             * Sets the delay of the animation in milliseconds.
             *
             * @param {number} delay The delay in milliseconds.
             * @returns {Default} The calling Default Animator.
             */
            delay(delay: number): Base;
            /**
             * Gets the current easing of the animation.
             *
             * @returns {string} the current easing mode.
             */
            easing(): string;
            /**
             * Sets the easing mode of the animation.
             *
             * @param {string} easing The desired easing mode.
             * @returns {Default} The calling Default Animator.
             */
            easing(easing: string): Base;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
         * An animator that delays the animation of the attributes using the index
         * of the selection data.
         *
         * The maximum delay between animations can be configured with maxIterativeDelay.
         *
         * The maximum total animation duration can be configured with maxTotalDuration.
         * maxTotalDuration does not set actual total animation duration.
         *
         * The actual interval delay is calculated by following formula:
         * min(maxIterativeDelay(),
         *   max(totalDurationLimit() - duration(), 0) / <number of iterations>)
         */
        class IterativeDelay extends Base {
            /**
             * The default maximum start delay between each start of an animation
             */
            static DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS: number;
            /**
             * The default maximum total animation duration
             */
            static DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS: number;
            /**
             * Constructs an animator with a start delay between each selection animation
             *
             * @constructor
             */
            constructor();
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition;
            /**
             * Gets the maximum start delay between animations in milliseconds.
             *
             * @returns {number} The current maximum iterative delay.
             */
            maxIterativeDelay(): number;
            /**
             * Sets the maximum start delay between animations in milliseconds.
             *
             * @param {number} maxIterDelay The maximum iterative delay in milliseconds.
             * @returns {IterativeDelay} The calling IterativeDelay Animator.
             */
            maxIterativeDelay(maxIterDelay: number): IterativeDelay;
            /**
             * Gets the maximum total animation duration in milliseconds.
             *
             * @returns {number} The current maximum total animation duration.
             */
            maxTotalDuration(): number;
            /**
             * Sets the maximum total animation duration in miliseconds.
             *
             * @param {number} maxDuration The maximum total animation duration in milliseconds.
             * @returns {IterativeDelay} The calling IterativeDelay Animator.
             */
            maxTotalDuration(maxDuration: number): IterativeDelay;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
         * The default animator implementation with easing, duration, and delay.
         */
        class Rect extends Base {
            static ANIMATED_ATTRIBUTES: string[];
            isVertical: boolean;
            isReverse: boolean;
            constructor(isVertical?: boolean, isReverse?: boolean);
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition;
            _startMovingProjector(attrToProjector: AttributeToProjector): AppliedAccessor;
        }
    }
}


declare module Plottable {
    module Animator {
        /**
         * A child class of RectAnimator that will move the rectangle
         * as well as animate its growth.
         */
        class MovingRect extends Rect {
            /**
             * The pixel value to move from
             */
            startPixelValue: number;
            /**
             * Constructs a MovingRectAnimator
             *
             * @param {number} basePixel The pixel value to start moving from
             * @param {boolean} isVertical If the movement/animation is vertical
             */
            constructor(startPixelValue: number, isVertical?: boolean);
            _startMovingProjector(attrToProjector: AttributeToProjector): (p: any) => number;
        }
    }
}


declare module Plottable {
    module Core {
        /**
         * A function to be called when an event occurs. The argument is the d3 event
         * generated by the event.
         */
        interface KeyEventListenerCallback {
            (e: D3.D3Event): any;
        }
        /**
         * A module for listening to keypresses on the document.
         */
        module KeyEventListener {
            /**
             * Turns on key listening.
             */
            function initialize(): void;
            /**
             * When a key event occurs with the key corresponding te keyCod, call cb.
             *
             * @param {number} keyCode The javascript key code to call cb on.
             * @param {IKeyEventListener} cb Will be called when keyCode key event
             * occurs.
             */
            function addCallback(keyCode: number, cb: KeyEventListenerCallback): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class AbstractInteraction extends Core.PlottableObject {
            /**
             * It maintains a 'hitBox' which is where all event listeners are
             * attached. Due to cross- browser weirdness, the hitbox needs to be an
             * opaque but invisible rectangle.  TODO: We should give the interaction
             * "foreground" and "background" elements where it can draw things,
             * e.g. crosshairs.
             */
            _hitBox: D3.Selection;
            _componentToListenTo: Component.AbstractComponent;
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Click extends AbstractInteraction {
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): void;
            _listenTo(): string;
            /**
             * Sets a callback to be called when a click is received.
             *
             * @param {(p: Point) => any} cb Callback that takes the pixel position of the click event.
             */
            callback(cb: (p: Point) => any): Click;
        }
        class DoubleClick extends Click {
            _listenTo(): string;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Key extends AbstractInteraction {
            /**
             * Creates a KeyInteraction.
             *
             * KeyInteraction listens to key events that occur while the component is
             * moused over.
             *
             * @constructor
             * @param {number} keyCode The key code to listen for.
             */
            constructor(keyCode: number);
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): void;
            /**
             * Sets a callback to be called when the designated key is pressed and the
             * user is moused over the component.
             *
             * @param {() => any} cb Callback to be called.
             * @returns The calling Key.
             */
            callback(cb: () => any): Key;
        }
    }
}


declare module Plottable {
    module Interaction {
        class PanZoom extends AbstractInteraction {
            _xScale: Scale.AbstractQuantitative<any>;
            _yScale: Scale.AbstractQuantitative<any>;
            /**
             * Creates a PanZoomInteraction.
             *
             * The allows you to move around and zoom in on a plot, interactively. It
             * does so by changing the xScale and yScales' domains repeatedly.
             *
             * @constructor
             * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
             * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
             */
            constructor(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>);
            /**
             * Sets the scales back to their original domains.
             */
            resetZoom(): void;
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class BarHover extends AbstractInteraction {
            _componentToListenTo: Plot.AbstractBarPlot<any, any>;
            _anchor(barPlot: Plot.AbstractBarPlot<any, any>, hitBox: D3.Selection): void;
            /**
             * Gets the current hover mode.
             *
             * @return {string} The current hover mode.
             */
            hoverMode(): string;
            /**
             * Sets the hover mode for the interaction. There are two modes:
             *     - "point": Selects the bar under the mouse cursor (default).
             *     - "line" : Selects any bar that would be hit by a line extending
             *                in the same direction as the bar and passing through
             *                the cursor.
             *
             * @param {string} mode If provided, the desired hover mode.
             * @return {BarHover} The calling BarHover.
             */
            hoverMode(mode: string): BarHover;
            /**
             * Attaches an callback to be called when the user mouses over a bar.
             *
             * @param {(datum: any, bar: D3.Selection) => any} callback The callback to be called.
             *      The callback will be passed the data from the hovered-over bar.
             * @return {BarHover} The calling BarHover.
             */
            onHover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
            /**
             * Attaches a callback to be called when the user mouses off of a bar.
             *
             * @param {(datum: any, bar: D3.Selection) => any} callback The callback to be called.
             *      The callback will be passed the data from the last-hovered bar.
             * @return {BarHover} The calling BarHover.
             */
            onUnhover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Drag extends AbstractInteraction {
            _origin: number[];
            _location: number[];
            /**
             * Constructs a Drag. A Drag will signal its callbacks on mouse drag.
             */
            constructor();
            /**
             * Gets the callback that is called when dragging starts.
             *
             * @returns {(startLocation: Point) => void} The callback called when dragging starts.
             */
            dragstart(): (startLocation: Point) => void;
            /**
             * Sets the callback to be called when dragging starts.
             *
             * @param {(startLocation: Point) => any} cb If provided, the function to be called. Takes in a Point in pixels.
             * @returns {Drag} The calling Drag.
             */
            dragstart(cb: (startLocation: Point) => any): Drag;
            /**
             * Gets the callback that is called during dragging.
             *
             * @returns {(startLocation: Point, endLocation: Point) => void} The callback called during dragging.
             */
            drag(): (startLocation: Point, endLocation: Point) => void;
            /**
             * Adds a callback to be called during dragging.
             *
             * @param {(startLocation: Point, endLocation: Point) => any} cb If provided, the function to be called. Takes in Points in pixels.
             * @returns {Drag} The calling Drag.
             */
            drag(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            /**
             * Gets the callback that is called when dragging ends.
             *
             * @returns {(startLocation: Point, endLocation: Point) => void} The callback called when dragging ends.
             */
            dragend(): (startLocation: Point, endLocation: Point) => void;
            /**
             * Adds a callback to be called when the dragging ends.
             *
             * @param {(startLocation: Point, endLocation: Point) => any} cb If provided, the function to be called. Takes in Points in pixels.
             * @returns {Drag} The calling Drag.
             */
            dragend(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            _dragstart(): void;
            _doDragstart(): void;
            _drag(): void;
            _doDrag(): void;
            _dragend(): void;
            _doDragend(): void;
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): Drag;
            /**
             * Sets up so that the xScale and yScale that are passed have their
             * domains automatically changed as you zoom.
             *
             * @param {QuantitativeScale} xScale The scale along the x-axis.
             * @param {QuantitativeScale} yScale The scale along the y-axis.
             * @returns {Drag} The calling Drag.
             */
            setupZoomCallback(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>): Drag;
        }
    }
}


declare module Plottable {
    module Interaction {
        /**
         * A DragBox is an interaction that automatically draws a box across the
         * element you attach it to when you drag.
         */
        class DragBox extends Drag {
            /**
             * The DOM element of the box that is drawn. When no box is drawn, it is
             * null.
             */
            dragBox: D3.Selection;
            /**
             * Whether or not dragBox has been rendered in a visible area.
             */
            boxIsDrawn: boolean;
            _dragstart(): void;
            /**
             * Clears the highlighted drag-selection box drawn by the DragBox.
             *
             * @returns {DragBox} The calling DragBox.
             */
            clearBox(): DragBox;
            /**
             * Set where the box is draw explicitly.
             *
             * @param {number} x0 Left.
             * @param {number} x1 Right.
             * @param {number} y0 Top.
             * @param {number} y1 Bottom.
             *
             * @returns {DragBox} The calling DragBox.
             */
            setBox(x0: number, x1: number, y0: number, y1: number): DragBox;
            _anchor(component: Component.AbstractComponent, hitBox: D3.Selection): DragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XDragBox extends DragBox {
            _drag(): void;
            setBox(x0: number, x1: number): XDragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XYDragBox extends DragBox {
            _drag(): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class YDragBox extends DragBox {
            _drag(): void;
            setBox(y0: number, y1: number): YDragBox;
        }
    }
}


declare module Plottable {
    module Dispatcher {
        class AbstractDispatcher extends Core.PlottableObject {
            _target: D3.Selection;
            _event2Callback: {
                [x: string]: () => any;
            };
            /**
             * Constructs a Dispatcher with the specified target.
             *
             * @param {D3.Selection} target The selection to listen for events on.
             */
            constructor(target: D3.Selection);
            /**
             * Gets the target of the Dispatcher.
             *
             * @returns {D3.Selection} The Dispatcher's current target.
             */
            target(): D3.Selection;
            /**
             * Sets the target of the Dispatcher.
             *
             * @param {D3.Selection} target The element to listen for updates on.
             * @returns {Dispatcher} The calling Dispatcher.
             */
            target(targetElement: D3.Selection): AbstractDispatcher;
            /**
             * Attaches the Dispatcher's listeners to the Dispatcher's target element.
             *
             * @returns {Dispatcher} The calling Dispatcher.
             */
            connect(): AbstractDispatcher;
            /**
             * Detaches the Dispatcher's listeners from the Dispatchers' target element.
             *
             * @returns {Dispatcher} The calling Dispatcher.
             */
            disconnect(): AbstractDispatcher;
        }
    }
}


declare module Plottable {
    module Dispatcher {
        class Mouse extends AbstractDispatcher {
            /**
             * Constructs a Mouse Dispatcher with the specified target.
             *
             * @param {D3.Selection} target The selection to listen for events on.
             */
            constructor(target: D3.Selection);
            /**
             * Gets the current callback to be called on mouseover.
             *
             * @return {(location: Point) => any} The current mouseover callback.
             */
            mouseover(): (location: Point) => any;
            /**
             * Attaches a callback to be called on mouseover.
             *
             * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
             *                                            Pass in null to remove the callback.
             * @return {Mouse} The calling Mouse Handler.
             */
            mouseover(callback: (location: Point) => any): Mouse;
            /**
             * Gets the current callback to be called on mousemove.
             *
             * @return {(location: Point) => any} The current mousemove callback.
             */
            mousemove(): (location: Point) => any;
            /**
             * Attaches a callback to be called on mousemove.
             *
             * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
             *                                            Pass in null to remove the callback.
             * @return {Mouse} The calling Mouse Handler.
             */
            mousemove(callback: (location: Point) => any): Mouse;
            /**
             * Gets the current callback to be called on mouseout.
             *
             * @return {(location: Point) => any} The current mouseout callback.
             */
            mouseout(): (location: Point) => any;
            /**
             * Attaches a callback to be called on mouseout.
             *
             * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
             *                                            Pass in null to remove the callback.
             * @return {Mouse} The calling Mouse Handler.
             */
            mouseout(callback: (location: Point) => any): Mouse;
        }
    }
}
