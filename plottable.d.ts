
declare module Plottable {
    module Utils {
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
            /**
             * Clamps x to the range [min, max].
             *
             * @param {number} x The value to be clamped.
             * @param {number} min The minimum value.
             * @param {number} max The maximum value.
             * @return {number} A clamped value in the range [min, max].
             */
            function clamp(x: number, min: number, max: number): number;
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
             * @param {T | ((index?: number) => T)} value The value to fill the array with or a value generator (called with index as arg)
             * @param {number} count The length of the array to generate
             * @return {any[]}
             */
            function createFilledArray<T>(value: T | ((index?: number) => T), count: number): T[];
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
            /**
             * Applies the accessor, if provided, to each element of `array` and returns the maximum value.
             * If no maximum value can be computed, returns defaultValue.
             */
            function max<C>(array: C[], defaultValue: C): C;
            function max<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
            /**
             * Applies the accessor, if provided, to each element of `array` and returns the minimum value.
             * If no minimum value can be computed, returns defaultValue.
             */
            function min<C>(array: C[], defaultValue: C): C;
            function min<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
            /**
             * Returns true **only** if x is NaN
             */
            function isNaN(n: any): boolean;
            /**
             * Returns true if the argument is a number, which is not NaN
             * Numbers represented as strings do not pass this function
             */
            function isValidNumber(n: any): boolean;
            /**
             * Creates shallow copy of map.
             * @param {{ [key: string]: any }} oldMap Map to copy
             *
             * @returns {[{ [key: string]: any }} coppied map.
             */
            function copyMap<T>(oldMap: {
                [key: string]: T;
            }): {
                [key: string]: T;
            };
            function range(start: number, stop: number, step?: number): number[];
            /** Is like setTimeout, but activates synchronously if time=0
             * We special case 0 because of an observed issue where calling setTimeout causes visible flickering.
             * We believe this is because when requestAnimationFrame calls into the paint function, as soon as that function finishes
             * evaluating, the results are painted to the screen. As a result, if we want something to occur immediately but call setTimeout
             * with time=0, then it is pushed to the call stack and rendered in the next frame, so the component that was rendered via
             * setTimeout appears out-of-sync with the rest of the plot.
             */
            function setTimeout(f: Function, time: number, ...args: any[]): number;
            function colorTest(colorTester: D3.Selection, className: string): string;
            function lightenColor(color: string, factor: number): string;
            function distanceSquared(p1: Point, p2: Point): number;
            function isIE(): boolean;
            /**
             * Returns true if the supplied coordinates or Extents intersect or are contained by bbox.
             *
             * @param {number | Extent} xValOrExtent The x coordinate or Extent to test
             * @param {number | Extent} yValOrExtent The y coordinate or Extent to test
             * @param {SVGRect} bbox The bbox
             * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
             * testing intersection
             *
             * @returns {boolean} True if the supplied coordinates or Extents intersect or are
             * contained by bbox, false otherwise.
             */
            function intersectsBBox(xValOrExtent: number | Extent, yValOrExtent: number | Extent, bbox: SVGRect, tolerance?: number): boolean;
            /**
             * Create an Extent from a number or an object with "min" and "max" defined.
             *
             * @param {any} input The object to parse
             *
             * @returns {Extent} The generated Extent
             */
            function parseExtent(input: any): Extent;
        }
    }
}


declare module Plottable {
    module Utils {
        module D3Scale {
            function niceDomain<D>(scale: D3.Scale.QuantitativeScale<D>, domain: D[], count?: number): any[];
        }
    }
}


declare module Plottable {
    module Utils {
        class Map<K, V> {
            /**
             * Set a new key/value pair in the Map.
             *
             * @param {K} key Key to set in the Map
             * @param {V} value Value to set in the Map
             * @return {boolean} True if key already in Map, false otherwise
             */
            set(key: K, value: V): boolean;
            /**
             * Get a value from the store, given a key.
             *
             * @param {K} key Key associated with value to retrieve
             * @return {V} Value if found, undefined otherwise
             */
            get(key: K): V;
            /**
             * Test whether store has a value associated with given key.
             *
             * Will return true if there is a key/value entry,
             * even if the value is explicitly `undefined`.
             *
             * @param {K} key Key to test for presence of an entry
             * @return {boolean} Whether there was a matching entry for that key
             */
            has(key: K): boolean;
            /**
             * Return an array of the values in the Map
             *
             * @return {V[]} The values in the store
             */
            values(): V[];
            /**
             * Return an array of keys in the Map.
             *
             * @return {K[]} The keys in the store
             */
            keys(): K[];
            /**
             * Delete a key from the Map. Return whether the key was present.
             *
             * @param {K} The key to remove
             * @return {boolean} Whether a matching entry was found and removed
             */
            delete(key: K): boolean;
        }
    }
}


declare module Plottable {
    module Utils {
        /**
         * Shim for ES6 set.
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
         */
        class Set<T> {
            constructor();
            add(value: T): Set<T>;
            delete(value: T): boolean;
            has(value: T): boolean;
            values(): T[];
        }
    }
}

declare module Plottable {
    module Utils {
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
            function boxIsInside(inner: ClientRect, outer: ClientRect): boolean;
            function getBoundingSVG(elem: SVGElement): SVGElement;
            function getUniqueClipPathId(): string;
        }
    }
}


declare module Plottable {
    module Utils {
        module Colors {
            /**
             * Return contrast ratio between two colors
             * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under BSD)
             * chroma.js may be found here: https://github.com/gka/chroma.js
             * License may be found here: https://github.com/gka/chroma.js/blob/master/LICENSE
             * see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
             */
            function contrast(a: string, b: string): number;
        }
    }
}


declare module Plottable {
    module Utils {
        /**
         * A set of callbacks which can be all invoked at once.
         * Each callback exists at most once in the set (based on reference equality).
         * All callbacks should have the same signature.
         */
        class CallbackSet<CB extends Function> extends Set<CB> {
            callCallbacks(...args: any[]): CallbackSet<CB>;
        }
    }
}


declare module Plottable {
    module Utils {
        class Stacked {
            /**
             * Calculates the offset of each piece of data, in each dataset, relative to the baseline,
             * for drawing purposes.
             *
             * @return {Utils.Map<Dataset, D3.Map<number>>} A map from each dataset to the offset of each datapoint
             */
            static computeStackOffsets(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>): Map<Dataset, D3.Map<number>>;
            /**
             * Calculates an extent across all datasets. The extent is a <number> interval that
             * accounts for the fact that stacked bits have to be added together when calculating the extent
             *
             * @return {[number]} The extent that spans all the stacked data
             */
            static computeStackExtent(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>, stackOffsets: Utils.Map<Dataset, D3.Map<number>>, filter: Accessor<boolean>): number[];
            /**
             * Given an array of datasets and the accessor function for the key, computes the
             * set reunion (no duplicates) of the domain of each dataset.
             */
            static domainKeys(datasets: Dataset[], keyAccessor: Accessor<any>): string[];
        }
    }
}


declare module Plottable {
    type Formatter = (d: any) => string;
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
        function currency(precision?: number, symbol?: string, prefix?: boolean): (d: any) => string;
        /**
         * Creates a formatter that displays exactly [precision] decimal places.
         *
         * @param {number} [precision] The number of decimal places to show (default 3).
         * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
         *
         * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
         */
        function fixed(precision?: number): (d: any) => string;
        /**
         * Creates a formatter that formats numbers to show no more than
         * [precision] decimal places. All other values are stringified.
         *
         * @param {number} [precision] The number of decimal places to show (default 3).
         * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
         *
         * @returns {Formatter} A formatter for general values.
         */
        function general(precision?: number): (d: any) => string;
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
        function percentage(precision?: number): (d: any) => string;
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
         * Creates a multi time formatter that displays dates.
         *
         * @returns {Formatter} A formatter for time/date values.
         */
        function multiTime(): (d: any) => string;
        /**
         * Creates a time formatter that displays time/date using given specifier.
         *
         * List of directives can be found on: https://github.com/mbostock/d3/wiki/Time-Formatting#format
         *
         * @param {string} [specifier] The specifier for the formatter.
         *
         * @returns {Formatter} A formatter for time/date values.
         */
        function time(specifier: string): Formatter;
        /**
         * Transforms the Plottable TimeInterval string into a d3 time interval equivalent.
         * If the provided TimeInterval is incorrect, the default is d3.time.year
         */
        function timeIntervalToD3Time(timeInterval: string): D3.Time.Interval;
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
    /**
     * A SymbolFactory is a function that takes in a symbolSize which is the edge length of the render area
     * and returns a string representing the 'd' attribute of the resultant 'path' element
     */
    type SymbolFactory = (symbolSize: number) => string;
    module SymbolFactories {
        type StringAccessor = (datum: any, index: number) => string;
        function circle(): SymbolFactory;
        function square(): SymbolFactory;
        function cross(): SymbolFactory;
        function diamond(): SymbolFactory;
        function triangleUp(): SymbolFactory;
        function triangleDown(): SymbolFactory;
    }
}


declare module Plottable {
    module Utils {
        class ClientToSVGTranslator {
            static getTranslator(elem: SVGElement): ClientToSVGTranslator;
            constructor(svg: SVGElement);
            /**
             * Computes the position relative to the <svg> in svg-coordinate-space.
             */
            computePosition(clientX: number, clientY: number): Point;
        }
    }
}


declare module Plottable {
    module Configs {
        /**
         * Specifies if Plottable should show warnings.
         */
        var SHOW_WARNINGS: boolean;
    }
}


declare module Plottable {
    var version: string;
}


declare module Plottable {
    type DatasetCallback = (dataset: Dataset) => void;
    class Dataset {
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
        onUpdate(callback: DatasetCallback): void;
        offUpdate(callback: DatasetCallback): void;
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
    }
}


declare module Plottable {
    module RenderPolicies {
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
            render(): void;
        }
    }
}


declare module Plottable {
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
     * Plottable.RenderController.setRenderPolicy(
     *   new Plottable.RenderPolicies.Immediate()
     * );
     * ```
     */
    module RenderController {
        var _renderPolicy: RenderPolicies.RenderPolicy;
        function setRenderPolicy(policy: string | RenderPolicies.RenderPolicy): void;
        /**
         * If the RenderController is enabled, we enqueue the component for
         * render. Otherwise, it is rendered immediately.
         *
         * @param {Component} component Any Plottable component.
         */
        function registerToRender(component: Component): void;
        /**
         * If the RenderController is enabled, we enqueue the component for
         * layout and render. Otherwise, it is rendered immediately.
         *
         * @param {Component} component Any Plottable component.
         */
        function registerToComputeLayout(component: Component): void;
        /**
         * Render everything that is waiting to be rendered right now, instead of
         * waiting until the next frame.
         *
         * Useful to call when debugging.
         */
        function flush(): void;
    }
}

declare module Plottable {
    /**
     * Access specific datum property.
     */
    interface Accessor<T> {
        (datum: any, index: number, dataset: Dataset): T;
    }
    /**
     * Retrieves scaled datum property.
     */
    type _Projector = (datum: any, index: number, dataset: Dataset) => any;
    /**
     * Projector with dataset and plot metadata
     */
    type AppliedProjector = (datum: any, index: number) => any;
    /**
     * Defines a way how specific attribute needs be retrieved before rendering.
     */
    type _Projection = {
        accessor: Accessor<any>;
        scale?: Scale<any, any>;
        attribute: string;
    };
    /**
     * A mapping from attributes ("x", "fill", etc.) to the functions that get
     * that information out of the data.
     *
     * So if my data looks like `{foo: 5, bar: 6}` and I want the radius to scale
     * with both `foo` and `bar`, an entry in this type might be `{"r":
     * function(d) { return foo + bar; }`.
     */
    type AttributeToProjector = {
        [attrToSet: string]: _Projector;
    };
    type AttributeToAppliedProjector = {
        [attrToSet: string]: AppliedProjector;
    };
    type SpaceRequest = {
        minWidth: number;
        minHeight: number;
    };
    /**
     * The range of your current data. For example, [1, 2, 6, -5] has the Extent
     * `{min: -5, max: 6}`.
     *
     * The point of this type is to hopefully replace the less-elegant `[min,
     * max]` extents produced by d3.
     */
    type Extent = {
        min: number;
        max: number;
    };
    /**
     * A simple location on the screen.
     */
    type Point = {
        x: number;
        y: number;
    };
    /**
     * The corners of a box.
     */
    type Bounds = {
        topLeft: Point;
        bottomRight: Point;
    };
}


declare module Plottable {
    interface ScaleCallback<S extends Scale<any, any>> {
        (scale: S): any;
    }
    module Scales {
        interface ExtentsProvider<D> {
            (scale: Scale<D, any>): D[][];
        }
    }
    class Scale<D, R> {
        /**
         * Constructs a new Scale.
         *
         * A Scale is a wrapper around a D3.Scale.Scale. A Scale is really just a
         * function. Scales have a domain (input), a range (output), and a function
         * from domain to range.
         *
         * @constructor
         */
        constructor();
        extentOfValues(values: D[]): D[];
        protected _getAllExtents(): D[][];
        protected _getExtent(): D[];
        onUpdate(callback: ScaleCallback<Scale<D, R>>): Scale<D, R>;
        offUpdate(callback: ScaleCallback<Scale<D, R>>): Scale<D, R>;
        protected _dispatchUpdate(): void;
        /**
         * Modifies the domain on the scale so that it includes the extent of all
         * perspectives it depends on. This will normally happen automatically, but
         * if you set domain explicitly with `plot.domain(x)`, you will need to
         * call this function if you want the domain to neccessarily include all
         * the data.
         *
         * Extent: The [min, max] pair for a Scale.QuantitativeScale, all covered
         * strings for a Scale.Category.
         *
         * Perspective: A combination of a Dataset and an Accessor that
         * represents a view in to the data.
         *
         * @returns {Scale} The calling Scale.
         */
        autoDomain(): Scale<D, R>;
        protected _autoDomainIfAutomaticMode(): void;
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
        domain(values: D[]): Scale<D, R>;
        protected _getDomain(): void;
        protected _setDomain(values: D[]): void;
        protected _setBackingScaleDomain(values: D[]): void;
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
        range(values: R[]): Scale<D, R>;
        protected _getRange(): void;
        protected _setRange(values: R[]): void;
        addExtentsProvider(provider: Scales.ExtentsProvider<D>): Scale<D, R>;
        removeExtentsProvider(provider: Scales.ExtentsProvider<D>): Scale<D, R>;
    }
}


declare module Plottable {
    class QuantitativeScale<D> extends Scale<D, number> {
        protected static _DEFAULT_NUM_TICKS: number;
        /**
         * Constructs a new QuantitativeScale.
         *
         * A QuantitativeScale is a Scale that maps anys to numbers. It
         * is invertible and continuous.
         *
         * @constructor
         */
        constructor();
        autoDomain(): QuantitativeScale<D>;
        protected _autoDomainIfAutomaticMode(): void;
        protected _getExtent(): D[];
        addPaddingException(key: any, exception: D): QuantitativeScale<D>;
        removePaddingException(key: any): QuantitativeScale<D>;
        addIncludedValue(key: any, value: D): QuantitativeScale<D>;
        removeIncludedValue(key: any): QuantitativeScale<D>;
        padProportion(): number;
        padProportion(padProportion: number): QuantitativeScale<D>;
        protected _expandSingleValueDomain(singleValueDomain: D[]): D[];
        /**
         * Retrieves the domain value corresponding to a supplied range value.
         *
         * @param {number} value: A value from the Scale's range.
         * @returns {D} The domain value corresponding to the supplied range value.
         */
        invert(value: number): D;
        domain(): D[];
        domain(values: D[]): QuantitativeScale<D>;
        /**
         * Gets the lower end of the domain.
         *
         * @return {D}
         */
        domainMin(): D;
        /**
         * Sets the lower end of the domain.
         *
         * @return {QuantitativeScale} The calling QuantitativeScale.
         */
        domainMin(domainMin: D): QuantitativeScale<D>;
        /**
         * Gets the upper end of the domain.
         *
         * @return {D}
         */
        domainMax(): D;
        /**
         * Sets the upper end of the domain.
         *
         * @return {QuantitativeScale} The calling QuantitativeScale.
         */
        domainMax(domainMax: D): QuantitativeScale<D>;
        extentOfValues(values: D[]): D[];
        protected _setDomain(values: D[]): void;
        /**
         * Gets ticks generated by the default algorithm.
         */
        getDefaultTicks(): D[];
        /**
         * Gets a set of tick values spanning the domain.
         *
         * @returns {D[]} The generated ticks.
         */
        ticks(): D[];
        /**
         * Given a domain, expands its domain onto "nice" values, e.g. whole
         * numbers.
         */
        protected _niceDomain(domain: D[], count?: number): D[];
        protected _defaultExtent(): D[];
        /**
         * Gets the tick generator of the QuantitativeScale.
         *
         * @returns {TickGenerator} The current tick generator.
         */
        tickGenerator(): Scales.TickGenerators.TickGenerator<D>;
        /**
         * Sets a tick generator
         *
         * @param {TickGenerator} generator, the new tick generator.
         * @return {QuantitativeScale} The calling QuantitativeScale.
         */
        tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): QuantitativeScale<D>;
    }
}


declare module Plottable {
    module Scales {
        class Linear extends QuantitativeScale<number> {
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
            protected _defaultExtent(): number[];
            protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
            scale(value: number): number;
            protected _getDomain(): any[];
            protected _setBackingScaleDomain(values: number[]): void;
            protected _getRange(): any[];
            protected _setRange(values: number[]): void;
            invert(value: number): number;
            getDefaultTicks(): number[];
            protected _niceDomain(domain: number[], count?: number): number[];
        }
    }
}


declare module Plottable {
    module Scales {
        class ModifiedLog extends QuantitativeScale<number> {
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
            protected _getDomain(): number[];
            protected _setDomain(values: number[]): void;
            protected _setBackingScaleDomain(values: number[]): void;
            ticks(): number[];
            protected _niceDomain(domain: number[], count?: number): number[];
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
            protected _defaultExtent(): number[];
            protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
            protected _getRange(): any[];
            protected _setRange(values: number[]): void;
            getDefaultTicks(): number[];
        }
    }
}


declare module Plottable {
    module Scales {
        class Category extends Scale<string, number> {
            /**
             * Creates a CategoryScale.
             *
             * A CategoryScale maps strings to numbers. A common use is to map the
             * labels of a bar plot (strings) to their pixel locations (numbers).
             *
             * @constructor
             */
            constructor();
            extentOfValues(values: string[]): string[];
            protected _getExtent(): string[];
            domain(): string[];
            domain(values: string[]): Category;
            protected _setDomain(values: string[]): void;
            range(): number[];
            range(values: number[]): Category;
            /**
             * Returns the width of the range band.
             *
             * @returns {number} The range band width
             */
            rangeBand(): number;
            /**
             * Returns the step width of the scale.
             *
             * The step width is defined as the entire space for a band to occupy,
             * including the padding in between the bands.
             *
             * @returns {number} the full band width of the scale
             */
            stepWidth(): number;
            /**
             * Returns the inner padding of the scale.
             *
             * The inner padding is defined as the padding in between bands on the scale.
             * Units are a proportion of the band width (value returned by rangeBand()).
             *
             * @returns {number} The inner padding of the scale
             */
            innerPadding(): number;
            /**
             * Sets the inner padding of the scale.
             *
             * The inner padding of the scale is defined as the padding in between bands on the scale.
             * Units are a proportion of the band width (value returned by rangeBand()).
             *
             * @returns {Ordinal} The calling Scale.Ordinal
             */
            innerPadding(innerPadding: number): Category;
            /**
             * Returns the outer padding of the scale.
             *
             * The outer padding is defined as the padding in between the outer bands and the edges on the scale.
             * Units are a proportion of the band width (value returned by rangeBand()).
             *
             * @returns {number} The outer padding of the scale
             */
            outerPadding(): number;
            /**
             * Sets the outer padding of the scale.
             *
             * The inner padding of the scale is defined as the padding in between bands on the scale.
             * Units are a proportion of the band width (value returned by rangeBand()).
             *
             * @returns {Ordinal} The calling Scale.Ordinal
             */
            outerPadding(outerPadding: number): Category;
            scale(value: string): number;
            protected _getDomain(): any[];
            protected _setBackingScaleDomain(values: string[]): void;
            protected _getRange(): any[];
            protected _setRange(values: number[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        class Color extends Scale<string, string> {
            /**
             * Constructs a ColorScale.
             *
             * @constructor
             * @param {string} [scaleType] the type of color scale to create
             *     (Category10/Category20/Category20b/Category20c).
             * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
             */
            constructor(scaleType?: string);
            extentOfValues(values: string[]): string[];
            protected _getExtent(): string[];
            scale(value: string): string;
            protected _getDomain(): any[];
            protected _setBackingScaleDomain(values: string[]): void;
            protected _getRange(): any[];
            protected _setRange(values: string[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        class Time extends QuantitativeScale<Date> {
            /**
             * Constructs a TimeScale.
             *
             * A TimeScale maps Date objects to numbers.
             *
             * @constructor
             * @param {D3.Scale.Time} scale The D3 LinearScale backing the Scale.Time. If not supplied, uses a default scale.
             */
            constructor();
            /**
             * Specifies the interval between ticks
             *
             * @param {string} interval TimeInterval string specifying the interval unit measure
             * @param {number?} step? The distance between adjacent ticks (using the interval unit measure)
             *
             * @return {Date[]}
             */
            tickInterval(interval: string, step?: number): Date[];
            protected _setDomain(values: Date[]): void;
            protected _defaultExtent(): Date[];
            protected _expandSingleValueDomain(singleValueDomain: Date[]): Date[];
            scale(value: Date): number;
            protected _getDomain(): any[];
            protected _setBackingScaleDomain(values: Date[]): void;
            protected _getRange(): any[];
            protected _setRange(values: number[]): void;
            invert(value: number): Date;
            getDefaultTicks(): Date[];
            protected _niceDomain(domain: Date[], count?: number): any[];
        }
    }
}


declare module Plottable {
    module Scales {
        /**
         * This class implements a color scale that takes quantitive input and
         * interpolates between a list of color values. It returns a hex string
         * representing the interpolated color.
         *
         * By default it generates a linear scale internally.
         */
        class InterpolatedColor extends Scale<number, string> {
            static REDS: string[];
            static BLUES: string[];
            static POSNEG: string[];
            /**
             * An InterpolatedColorScale maps numbers to color strings.
             *
             * @param {string[]} colors an array of strings representing color values in hex
             *     ("#FFFFFF") or keywords ("white"). Defaults to InterpolatedColor.REDS
             * @param {string} scaleType a string representing the underlying scale
             *     type ("linear"/"log"/"sqrt"/"pow"). Defaults to "linear"
             * @returns {D3.Scale.QuantitativeScale} The converted QuantitativeScale d3 scale.
             */
            constructor(colorRange?: string[], scaleType?: string);
            extentOfValues(values: number[]): number[];
            /**
             * Gets the color range.
             *
             * @returns {string[]} the current color values for the range as strings.
             */
            colorRange(): string[];
            /**
             * Sets the color range.
             *
             * @param {string[]} [colorRange]. If provided and if colorRange is one of
             * (reds/blues/posneg), uses the built-in color groups. If colorRange is an
             * array of strings with at least 2 values (e.g. ["#FF00FF", "red",
             * "dodgerblue"], the resulting scale will interpolate between the color
             * values across the domain.
             * @returns {InterpolatedColor} The calling InterpolatedColor.
             */
            colorRange(colorRange: string[]): InterpolatedColor;
            autoDomain(): InterpolatedColor;
            scale(value: number): string;
            protected _getDomain(): any[];
            protected _setBackingScaleDomain(values: number[]): void;
            protected _getRange(): string[];
            protected _setRange(values: string[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        module TickGenerators {
            interface TickGenerator<D> {
                (scale: Plottable.QuantitativeScale<D>): D[];
            }
            /**
             * Creates a tick generator using the specified interval.
             *
             * Generates ticks at multiples of the interval while also including the domain boundaries.
             *
             * @param {number} interval The interval between two ticks (not including the end ticks).
             *
             * @returns {TickGenerator} A tick generator using the specified interval.
             */
            function intervalTickGenerator(interval: number): TickGenerator<number>;
            /**
             * Creates a tick generator that will filter for only the integers in defaultTicks and return them.
             *
             * Will also include the end ticks.
             *
             * @returns {TickGenerator} A tick generator returning only integer ticks.
             */
            function integerTickGenerator(): TickGenerator<number>;
        }
    }
}


declare module Plottable {
    module Drawers {
        /**
         * A step for the drawer to draw.
         *
         * Specifies how AttributeToProjector needs to be animated.
         */
        type DrawStep = {
            attrToProjector: AttributeToProjector;
            animator: Animators.PlotAnimator;
        };
        type AppliedDrawStep = {
            attrToProjector: AttributeToAppliedProjector;
            animator: Animators.PlotAnimator;
        };
        class AbstractDrawer {
            protected _className: string;
            key: string;
            protected _attrToProjector: AttributeToAppliedProjector;
            /**
             * Sets the class, which needs to be applied to bound elements.
             *
             * @param{string} className The class name to be applied.
             */
            setClass(className: string): AbstractDrawer;
            /**
             * Constructs a Drawer
             *
             * @constructor
             * @param{string} key The key associated with this Drawer
             */
            constructor(key: string);
            setup(area: D3.Selection): void;
            /**
             * Removes the Drawer and its renderArea
             */
            remove(): void;
            /**
             * Enter new data to render area and creates binding
             *
             * @param{any[]} data The data to be drawn
             */
            protected _enterData(data: any[]): void;
            /**
             * Draws data using one step
             *
             * @param{AppliedDrawStep} step The step, how data should be drawn.
             */
            protected _drawStep(step: AppliedDrawStep): void;
            protected _numberOfAnimationIterations(data: any[]): number;
            protected _prepareDrawSteps(drawSteps: AppliedDrawStep[]): void;
            protected _prepareData(data: any[], drawSteps: AppliedDrawStep[]): any[];
            /**
             * Draws the data into the renderArea using the spefic steps and metadata
             *
             * @param{any[]} data The data to be drawn
             * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
             * @param{Dataset} dataset The Dataset
             * @param{any} plotMetadata The metadata provided by plot
             */
            draw(data: any[], drawSteps: DrawStep[], dataset: Dataset): number;
            /**
             * Retrieves the renderArea selection for the drawer
             *
             * @returns {D3.Selection} the renderArea selection
             */
            _getRenderArea(): D3.Selection;
            _getSelector(): string;
            _getPixelPoint(datum: any, index: number): Point;
            _getSelection(index: number): D3.Selection;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Line extends AbstractDrawer {
            static LINE_CLASS: string;
            protected _enterData(data: any[]): void;
            setup(area: D3.Selection): void;
            protected _numberOfAnimationIterations(data: any[]): number;
            protected _drawStep(step: AppliedDrawStep): void;
            _getSelector(): string;
            _getPixelPoint(datum: any, index: number): Point;
            _getSelection(index: number): D3.Selection;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Area extends Line {
            static AREA_CLASS: string;
            protected _enterData(data: any[]): void;
            /**
             * Sets the value determining if line should be drawn.
             *
             * @param{boolean} draw The value determing if line should be drawn.
             */
            drawLine(draw: boolean): Area;
            setup(area: D3.Selection): void;
            protected _drawStep(step: AppliedDrawStep): void;
            _getSelector(): string;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Element extends AbstractDrawer {
            protected _svgElement: string;
            /**
             * Sets the svg element, which needs to be bind to data
             *
             * @param{string} tag The svg element to be bind
             */
            svgElement(tag: string): Element;
            protected _drawStep(step: AppliedDrawStep): void;
            protected _enterData(data: any[]): void;
            protected _prepareDrawSteps(drawSteps: AppliedDrawStep[]): void;
            protected _prepareData(data: any[], drawSteps: AppliedDrawStep[]): any[];
            _getSelector(): string;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Rect extends Element {
            constructor(key: string, isVertical: boolean);
            setup(area: D3.Selection): void;
            removeLabels(): void;
            _getIfLabelsTooWide(): boolean;
            drawText(data: any[], attrToProjector: AttributeToProjector, userMetadata: any): void;
            _getPixelPoint(datum: any, index: number): Point;
            draw(data: any[], drawSteps: DrawStep[], userMetadata: any): number;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Arc extends Element {
            constructor(key: string);
            _drawStep(step: AppliedDrawStep): void;
            draw(data: any[], drawSteps: DrawStep[], dataset: Dataset): number;
            _getPixelPoint(datum: any, index: number): Point;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Symbol extends Element {
            constructor(key: string);
            protected _drawStep(step: AppliedDrawStep): void;
            _getPixelPoint(datum: any, index: number): Point;
        }
    }
}


declare module Plottable {
    type ComponentCallback = (component: Component) => void;
    module Components {
        class Alignment {
            static TOP: string;
            static BOTTOM: string;
            static LEFT: string;
            static RIGHT: string;
            static CENTER: string;
        }
    }
    class Component {
        protected _element: D3.Selection;
        protected _content: D3.Selection;
        protected _boundingBox: D3.Selection;
        protected _clipPathEnabled: boolean;
        protected _isSetup: boolean;
        protected _isAnchored: boolean;
        /**
         * Attaches the Component as a child of a given D3 Selection.
         *
         * @param {D3.Selection} selection The Selection containing the Element to anchor under.
         * @returns {Component} The calling Component.
         */
        anchor(selection: D3.Selection): Component;
        /**
         * Adds a callback to be called on anchoring the Component to the DOM.
         * If the component is already anchored, the callback is called immediately.
         *
         * @param {ComponentCallback} callback The callback to be added.
         *
         * @return {Component}
         */
        onAnchor(callback: ComponentCallback): Component;
        /**
         * Removes a callback to be called on anchoring the Component to the DOM.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback The callback to be removed.
         *
         * @return {Component}
         */
        offAnchor(callback: ComponentCallback): Component;
        /**
         * Creates additional elements as necessary for the Component to function.
         * Called during anchor() if the Component's element has not been created yet.
         * Override in subclasses to provide additional functionality.
         */
        protected _setup(): void;
        requestedSpace(availableWidth: number, availableHeight: number): SpaceRequest;
        /**
         * Computes the size, position, and alignment from the specified values.
         * If no parameters are supplied and the Component is a root node,
         * they are inferred from the size of the Component's element.
         *
         * @param {Point} origin Origin of the space offered to the Component.
         * @param {number} availableWidth
         * @param {number} availableHeight
         * @returns {Component} The calling Component.
         */
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Component;
        protected _getSize(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        /**
         * Queues the Component for rendering. Set immediately to true if the Component should be rendered
         * immediately as opposed to queued to the RenderController.
         *
         * @returns {Component} The calling Component
         */
        render(): Component;
        renderImmediately(): Component;
        /**
         * Causes the Component to recompute layout and redraw.
         *
         * This function should be called when CSS changes could influence the size
         * of the components, e.g. changing the font size.
         *
         * @returns {Component} The calling Component.
         */
        redraw(): Component;
        /**
         * Renders the Component into a given DOM element. The element must be as <svg>.
         *
         * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
         * @returns {Component} The calling component.
         */
        renderTo(element: String | D3.Selection): Component;
        /**
         * Gets the x alignment of the Component.
         *
         * @returns {string} The current x alignment.
         */
        xAlignment(): string;
        /**
         * Sets the x alignment of the Component.
         *
         * @param {string} alignment The x alignment of the Component (one of ["left", "center", "right"]).
         * @returns {Component} The calling Component.
         */
        xAlignment(xAlignment: string): Component;
        /**
         * Gets the y alignment of the Component.
         *
         * @returns {string} The current y alignment.
         */
        yAlignment(): string;
        /**
         * Sets the y alignment of the Component.
         *
         * @param {string} alignment The y alignment of the Component (one of ["top", "center", "bottom"]).
         * @returns {Component} The calling Component.
         */
        yAlignment(yAlignment: string): Component;
        /**
         * Checks if the Component has a given CSS class.
         *
         * @param {string} cssClass The CSS class to check for.
         * @returns {boolean} Whether the Component has the given CSS class.
         */
        classed(cssClass: string): boolean;
        /**
         * Adds/removes a given CSS class to/from the Component.
         *
         * @param {string} cssClass The CSS class to add or remove.
         * @param {boolean} addClass If true, adds the provided CSS class; otherwise, removes it.
         * @returns {Component} The calling Component.
         */
        classed(cssClass: string, addClass: boolean): Component;
        /**
         * Checks if the Component has a fixed width or false if it grows to fill available space.
         * Returns false by default on the base Component class.
         *
         * @returns {boolean} Whether the component has a fixed width.
         */
        fixedWidth(): boolean;
        /**
         * Checks if the Component has a fixed height or false if it grows to fill available space.
         * Returns false by default on the base Component class.
         *
         * @returns {boolean} Whether the component has a fixed height.
         */
        fixedHeight(): boolean;
        /**
         * Detaches a Component from the DOM. The component can be reused.
         *
         * This should only be used if you plan on reusing the calling
         * Components. Otherwise, use remove().
         *
         * @returns The calling Component.
         */
        detach(): Component;
        /**
         * Adds a callback to be called when th Component is detach()-ed.
         *
         * @param {ComponentCallback} callback The callback to be added.
         * @return {Component} The calling Component.
         */
        onDetach(callback: ComponentCallback): Component;
        /**
         * Removes a callback to be called when th Component is detach()-ed.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback The callback to be removed.
         * @return {Component} The calling Component.
         */
        offDetach(callback: ComponentCallback): Component;
        parent(): ComponentContainer;
        parent(parent: ComponentContainer): Component;
        /**
         * Removes a Component from the DOM and disconnects it from everything it's
         * listening to (effectively destroying it).
         */
        destroy(): void;
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
        /**
         * Gets the origin of the Component relative to its parent.
         *
         * @return {Point} The x-y position of the Component relative to its parent.
         */
        origin(): Point;
        /**
         * Gets the origin of the Component relative to the root <svg>.
         *
         * @return {Point} The x-y position of the Component relative to the root <svg>
         */
        originToSVG(): Point;
        /**
         * Returns the foreground selection for the Component
         * (A selection covering the front of the Component)
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {D3.Selection} foreground selection for the Component
         */
        foreground(): D3.Selection;
        /**
         * Returns the content selection for the Component
         * (A selection containing the visual elements of the Component)
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {D3.Selection} content selection for the Component
         */
        content(): D3.Selection;
        /**
         * Returns the background selection for the Component
         * (A selection appearing behind of the Component)
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {D3.Selection} background selection for the Component
         */
        background(): D3.Selection;
    }
}


declare module Plottable {
    class ComponentContainer extends Component {
        constructor();
        anchor(selection: D3.Selection): ComponentContainer;
        render(): ComponentContainer;
        /**
         * Checks whether the specified Component is in the ComponentContainer.
         */
        has(component: Component): boolean;
        protected _adoptAndAnchor(component: Component): void;
        /**
         * Removes the specified Component from the ComponentContainer.
         */
        remove(component: Component): ComponentContainer;
        /**
         * Carry out the actual removal of a Component.
         * Implementation dependent on the type of container.
         *
         * @return {boolean} true if the Component was successfully removed, false otherwise.
         */
        protected _remove(component: Component): boolean;
        /**
         * Invokes a callback on each Component in the ComponentContainer.
         */
        protected _forEach(callback: (component: Component) => void): void;
        /**
         * Destroys the ComponentContainer and all Components within it.
         */
        destroy(): void;
    }
}


declare module Plottable {
    module Components {
        class Group extends ComponentContainer {
            /**
             * Constructs a Component.Group.
             *
             * A Component.Group is a set of Components that will be rendered on top of
             * each other. Components added later will be rendered on top of existing Components.
             *
             * @constructor
             * @param {Component[]} components The Components in the resultant Component.Group (default = []).
             */
            constructor(components?: Component[]);
            protected _forEach(callback: (component: Component) => any): void;
            /**
             * Checks whether the specified Component is in the Group.
             */
            has(component: Component): boolean;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Group;
            protected _getSize(availableWidth: number, availableHeight: number): {
                width: number;
                height: number;
            };
            fixedWidth(): boolean;
            fixedHeight(): boolean;
            /**
             * @return {Component[]} The Components in this Group.
             */
            components(): Component[];
            append(component: Component): Group;
            protected _remove(component: Component): boolean;
        }
    }
}


declare module Plottable {
    class Axis<D> extends Component {
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
        protected _tickMarkContainer: D3.Selection;
        protected _tickLabelContainer: D3.Selection;
        protected _baseline: D3.Selection;
        protected _scale: Scale<D, number>;
        protected _computedWidth: number;
        protected _computedHeight: number;
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
        constructor(scale: Scale<D, number>, orientation: string, formatter?: (d: any) => string);
        destroy(): void;
        protected _isHorizontal(): boolean;
        protected _computeWidth(): number;
        protected _computeHeight(): number;
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        fixedHeight(): boolean;
        fixedWidth(): boolean;
        protected _rescale(): void;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Axis<D>;
        protected _setup(): void;
        protected _getTickValues(): D[];
        renderImmediately(): Axis<D>;
        protected _generateBaselineAttrHash(): {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        protected _generateTickMarkAttrHash(isEndTickMark?: boolean): {
            x1: any;
            y1: any;
            x2: any;
            y2: any;
        };
        redraw(): Component;
        protected _setDefaultAlignment(): void;
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
        formatter(formatter: Formatter): Axis<D>;
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
        tickLength(length: number): Axis<D>;
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
        endTickLength(length: number): Axis<D>;
        protected _maxLabelTickLength(): number;
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
        tickLabelPadding(padding: number): Axis<D>;
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
        gutter(size: number): Axis<D>;
        /**
         * Gets the orientation of the Axis.
         *
         * @returns {number} the current orientation.
         */
        orientation(): string;
        /**
         * Sets the orientation of the Axis.
         *
         * @param {number} newOrientation If provided, the desired orientation
         * (top/bottom/left/right).
         * @returns {Axis} The calling Axis.
         */
        orientation(orientation: string): Axis<D>;
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
        showEndTickLabels(show: boolean): Axis<D>;
    }
}


declare module Plottable {
    module TimeInterval {
        var second: string;
        var minute: string;
        var hour: string;
        var day: string;
        var week: string;
        var month: string;
        var year: string;
    }
    module Axes {
        /**
         * Defines a configuration for a time axis tier.
         * For details on how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
         * interval - A time unit associated with this configuration (seconds, minutes, hours, etc).
         * step - number of intervals between each tick.
         * formatter - formatter used to format tick labels.
         */
        type TimeAxisTierConfiguration = {
            interval: string;
            step: number;
            formatter: Formatter;
        };
        /**
         * An array of linked TimeAxisTierConfigurations.
         * Each configuration will be shown on a different tier.
         * Currently, up to two tiers are supported.
         */
        type TimeAxisConfiguration = TimeAxisTierConfiguration[];
        class Time extends Axis<Date> {
            /**
             * The css class applied to each time axis tier
             */
            static TIME_AXIS_TIER_CLASS: string;
            /**
             * Constructs a TimeAxis.
             *
             * A TimeAxis is used for rendering a TimeScale.
             *
             * @constructor
             * @param {TimeScale} scale The scale to base the Axis on.
             * @param {string} orientation The orientation of the Axis (top/bottom)
             */
            constructor(scale: Scales.Time, orientation: string);
            tierLabelPositions(): string[];
            tierLabelPositions(newPositions: string[]): Time;
            /**
             * Gets the possible Axis configurations.
             *
             * @returns {TimeAxisConfiguration[]} The possible tier configurations.
             */
            axisConfigurations(): TimeAxisConfiguration[];
            /**
             * Sets possible Axis configurations.
             * The axis will choose the most precise configuration that will display in
             * its current width.
             *
             * @param {TimeAxisConfiguration[]} configurations Possible axis configurations.
             * @returns {Axis.Time} The calling Axis.Time.
             */
            axisConfigurations(configurations: TimeAxisConfiguration[]): Time;
            orientation(): string;
            orientation(orientation: string): Time;
            protected _computeHeight(): number;
            protected _getSize(availableWidth: number, availableHeight: number): {
                width: number;
                height: number;
            };
            protected _setup(): void;
            protected _getTickValues(): any[];
            renderImmediately(): Time;
        }
    }
}


declare module Plottable {
    module Axes {
        class Numeric extends Axis<number> {
            /**
             * Constructs a NumericAxis.
             *
             * Just as an CategoryAxis is for rendering an OrdinalScale, a NumericAxis
             * is for rendering a QuantitativeScale.
             *
             * @constructor
             * @param {QuantitativeScale} scale The QuantitativeScale to base the axis on.
             * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
             * @param {Formatter} formatter A function to format tick labels (default Formatters.general()).
             */
            constructor(scale: QuantitativeScale<number>, orientation: string, formatter?: (d: any) => string);
            protected _setup(): void;
            protected _computeWidth(): number;
            protected _computeHeight(): number;
            protected _getTickValues(): number[];
            protected _rescale(): void;
            renderImmediately(): Numeric;
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
    module Axes {
        class Category extends Axis<string> {
            /**
             * Constructs a CategoryAxis.
             *
             * A CategoryAxis takes a CategoryScale and includes word-wrapping
             * algorithms and advanced layout logic to try to display the scale as
             * efficiently as possible.
             *
             * @constructor
             * @param {CategoryScale} scale The scale to base the Axis on.
             * @param {string} orientation The orientation of the Axis (top/bottom/left/right) (default = "bottom").
             * @param {Formatter} formatter The Formatter for the Axis (default Formatters.identity())
             */
            constructor(scale: Scales.Category, orientation?: string, formatter?: (d: any) => string);
            protected _setup(): void;
            protected _rescale(): Component;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            protected _getTickValues(): string[];
            /**
             * Gets the tick label angle
             * @returns {number} the tick label angle
             */
            tickLabelAngle(): number;
            /**
             * Sets the angle for the tick labels. Right now vertical-left (-90), horizontal (0), and vertical-right (90) are the only options.
             * @param {number} angle The angle for the ticks
             * @returns {Category} The calling Category Axis.
             *
             * Warning - this is not currently well supported and is likely to behave badly unless all the tick labels are short.
             * See tracking at https://github.com/palantir/plottable/issues/504
             */
            tickLabelAngle(angle: number): Category;
            renderImmediately(): Category;
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Axis<string>;
        }
    }
}


declare module Plottable {
    module Components {
        class Label extends Component {
            /**
             * Creates a Label.
             *
             * A Label is a Component that draws a single line of text.
             *
             * @constructor
             * @param {string} displayText The text of the Label (default = "").
             * @param {number} angle The rotation angle of the text (-90/0/90). 0 is horizontal.
             */
            constructor(displayText?: string, angle?: number);
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            protected _setup(): void;
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
             * Gets the angle of the Label.
             *
             * @returns {number} the current angle.
             */
            angle(): number;
            /**
             * Sets the angle of the Label.
             *
             * @param {number} angle The desired angle (-90/0/90). 0 is horizontal.
             * @returns {Label} The calling Label.
             */
            angle(angle: number): Label;
            /**
             * Gets the amount of padding in pixels around the Label.
             *
             * @returns {number} the current padding amount.
             */
            padding(): number;
            /**
             * Sets the amount of padding in pixels around the Label.
             *
             * @param {number} padAmount The desired padding amount in pixel values
             * @returns {Label} The calling Label.
             */
            padding(padAmount: number): Label;
            fixedWidth(): boolean;
            fixedHeight(): boolean;
            renderImmediately(): Label;
        }
        class TitleLabel extends Label {
            static TITLE_LABEL_CLASS: string;
            /**
             * Creates a TitleLabel, a type of label made for rendering titles.
             *
             * @constructor
             */
            constructor(text?: string, angle?: number);
        }
        class AxisLabel extends Label {
            static AXIS_LABEL_CLASS: string;
            /**
             * Creates a AxisLabel, a type of label made for rendering axis labels.
             *
             * @constructor
             */
            constructor(text?: string, angle?: number);
        }
    }
}


declare module Plottable {
    module Components {
        class Legend extends Component {
            /**
             * The css class applied to each legend row
             */
            static LEGEND_ROW_CLASS: string;
            /**
             * The css class applied to each legend entry
             */
            static LEGEND_ENTRY_CLASS: string;
            /**
             * The css class applied to each legend symbol
             */
            static LEGEND_SYMBOL_CLASS: string;
            /**
             * Creates a Legend.
             *
             * The Legend consists of a series of entries, each with a color and label taken from the `scale`.
             * The entries will be displayed in the order of the `scale` domain.
             *
             * @constructor
             * @param {Scale.Color} scale
             */
            constructor(scale: Scales.Color);
            protected _setup(): void;
            /**
             * Gets the current max number of entries in Legend row.
             * @returns {number} The current max number of entries in row.
             */
            maxEntriesPerRow(): number;
            /**
             * Sets a new max number of entries in Legend row.
             *
             * @param {number} numEntries If provided, the new max number of entries in row.
             * @returns {Legend} The calling Legend.
             */
            maxEntriesPerRow(numEntries: number): Legend;
            /**
             * Gets the current comparator for the Legend's entries.
             * @returns {(a: string, b: string) => number} The current comparator.
             */
            comparator(): (a: string, b: string) => number;
            /**
             * Sets a new comparator for the Legend's entries.
             *
             * @param {(a: string, b: string) => number} comparator If provided, the new comparator.
             * @returns {Legend} The calling Legend.
             */
            comparator(comparator: (a: string, b: string) => number): Legend;
            /**
             * Gets the current color scale from the Legend.
             *
             * @returns {ColorScale} The current color scale.
             */
            scale(): Scales.Color;
            /**
             * Assigns a new color scale to the Legend.
             *
             * @param {Scale.Color} scale If provided, the new scale.
             * @returns {Legend} The calling Legend.
             */
            scale(scale: Scales.Color): Legend;
            destroy(): void;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            /**
             * Gets the legend entry under the given pixel position.
             *
             * @param {Point} position The pixel position.
             * @returns {D3.Selection} The selected entry, or null selection if no entry was selected.
             */
            getEntry(position: Point): D3.Selection;
            renderImmediately(): Legend;
            /**
             * Gets the symbolFactoryAccessor of the legend, which dictates how
             * the symbol in each entry is drawn.
             *
             * @returns {(datum: any, index: number) => symbolFactory} The symbolFactory accessor of the legend
             */
            symbolFactoryAccessor(): (datum: any, index: number) => SymbolFactory;
            /**
             * Sets the symbolFactoryAccessor of the legend
             *
             * @param {(datum: any, index: number) => symbolFactory}  The symbolFactory accessor to set to
             * @returns {Legend} The calling Legend
             */
            symbolFactoryAccessor(symbolFactoryAccessor: (datum: any, index: number) => SymbolFactory): Legend;
            fixedWidth(): boolean;
            fixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Components {
        class InterpolatedColorLegend extends Component {
            /**
             * The css class applied to the legend labels.
             */
            static LEGEND_LABEL_CLASS: string;
            /**
             * Creates an InterpolatedColorLegend.
             *
             * The InterpolatedColorLegend consists of a sequence of swatches, showing the
             * associated Scale.InterpolatedColor sampled at various points. Two labels
             * show the maximum and minimum values of the Scale.InterpolatedColor.
             *
             * @constructor
             * @param {Scale.InterpolatedColor} interpolatedColorScale
             * @param {string} orientation (horizontal/left/right).
             * @param {Formatter} The labels are formatted using this function.
             */
            constructor(interpolatedColorScale: Scales.InterpolatedColor, orientation?: string, formatter?: (d: any) => string);
            destroy(): void;
            /**
             * Gets the current formatter on the InterpolatedColorLegend.
             *
             * @returns {Formatter} The current Formatter.
             */
            formatter(): Formatter;
            /**
             * Sets the current formatter on the InterpolatedColorLegend.
             *
             * @param {Formatter} formatter If provided, data will be passed though `formatter(data)`.
             * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
             */
            formatter(formatter: Formatter): InterpolatedColorLegend;
            /**
             * Gets the orientation of the InterpolatedColorLegend.
             *
             * @returns {string} The current orientation.
             */
            orientation(): string;
            /**
             * Sets the orientation of the InterpolatedColorLegend.
             *
             * @param {string} newOrientation The desired orientation (horizontal/left/right).
             *
             * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
             */
            orientation(orientation: string): InterpolatedColorLegend;
            fixedWidth(): boolean;
            fixedHeight(): boolean;
            protected _setup(): void;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            renderImmediately(): InterpolatedColorLegend;
        }
    }
}


declare module Plottable {
    module Components {
        class Gridlines extends Component {
            /**
             * Creates a set of Gridlines.
             * @constructor
             *
             * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
             * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
             */
            constructor(xScale: QuantitativeScale<any>, yScale: QuantitativeScale<any>);
            destroy(): Gridlines;
            protected _setup(): void;
            renderImmediately(): Gridlines;
        }
    }
}


declare module Plottable {
    module Components {
        class Table extends ComponentContainer {
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
            constructor(rows?: Component[][]);
            protected _forEach(callback: (component: Component) => any): void;
            /**
             * Checks whether the specified Component is in the Table.
             */
            has(component: Component): boolean;
            /**
             * Adds a Component in the specified row and column position.
             *
             * For example, instead of calling `new Table([[a, b], [null, c]])`, you
             * could call
             * ```typescript
             * var table = new Table();
             * table.add(a, 0, 0);
             * table.add(b, 0, 1);
             * table.add(c, 1, 1);
             * ```
             *
             * @param {Component} component The Component to be added.
             * @param {number} row The row in which to add the Component.
             * @param {number} col The column in which to add the Component.
             * @returns {Table} The calling Table.
             */
            add(component: Component, row: number, col: number): Table;
            protected _remove(component: Component): boolean;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Table;
            /**
             * Gets the row padding on the Table.
             *
             * @returns {number} the row padding.
             */
            rowPadding(): number;
            /**
             * Sets the row padding on the Table.
             *
             * @param {number} rowPadding The padding above and below each row, in pixels.
             * @returns {Table} The calling Table.
             */
            rowPadding(rowPadding: number): Table;
            /**
             * Gets the column padding on the Table.
             *
             * @returns {number} the column padding.
             */
            columnPadding(): number;
            /**
             * Sets the column padding on the Table.
             *
             * @param {number} columnPadding the padding to the left and right of each column, in pixels.
             * @returns {Table} The calling Table.
             */
            columnPadding(columnPadding: number): Table;
            rowWeight(index: number): number;
            /**
             * Sets the layout weight of a particular row.
             * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
             *
             * A common case would be to have one row take up 2/3rds of the space,
             * and the other row take up 1/3rd.
             *
             * Example:
             *
             * ```JavaScript
             * plot = new Plottable.Component.Table([
             *  [row1],
             *  [row2]
             * ]);
             *
             * // assign twice as much space to the first row
             * plot
             *  .rowWeight(0, 2)
             *  .rowWeight(1, 1)
             * ```
             *
             * @param {number} index The index of the row.
             * @param {number} weight The weight to be set on the row.
             * @returns {Table} The calling Table.
             */
            rowWeight(index: number, weight: number): Table;
            columnWeight(index: number): number;
            /**
             * Sets the layout weight of a particular column.
             * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
             *
             * Please see `rowWeight` docs for an example.
             *
             * @param {number} index The index of the column.
             * @param {number} weight The weight to be set on the column.
             * @returns {Table} The calling Table.
             */
            columnWeight(index: number, weight: number): Table;
            fixedWidth(): boolean;
            fixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Components {
        class SelectionBoxLayer extends Component {
            protected _box: D3.Selection;
            constructor();
            protected _setup(): void;
            protected _getSize(availableWidth: number, availableHeight: number): {
                width: number;
                height: number;
            };
            /**
             * Gets the bounds of the box.
             *
             * @return {Bounds} The current bounds of the box.
             */
            bounds(): Bounds;
            /**
             * Sets the bounds of the box, and draws the box.
             *
             * @param {Bounds} newBounds The desired bounds of the box.
             * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
             */
            bounds(newBounds: Bounds): SelectionBoxLayer;
            protected _setBounds(newBounds: Bounds): void;
            renderImmediately(): SelectionBoxLayer;
            /**
             * Gets whether the box is being shown.
             *
             * @return {boolean} Whether the box is showing.
             */
            boxVisible(): boolean;
            /**
             * Shows or hides the selection box.
             *
             * @param {boolean} show Whether or not to show the box.
             * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
             */
            boxVisible(show: boolean): SelectionBoxLayer;
            fixedWidth(): boolean;
            fixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Plots {
        /**
         * A key that is also coupled with a dataset, a drawer and a metadata in Plot.
         */
        type PlotDatasetKey = {
            dataset: Dataset;
            drawer: Drawers.AbstractDrawer;
            key: string;
        };
        type PlotData = {
            data: any[];
            pixelPoints: Point[];
            selection: D3.Selection;
        };
        interface AccessorScaleBinding<D, R> {
            accessor: Accessor<any>;
            scale?: Scale<D, R>;
        }
    }
    class Plot extends Component {
        protected _dataChanged: boolean;
        protected _key2PlotDatasetKey: D3.Map<Plots.PlotDatasetKey>;
        protected _datasetKeysInOrder: string[];
        protected _renderArea: D3.Selection;
        protected _attrBindings: D3.Map<_Projection>;
        protected _attrExtents: D3.Map<any[]>;
        protected _animate: boolean;
        protected _animateOnNextRender: boolean;
        protected _propertyExtents: D3.Map<any[]>;
        protected _propertyBindings: D3.Map<Plots.AccessorScaleBinding<any, any>>;
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
        anchor(selection: D3.Selection): Plot;
        protected _setup(): void;
        destroy(): void;
        /**
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        addDataset(dataset: Dataset): Plot;
        protected _getDrawer(key: string): Drawers.AbstractDrawer;
        protected _getAnimator(key: string): Animators.PlotAnimator;
        protected _onDatasetUpdate(): void;
        attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
        attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): Plot;
        attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): Plot;
        protected _bindProperty(property: string, value: any, scale: Scale<any, any>): void;
        protected _generateAttrToProjector(): AttributeToProjector;
        renderImmediately(): Plot;
        /**
         * Enables or disables animation.
         *
         * @param {boolean} enabled Whether or not to animate.
         */
        animate(enabled: boolean): Plot;
        detach(): Plot;
        /**
         * Updates the extents associated with each attribute, then autodomains all scales the Plot uses.
         */
        protected _updateExtents(): void;
        protected _updateExtentsForProperty(property: string): void;
        protected _filterForProperty(property: string): Accessor<boolean>;
        /**
         * Override in subclass to add special extents, such as included values
         */
        protected _extentsForProperty(property: string): any[];
        /**
         * Get the animator associated with the specified Animator key.
         *
         * @return {PlotAnimator} The Animator for the specified key.
         */
        animator(animatorKey: string): Animators.PlotAnimator;
        /**
         * Set the animator associated with the specified Animator key.
         *
         * @param {string} animatorKey The key for the Animator.
         * @param {PlotAnimator} animator An Animator to be assigned to
         * the specified key.
         * @returns {Plot} The calling Plot.
         */
        animator(animatorKey: string, animator: Animators.PlotAnimator): Plot;
        /**
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        removeDataset(dataset: Dataset): Plot;
        /**
         * Returns an array of internal keys corresponding to those Datasets actually on the plot
         */
        protected _keysForDatasets(datasets: Dataset[]): string[];
        datasets(): Dataset[];
        datasets(datasets: Dataset[]): Plot;
        protected _getDrawersInOrder(): Drawers.AbstractDrawer[];
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _additionalPaint(time: number): void;
        protected _getDataToDraw(): D3.Map<any[]>;
        /**
         * Retrieves all of the Selections of this Plot for the specified Datasets.
         *
         * @param {Dataset[]} datasets The Datasets to retrieve the selections from.
         * If not provided, all selections will be retrieved.
         * @param {boolean} exclude If set to true, all Datasets will be queried excluding the keys referenced
         * in the previous datasetKeys argument (default = false).
         * @returns {D3.Selection} The retrieved Selections.
         */
        getAllSelections(datasets?: Dataset[], exclude?: boolean): D3.Selection;
        /**
         * Retrieves all of the PlotData of this plot for the specified dataset(s)
         *
         * @param {Dataset[]} datasets The Datasets to retrieve the PlotData from.
         * If not provided, all PlotData will be retrieved.
         * @returns {PlotData} The retrieved PlotData.
         */
        getAllPlotData(datasets?: Dataset[]): Plots.PlotData;
        /**
         * Retrieves PlotData with the lowest distance, where distance is defined
         * to be the Euclidiean norm.
         *
         * @param {Point} queryPoint The point to which plot data should be compared
         *
         * @returns {PlotData} The PlotData closest to queryPoint
         */
        getClosestPlotData(queryPoint: Point): Plots.PlotData;
        protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean;
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _propertyProjectors(): AttributeToProjector;
    }
}


declare module Plottable {
    module Plots {
        class Pie extends Plot {
            /**
             * Constructs a PiePlot.
             *
             * @constructor
             */
            constructor();
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Pie;
            addDataset(dataset: Dataset): Pie;
            protected _getDrawer(key: string): Drawers.AbstractDrawer;
            getAllPlotData(datasets?: Dataset[]): Plots.PlotData;
            sectorValue<S>(): AccessorScaleBinding<S, number>;
            sectorValue(sectorValue: number | Accessor<number>): Plots.Pie;
            sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): Plots.Pie;
            innerRadius<R>(): AccessorScaleBinding<R, number>;
            innerRadius(innerRadius: number | Accessor<number>): Plots.Pie;
            innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
            outerRadius<R>(): AccessorScaleBinding<R, number>;
            outerRadius(outerRadius: number | Accessor<number>): Plots.Pie;
            outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
        }
    }
}


declare module Plottable {
    class XYPlot<X, Y> extends Plot {
        protected static _X_KEY: string;
        protected static _Y_KEY: string;
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
        constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>);
        x(): Plots.AccessorScaleBinding<X, number>;
        x(x: number | Accessor<number>): XYPlot<X, Y>;
        x(x: X | Accessor<X>, xScale: Scale<X, number>): XYPlot<X, Y>;
        y(): Plots.AccessorScaleBinding<Y, number>;
        y(y: number | Accessor<number>): XYPlot<X, Y>;
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): XYPlot<X, Y>;
        protected _filterForProperty(property: string): (datum: any, index: number, dataset: Dataset) => boolean;
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        destroy(): XYPlot<X, Y>;
        /**
         * Sets the automatic domain adjustment for visible points to operate against the X scale, Y scale, or neither.
         *
         * If 'x' or 'y' is specified the adjustment is immediately performed.
         *
         * @param {string} scale Must be one of 'x', 'y', or 'none'.
         *
         * 'x' will adjust the x scale in relation to changes in the y domain.
         *
         * 'y' will adjust the y scale in relation to changes in the x domain.
         *
         * 'none' means neither scale will change automatically.
         *
         * @returns {XYPlot} The calling XYPlot.
         */
        autorange(scaleName: string): XYPlot<X, Y>;
        protected _propertyProjectors(): AttributeToProjector;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): XYPlot<X, Y>;
        /**
         * Adjusts both domains' extents to show all datasets.
         *
         * This call does not override auto domain adjustment behavior over visible points.
         */
        showAllData(): XYPlot<X, Y>;
        protected _projectorsReady(): boolean;
    }
}


declare module Plottable {
    module Plots {
        class Rectangle<X, Y> extends XYPlot<X, Y> {
            /**
             * Constructs a RectanglePlot.
             *
             * A RectanglePlot consists of a bunch of rectangles. The user is required to
             * project the left and right bounds of the rectangle (x and x1 respectively)
             * as well as the bottom and top bounds (y and y1 respectively). If x1/y1 is
             * not set, the plot will apply auto-centering logic to the extent of x/y
             *
             * @constructor
             * @param {Scale.Scale} xScale The x scale to use.
             * @param {Scale.Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale<X, any>, yScale: Scale<Y, any>);
            protected _getDrawer(key: string): Drawers.Rect;
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _generateDrawSteps(): Drawers.DrawStep[];
            x(): AccessorScaleBinding<X, number>;
            x(x: number | Accessor<number>): Plots.Rectangle<X, Y>;
            x(x: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
            x2(): AccessorScaleBinding<X, number>;
            x2(x2: number | Accessor<number>): Plots.Rectangle<X, Y>;
            x2(x2: X | Accessor<X>, scale: Scale<X, number>): Plots.Rectangle<X, Y>;
            y(): AccessorScaleBinding<Y, number>;
            y(y: number | Accessor<number>): Plots.Rectangle<X, Y>;
            y(y: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
            y2(): AccessorScaleBinding<Y, number>;
            y2(y2: number | Accessor<number>): Plots.Rectangle<X, Y>;
            y2(y2: Y | Accessor<Y>, scale: Scale<Y, number>): Plots.Rectangle<X, Y>;
        }
    }
}


declare module Plottable {
    module Plots {
        class Scatter<X, Y> extends XYPlot<X, Y> {
            /**
             * Constructs a ScatterPlot.
             *
             * @constructor
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             */
            constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>);
            protected _getDrawer(key: string): Drawers.Symbol;
            size<S>(): AccessorScaleBinding<S, number>;
            size(size: number | Accessor<number>): Plots.Scatter<X, Y>;
            size<S>(size: S | Accessor<S>, scale: Scale<S, number>): Plots.Scatter<X, Y>;
            symbol(): AccessorScaleBinding<any, any>;
            symbol(symbol: Accessor<SymbolFactory>): Plots.Scatter<X, Y>;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean;
            protected _propertyProjectors(): AttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plots {
        class Bar<X, Y> extends XYPlot<X, Y> {
            static ORIENTATION_VERTICAL: string;
            static ORIENTATION_HORIZONTAL: string;
            protected static _BarAlignmentToFactor: {
                [alignment: string]: number;
            };
            protected static _DEFAULT_WIDTH: number;
            protected _isVertical: boolean;
            /**
             * Constructs a Bar Plot.
             *
             * @constructor
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             * @param {string} orientation The orientation of the Bar Plot ("vertical"/"horizontal").
             */
            constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, orientation?: string);
            protected _getDrawer(key: string): Drawers.Rect;
            protected _setup(): void;
            /**
             * Gets the baseline value for the bars
             *
             * The baseline is the line that the bars are drawn from, defaulting to 0.
             *
             * @returns {number} The baseline value.
             */
            baseline(): number;
            /**
             * Sets the baseline for the bars to the specified value.
             *
             * The baseline is the line that the bars are drawn from, defaulting to 0.
             *
             * @param {number} value The value to position the baseline at.
             * @returns {Bar} The calling Bar.
             */
            baseline(value: number): Bar<X, Y>;
            /**
             * Sets the bar alignment relative to the independent axis.
             * VerticalBarPlot supports "left", "center", "right"
             * HorizontalBarPlot supports "top", "center", "bottom"
             *
             * @param {string} alignment The desired alignment.
             * @returns {Bar} The calling Bar.
             */
            barAlignment(alignment: string): Bar<X, Y>;
            /**
             * Get whether bar labels are enabled.
             *
             * @returns {boolean} Whether bars should display labels or not.
             */
            labelsEnabled(): boolean;
            /**
             * Set whether bar labels are enabled.
             * @param {boolean} Whether bars should display labels or not.
             *
             * @returns {Bar} The calling plot.
             */
            labelsEnabled(enabled: boolean): Bar<X, Y>;
            /**
             * Get the formatter for bar labels.
             *
             * @returns {Formatter} The formatting function for bar labels.
             */
            labelFormatter(): Formatter;
            /**
             * Change the formatting function for bar labels.
             * @param {Formatter} The formatting function for bar labels.
             *
             * @returns {Bar} The calling plot.
             */
            labelFormatter(formatter: Formatter): Bar<X, Y>;
            /**
             * Retrieves the closest PlotData to queryPoint.
             *
             * Bars containing the queryPoint are considered closest. If queryPoint lies outside
             * of all bars, we return the closest in the dominant axis (x for horizontal
             * charts, y for vertical) and break ties using the secondary axis.
             *
             * @param {Point} queryPoint The point to which plot data should be compared
             *
             * @returns {PlotData} The PlotData closest to queryPoint
             */
            getClosestPlotData(queryPoint: Point): PlotData;
            protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean;
            /**
             * Gets the bar under the given pixel position (if [xValOrExtent]
             * and [yValOrExtent] are {number}s), under a given line (if only one
             * of [xValOrExtent] or [yValOrExtent] are {Extent}s) or are under a
             * 2D area (if [xValOrExtent] and [yValOrExtent] are both {Extent}s).
             *
             * @param {number | Extent} xValOrExtent The pixel x position, or range of x values.
             * @param {number | Extent} yValOrExtent The pixel y position, or range of y values.
             * @returns {D3.Selection} The selected bar, or null if no bar was selected.
             */
            getBars(xValOrExtent: number | Extent, yValOrExtent: number | Extent): D3.Selection;
            protected _additionalPaint(time: number): void;
            protected _drawLabels(): void;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            /**
             * Computes the barPixelWidth of all the bars in the plot.
             *
             * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
             * If the position scale of the plot is a CategoryScale and in points mode, then
             *   from https://github.com/mbostock/d3/wiki/Ordinal-Scales#ordinal_rangePoints, the max barPixelWidth is step * padding
             * If the position scale of the plot is a QuantitativeScale, then _getMinimumDataWidth is scaled to compute the barPixelWidth
             */
            protected _getBarPixelWidth(): number;
            getAllPlotData(datasets?: Dataset[]): Plots.PlotData;
        }
    }
}


declare module Plottable {
    module Plots {
        class Line<X> extends XYPlot<X, number> {
            /**
             * Constructs a LinePlot.
             *
             * @constructor
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>);
            protected _getDrawer(key: string): Drawers.Line;
            protected _getResetYFunction(): (d: any, i: number, dataset: Dataset) => number;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _wholeDatumAttributes(): string[];
            getAllPlotData(datasets?: Dataset[]): Plots.PlotData;
            /**
             * Retrieves the closest PlotData to queryPoint.
             *
             * Lines implement an x-dominant notion of distance; points closest in x are
             * tie-broken by y distance.
             *
             * @param {Point} queryPoint The point to which plot data should be compared
             *
             * @returns {PlotData} The PlotData closest to queryPoint
             */
            getClosestPlotData(queryPoint: Point): PlotData;
        }
    }
}


declare module Plottable {
    module Plots {
        /**
         * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
         */
        class Area<X> extends Line<X> {
            /**
             * Constructs an AreaPlot.
             *
             * @constructor
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>);
            y0(): Plots.AccessorScaleBinding<number, number>;
            y0(y0: number | Accessor<number>): Area<X>;
            y0(y0: number | Accessor<number>, y0Scale: Scale<number, number>): Area<X>;
            protected _onDatasetUpdate(): void;
            protected _getDrawer(key: string): Drawers.Area;
            protected _updateYScale(): void;
            protected _getResetYFunction(): (datum: any, index: number, dataset: Dataset) => any;
            protected _wholeDatumAttributes(): string[];
        }
    }
}


declare module Plottable {
    module Plots {
        class ClusteredBar<X, Y> extends Bar<X, Y> {
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
             * @param {string} orientation The orientation of the Bar Plot ("vertical"/"horizontal").
             */
            constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, orientation?: string);
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _getDataToDraw(): D3.Map<any[]>;
        }
    }
}


declare module Plottable {
    module Plots {
        class StackedArea<X> extends Area<X> {
            /**
             * Constructs a StackedArea plot.
             *
             * @constructor
             * @param {QuantitativeScale} xScale The x scale to use.
             * @param {QuantitativeScale} yScale The y scale to use.
             */
            constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>);
            protected _getDrawer(key: string): Drawers.Area;
            protected _getAnimator(key: string): Animators.PlotAnimator;
            protected _setup(): void;
            x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any;
            y(y?: number | Accessor<number>, yScale?: Scale<number, number>): any;
            protected _additionalPaint(): void;
            protected _updateYScale(): void;
            protected _onDatasetUpdate(): StackedArea<X>;
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _wholeDatumAttributes(): string[];
            protected _updateExtentsForProperty(property: string): void;
            protected _extentsForProperty(attr: string): any[];
        }
    }
}


declare module Plottable {
    module Plots {
        class StackedBar<X, Y> extends Bar<X, Y> {
            /**
             * Constructs a StackedBar plot.
             * A StackedBarPlot is a plot that plots several bar plots stacking on top of each
             * other.
             * @constructor
             * @param {Scale} xScale the x scale of the plot.
             * @param {Scale} yScale the y scale of the plot.
             * @param {string} orientation The orientation of the Bar Plot ("vertical"/"horizontal").
             */
            constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>, orientation?: string);
            protected _getAnimator(key: string): Animators.PlotAnimator;
            x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any;
            y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any;
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _onDatasetUpdate(): StackedBar<X, Y>;
            protected _updateExtentsForProperty(property: string): void;
            protected _extentsForProperty(attr: string): any[];
        }
    }
}


declare module Plottable {
    module Animators {
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
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Selection | D3.Transition.Transition;
            /**
             * Given the number of elements, return the total time the animation requires
             * @param number numberofIterations The number of elements that will be drawn
             * @returns {any} The time required for the animation
             */
            getTiming(numberOfIterations: number): number;
        }
        type PlotAnimatorMap = {
            [animatorKey: string]: PlotAnimator;
        };
    }
}


declare module Plottable {
    module Animators {
        /**
         * An animator implementation with no animation. The attributes are
         * immediately set on the selection.
         */
        class Null implements PlotAnimator {
            getTiming(selection: any): number;
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animators {
        /**
         * The base animator implementation with easing, duration, and delay.
         *
         * The maximum delay between animations can be configured with maxIterativeDelay.
         *
         * The maximum total animation duration can be configured with maxTotalDuration.
         * maxTotalDuration does not set actual total animation duration.
         *
         * The actual interval delay is calculated by following formula:
         * min(maxIterativeDelay(),
         *   max(maxTotalDuration() - duration(), 0) / <number of iterations>)
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
             * The default maximum start delay between each start of an animation
             */
            static DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS: number;
            /**
             * The default maximum total animation duration
             */
            static DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS: number;
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
            getTiming(numberOfIterations: number): number;
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
             * @returns {Base} The calling Base Animator.
             */
            maxIterativeDelay(maxIterDelay: number): Base;
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
             * @returns {Base} The calling Base Animator.
             */
            maxTotalDuration(maxDuration: number): Base;
        }
    }
}


declare module Plottable {
    module Animators {
        /**
         * The default animator implementation with easing, duration, and delay.
         */
        class Rect extends Base {
            static ANIMATED_ATTRIBUTES: string[];
            isVertical: boolean;
            isReverse: boolean;
            constructor(isVertical?: boolean, isReverse?: boolean);
            animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition;
            protected _startMovingProjector(attrToProjector: AttributeToProjector): (datum: any, index: number, dataset: Dataset) => any;
        }
    }
}


declare module Plottable {
    module Animators {
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
            protected _startMovingProjector(attrToProjector: AttributeToProjector): (p: any) => number;
        }
    }
}


declare module Plottable {
    class Dispatcher {
        protected _event2Callback: {
            [eventName: string]: (e: Event) => any;
        };
        protected _callbacks: Utils.CallbackSet<Function>[];
        protected setCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function): void;
        protected unsetCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function): void;
    }
}


declare module Plottable {
    module Dispatchers {
        type MouseCallback = (p: Point, event: MouseEvent) => void;
        class Mouse extends Dispatcher {
            /**
             * Get a Dispatcher.Mouse for the <svg> containing elem. If one already exists
             * on that <svg>, it will be returned; otherwise, a new one will be created.
             *
             * @param {SVGElement} elem A svg DOM element.
             * @return {Dispatcher.Mouse} A Dispatcher.Mouse
             */
            static getDispatcher(elem: SVGElement): Dispatchers.Mouse;
            /**
             * Creates a Dispatcher.Mouse.
             * This constructor not be invoked directly under most circumstances.
             *
             * @param {SVGElement} svg The root <svg> element to attach to.
             */
            constructor(svg: SVGElement);
            /**
             * Registers a callback to be called whenever the mouse position changes,
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            onMouseMove(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers the callback to be called whenever the mouse position changes,
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            offMouseMove(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called whenever a mousedown occurs.
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            onMouseDown(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers the callback to be called whenever a mousedown occurs.
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            offMouseDown(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called whenever a mouseup occurs.
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            onMouseUp(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers the callback to be called whenever a mouseup occurs.
             *
             * @param {(p: Point) => any} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            offMouseUp(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called whenever a wheel occurs.
             *
             * @param {MouseCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space.
             *                                     Pass `null` to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            onWheel(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers the callback to be called whenever a wheel occurs.
             *
             * @param {MouseCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space.
             *                                     Pass `null` to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            offWheel(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called whenever a dblClick occurs.
             *
             * @param {MouseCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space.
             *                                     Pass `null` to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            onDblClick(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers the callback to be called whenever a dblClick occurs.
             *
             * @param {MouseCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space.
             *                                     Pass `null` to remove a callback.
             * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
             */
            offDblClick(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Returns the last computed mouse position.
             *
             * @return {Point} The last known mouse position in <svg> coordinate space.
             */
            getLastMousePosition(): {
                x: number;
                y: number;
            };
        }
    }
}


declare module Plottable {
    module Dispatchers {
        type TouchCallback = (ids: number[], idToPoint: {
            [id: number]: Point;
        }, event: TouchEvent) => void;
        class Touch extends Dispatcher {
            /**
             * Get a Dispatcher.Touch for the <svg> containing elem. If one already exists
             * on that <svg>, it will be returned; otherwise, a new one will be created.
             *
             * @param {SVGElement} elem A svg DOM element.
             * @return {Dispatcher.Touch} A Dispatcher.Touch
             */
            static getDispatcher(elem: SVGElement): Dispatchers.Touch;
            /**
             * Creates a Dispatcher.Touch.
             * This constructor should not be invoked directly under most circumstances.
             *
             * @param {SVGElement} svg The root <svg> element to attach to.
             */
            constructor(svg: SVGElement);
            /**
             * Registers a callback to be called whenever a touch starts.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            onTouchStart(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes the callback to be called whenever a touch starts.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            offTouchStart(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called whenever the touch position changes.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            onTouchMove(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes the callback to be called whenever the touch position changes.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            offTouchMove(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called whenever a touch ends.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            onTouchEnd(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes the callback to be called whenever a touch ends.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            offTouchEnd(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called whenever a touch is cancelled.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            onTouchCancel(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes the callback to be called whenever a touch is cancelled.
             *
             * @param {TouchCallback} callback A callback that takes the pixel position
             *                                     in svg-coordinate-space. Pass `null`
             *                                     to remove a callback.
             * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
             */
            offTouchCancel(callback: TouchCallback): Dispatchers.Touch;
        }
    }
}


declare module Plottable {
    module Dispatchers {
        type KeyCallback = (keyCode: number, event: KeyboardEvent) => void;
        class Key extends Dispatcher {
            /**
             * Get a Dispatcher.Key. If one already exists it will be returned;
             * otherwise, a new one will be created.
             *
             * @return {Dispatcher.Key} A Dispatcher.Key
             */
            static getDispatcher(): Dispatchers.Key;
            /**
             * Creates a Dispatcher.Key.
             * This constructor not be invoked directly under most circumstances.
             *
             * @param {SVGElement} svg The root <svg> element to attach to.
             */
            constructor();
            /**
             * Registers a callback to be called whenever a key is pressed.
             *
             * @param {KeyCallback} callback
             * @return {Dispatcher.Key} The calling Dispatcher.Key.
             */
            onKeyDown(callback: KeyCallback): Key;
            /**
             * Removes the callback to be called whenever a key is pressed.
             *
             * @param {KeyCallback} callback
             * @return {Dispatcher.Key} The calling Dispatcher.Key.
             */
            offKeyDown(callback: KeyCallback): Key;
        }
    }
}


declare module Plottable {
    class Interaction {
        protected _componentAttachedTo: Component;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        /**
         * Attaches this interaction to a Component.
         * If the interaction was already attached to a Component, it first detaches itself from the old Component.
         *
         * @param {Component} component The component to which to attach the interaction.
         *
         * @return {Interaction}
         */
        attachTo(component: Component): Interaction;
        /**
         * Detaches this interaction from the Component.
         * This interaction can be reused.
         *
         * @param {Component} component The component from which to detach the interaction.
         *
         * @return {Interaction}
         */
        detachFrom(component: Component): Interaction;
        /**
         * Translates an <svg>-coordinate-space point to Component-space coordinates.
         *
         * @param {Point} p A Point in <svg>-space coordinates.
         *
         * @return {Point} The same location in Component-space coordinates.
         */
        protected _translateToComponentSpace(p: Point): Point;
        /**
         * Checks whether a Component-coordinate-space Point is inside the Component.
         *
         * @param {Point} p A Point in Coordinate-space coordinates.
         *
         * @return {boolean} Whether or not the point is inside the Component.
         */
        protected _isInsideComponent(p: Point): boolean;
    }
}


declare module Plottable {
    type ClickCallback = (point: Point) => void;
    module Interactions {
        class Click extends Interaction {
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            /**
             * Sets the callback called when the Component is clicked.
             *
             * @param {ClickCallback} callback The callback to set.
             * @return {Interaction.Click} The calling Interaction.Click.
             */
            onClick(callback: ClickCallback): Click;
            /**
             * Removes the callback from click.
             *
             * @param {ClickCallback} callback The callback to remove.
             * @return {Interaction.Click} The calling Interaction.Click.
             */
            offClick(callback: ClickCallback): Click;
        }
    }
}


declare module Plottable {
    module Interactions {
        class DoubleClick extends Interaction {
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            /**
             * Sets the callback called when the Component is double-clicked.
             *
             * @param {ClickCallback} callback The callback to set.
             * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
             */
            onDoubleClick(callback: ClickCallback): DoubleClick;
            /**
             * Removes the callback called when the Component is double-clicked.
             *
             * @param {ClickCallback} callback The callback to remove.
             * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
             */
            offDoubleClick(callback: ClickCallback): DoubleClick;
        }
    }
}


declare module Plottable {
    type KeyCallback = (keyCode: number) => void;
    module Interactions {
        class Key extends Interaction {
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            /**
             * Sets a callback to be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode The key code associated with the key.
             * @param {KeyCallback} callback Callback to be set.
             * @returns The calling Interaction.Key.
             */
            onKey(keyCode: number, callback: KeyCallback): Key;
            /**
             * Removes the callback to be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode The key code associated with the key.
             * @param {KeyCallback} callback Callback to be removed.
             * @returns The calling Interaction.Key.
             */
            offKey(keyCode: number, callback: KeyCallback): Key;
        }
    }
}


declare module Plottable {
    type PointerCallback = (point: Point) => void;
    module Interactions {
        class Pointer extends Interaction {
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            /**
             * Sets the callback called when the pointer enters the Component.
             *
             * @param {PointerCallback} callback The callback to set.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            onPointerEnter(callback: PointerCallback): Pointer;
            /**
             * Removes a callback called when the pointer enters the Component.
             *
             * @param {PointerCallback} callback The callback to remove.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            offPointerEnter(callback: PointerCallback): Pointer;
            /**
             * Sets the callback called when the pointer moves.
             *
             * @param {PointerCallback} callback The callback to set.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            onPointerMove(callback: PointerCallback): Pointer;
            /**
             * Removes a callback called when the pointer moves.
             *
             * @param {PointerCallback} callback The callback to remove.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            offPointerMove(callback: PointerCallback): Pointer;
            /**
             * Sets the callback called when the pointer exits the Component.
             *
             * @param {PointerCallback} callback The callback to set.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            onPointerExit(callback: PointerCallback): Pointer;
            /**
             * Removes a callback called when the pointer exits the Component.
             *
             * @param {PointerCallback} callback The callback to remove.
             * @return {Interaction.Pointer} The calling Interaction.Pointer.
             */
            offPointerExit(callback: PointerCallback): Pointer;
        }
    }
}


declare module Plottable {
    module Interactions {
        class PanZoom extends Interaction {
            /**
             * The number of pixels occupied in a line.
             */
            static PIXELS_PER_LINE: number;
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
            constructor(xScale?: QuantitativeScale<any>, yScale?: QuantitativeScale<any>);
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
        }
    }
}


declare module Plottable {
    type DragCallback = (start: Point, end: Point) => void;
    module Interactions {
        class Drag extends Interaction {
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            /**
             * Returns whether or not this Interactions constrains Points passed to its
             * callbacks to lie inside its Component.
             *
             * If true, when the user drags outside of the Component, the closest Point
             * inside the Component will be passed to the callback instead of the actual
             * cursor position.
             *
             * @return {boolean} Whether or not the Interactions.Drag constrains.
             */
            constrainToComponent(): boolean;
            /**
             * Sets whether or not this Interactions constrains Points passed to its
             * callbacks to lie inside its Component.
             *
             * If true, when the user drags outside of the Component, the closest Point
             * inside the Component will be passed to the callback instead of the actual
             * cursor position.
             *
             * @param {boolean} constrain Whether or not to constrain Points.
             * @return {Interactions.Drag} The calling Interactions.Drag.
             */
            constrainToComponent(constrain: boolean): Drag;
            /**
             * Sets the callback to be called when dragging starts.
             *
             * @param {DragCallback} callback The callback to be called. Takes in a Point in pixels.
             * @returns {Drag} The calling Interactions.Drag.
             */
            onDragStart(callback: DragCallback): Drag;
            /**
             * Removes the callback to be called when dragging starts.
             *
             * @param {DragCallback} callback The callback to be removed.
             * @returns {Drag} The calling Interactions.Drag.
             */
            offDragStart(callback: DragCallback): Drag;
            /**
             * Adds a callback to be called during dragging.
             *
             * @param {DragCallback} callback The callback to be called. Takes in Points in pixels.
             * @returns {Drag} The calling Interactions.Drag.
             */
            onDrag(callback: DragCallback): Drag;
            /**
             * Removes a callback to be called during dragging.
             *
             * @param {DragCallback} callback The callback to be removed.
             * @returns {Drag} The calling Interactions.Drag.
             */
            offDrag(callback: DragCallback): Drag;
            /**
             * Adds a callback to be called when the dragging ends.
             *
             * @param {DragCallback} callback The callback to be called. Takes in Points in pixels.
             * @returns {Drag} The calling Interactions.Drag.
             */
            onDragEnd(callback: DragCallback): Drag;
            /**
             * Removes a callback to be called when the dragging ends.
             *
             * @param {DragCallback} callback The callback to be removed
             * @returns {Drag} The calling Interactions.Drag.
             */
            offDragEnd(callback: DragCallback): Drag;
        }
    }
}


declare module Plottable {
    type DragBoxCallback = (bounds: Bounds) => void;
    module Components {
        class DragBoxLayer extends Components.SelectionBoxLayer {
            protected _hasCorners: boolean;
            constructor();
            protected _setup(): void;
            renderImmediately(): DragBoxLayer;
            /**
             * Gets the detection radius of the drag box.
             *
             * @return {number} The detection radius of the drag box.
             */
            detectionRadius(): number;
            /**
             * Sets the detection radius of the drag box.
             *
             * @param {number} r The desired detection radius.
             * @return {DragBoxLayer} The calling DragBoxLayer.
             */
            detectionRadius(r: number): DragBoxLayer;
            /**
             * Gets whether or not the drag box is resizable.
             *
             * @return {boolean} Whether or not the drag box is resizable.
             */
            resizable(): boolean;
            /**
             * Sets whether or not the drag box is resizable.
             *
             * @param {boolean} canResize Whether or not the drag box should be resizable.
             * @return {DragBoxLayer} The calling DragBoxLayer.
             */
            resizable(canResize: boolean): DragBoxLayer;
            protected _setResizableClasses(canResize: boolean): void;
            /**
             * Sets the callback to be called when dragging starts.
             *
             * @param {DragBoxCallback} callback The callback to be called. Passed the current Bounds in pixels.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDragStart(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called when dragging starts.
             *
             * @param {DragBoxCallback} callback The callback to be removed.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDragStart(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Sets a callback to be called during dragging.
             *
             * @param {DragBoxCallback} callback The callback to be called. Passed the current Bounds in pixels.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDrag(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called during dragging.
             *
             * @param {DragBoxCallback} callback The callback to be removed.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDrag(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Sets a callback to be called when the dragging ends.
             *
             * @param {DragBoxCallback} callback The callback to be called. Passed the current Bounds in pixels.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDragEnd(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called when the dragging ends.
             *
             * @param {DragBoxCallback} callback The callback to be removed.
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDragEnd(callback: DragBoxCallback): DragBoxLayer;
        }
    }
}


declare module Plottable {
    module Components {
        class XDragBoxLayer extends DragBoxLayer {
            constructor();
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): XDragBoxLayer;
            protected _setBounds(newBounds: Bounds): void;
            protected _setResizableClasses(canResize: boolean): void;
        }
    }
}


declare module Plottable {
    module Components {
        class YDragBoxLayer extends DragBoxLayer {
            constructor();
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): YDragBoxLayer;
            protected _setBounds(newBounds: Bounds): void;
            protected _setResizableClasses(canResize: boolean): void;
        }
    }
}
