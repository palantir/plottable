
declare module Plottable {
    module Utils {
        module Math {
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
            function range(start: number, stop: number, step?: number): number[];
            function distanceSquared(p1: Point, p2: Point): number;
        }
    }
}


declare module Plottable {
    module Utils {
        /**
         * Shim for ES6 map.
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
         */
        class Map<K, V> {
            /**
             * Set a new key/value pair in the Map.
             *
             * @param {K} key Key to set in the Map
             * @param {V} value Value to set in the Map
             * @return {Map} The Map object
             */
            set(key: K, value: V): Map<K, V>;
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
             * The forEach method executes the provided callback once for each key of the map which
             * actually exist. It is not invoked for keys which have been deleted.
             *
             * @param {(value: V, key: K, map: Map<K, V>) => void} callbackFn The callback to be invoked
             * @param {any} thisArg The `this` context
             */
            forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
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
            size: number;
            constructor();
            add(value: T): Set<T>;
            delete(value: T): boolean;
            has(value: T): boolean;
            /**
             * The forEach method executes the provided callback once for each value which actually exists
             * in the Set object. It is not invoked for values which have been deleted.
             *
             * @param {(value: T, value2: T, set: Set<T>) => void} callback The callback to be invoked
             * @param {any} thisArg The `this` context
             */
            forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
        }
    }
}

declare module Plottable {
    module Utils {
        module DOM {
            /**
             * Gets the bounding box of an element.
             * @param {d3.Selection} element
             * @returns {SVGRed} The bounding box.
             */
            function getBBox(element: d3.Selection<any>): SVGRect;
            var POLYFILL_TIMEOUT_MSEC: number;
            function requestAnimationFramePolyfill(fn: () => any): void;
            function isSelectionRemovedFromSVG(selection: d3.Selection<any>): boolean;
            function getElementWidth(elem: Element): number;
            function getElementHeight(elem: Element): number;
            function getSVGPixelWidth(svg: d3.Selection<void>): number;
            function translate(s: d3.Selection<any>): d3.Transform;
            function translate(s: d3.Selection<any>, x: number, y: number): d3.Selection<any>;
            function boxesOverlap(boxA: ClientRect, boxB: ClientRect): boolean;
            function boxIsInside(inner: ClientRect, outer: ClientRect): boolean;
            function getBoundingSVG(elem: SVGElement): SVGElement;
            function getUniqueClipPathId(): string;
            /**
             * Returns true if the supplied coordinates or Ranges intersect or are contained by bbox.
             *
             * @param {number | Range} xValOrRange The x coordinate or Range to test
             * @param {number | Range} yValOrRange The y coordinate or Range to test
             * @param {SVGRect} bbox The bbox
             * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
             * testing intersection
             *
             * @returns {boolean} True if the supplied coordinates or Ranges intersect or are
             * contained by bbox, false otherwise.
             */
            function intersectsBBox(xValOrRange: number | Range, yValOrRange: number | Range, bbox: SVGRect, tolerance?: number): boolean;
        }
    }
}


declare module Plottable {
    module Utils {
        module Color {
            /**
             * Return contrast ratio between two colors
             * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under BSD)
             * chroma.js may be found here: https://github.com/gka/chroma.js
             * License may be found here: https://github.com/gka/chroma.js/blob/master/LICENSE
             * see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
             */
            function contrast(a: string, b: string): number;
            function lightenColor(color: string, factor: number): string;
            function colorTest(colorTester: d3.Selection<void>, className: string): string;
        }
    }
}


declare module Plottable {
    module Utils {
        module Array {
            /**
             * Takes two arrays of numbers and adds them together
             *
             * @param {number[]} aList The first array of numbers
             * @param {number[]} bList The second array of numbers
             * @return {number[]} An array of numbers where x[i] = aList[i] + bList[i]
             */
            function add(aList: number[], bList: number[]): number[];
            /**
             * Take an array of values, and return the unique values.
             * Will work iff ∀ a, b, a.toString() == b.toString() => a == b; will break on Object inputs
             *
             * @param {T[]} values The values to find uniqueness for
             * @return {T[]} The unique values
             */
            function uniq<T>(arr: T[]): T[];
            /**
             * @param {T[][]} a The 2D array that will have its elements joined together.
             * @return {T[]} Every array in a, concatenated together in the order they appear.
             */
            function flatten<T>(a: T[][]): T[];
            /**
             * Creates an array of length `count`, filled with value or (if value is a function), value()
             *
             * @param {T | ((index?: number) => T)} value The value to fill the array with or a value generator (called with index as arg)
             * @param {number} count The length of the array to generate
             * @return {any[]}
             */
            function createFilledArray<T>(value: T | ((index?: number) => T), count: number): T[];
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
             * @return {Utils.Map<Dataset, d3.Map<number>>} A map from each dataset to the offset of each datapoint
             */
            static computeStackOffsets(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>): Map<Dataset, d3.Map<number>>;
            /**
             * Calculates an extent across all datasets. The extent is a <number> interval that
             * accounts for the fact that stacked bits have to be added together when calculating the extent
             *
             * @return {[number]} The extent that spans all the stacked data
             */
            static computeStackExtent(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>, stackOffsets: Utils.Map<Dataset, d3.Map<number>>, filter: Accessor<boolean>): number[];
            /**
             * Given an array of datasets and the accessor function for the key, computes the
             * set reunion (no duplicates) of the domain of each dataset.
             */
            static domainKeys(datasets: Dataset[], keyAccessor: Accessor<any>): string[];
        }
    }
}


declare module Plottable {
    module Utils {
        module Window {
            /**
             * Print a warning message to the console, if it is available.
             *
             * @param {string} The warnings to print
             */
            function warn(warning: string): void;
            /**
             * Is like setTimeout, but activates synchronously if time=0
             * We special case 0 because of an observed issue where calling setTimeout causes visible flickering.
             * We believe this is because when requestAnimationFrame calls into the paint function, as soon as that function finishes
             * evaluating, the results are painted to the screen. As a result, if we want something to occur immediately but call setTimeout
             * with time=0, then it is pushed to the call stack and rendered in the next frame, so the component that was rendered via
             * setTimeout appears out-of-sync with the rest of the plot.
             */
            function setTimeout(f: Function, time: number, ...args: any[]): number;
            /**
             * Creates shallow copy of the object.
             * @param {{ [key: string]: any }} oldMap Map to copy
             *
             * @returns {[{ [key: string]: any }} coppied object.
             */
            function copyObject<T>(oldObject: {
                [key: string]: T;
            }): {
                [key: string]: T;
            };
        }
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
         * A Dataset contains an array of data and some metadata.
         * Changes to the data or metadata will cause anything subscribed to the Dataset to update.
         *
         * @constructor
         * @param {any[]} [data=[]] The data for this Dataset.
         * @param {any} [metadata={}] An object containing additional information.
         */
        constructor(data?: any[], metadata?: any);
        /**
         * Adds a callback to be called when the Dataset updates.
         *
         * @param {DatasetCallback} callback.
         * @returns {Dataset} The calling Dataset.
         */
        onUpdate(callback: DatasetCallback): Dataset;
        /**
         * Removes a callback that would be called when the Dataset updates.
         *
         * @param {DatasetCallback} callback
         * @returns {Dataset} The calling Dataset.
         */
        offUpdate(callback: DatasetCallback): Dataset;
        /**
         * Gets the data.
         *
         * @returns {any[]}
         */
        data(): any[];
        /**
         * Sets the data.
         *
         * @param {any[]} data
         * @returns {Dataset} The calling Dataset.
         */
        data(data: any[]): Dataset;
        /**
         * Gets the metadata.
         *
         * @returns {any}
         */
        metadata(): any;
        /**
         * Sets the metadata.
         *
         * @param {any} metadata
         * @returns {Dataset} The calling Dataset.
         */
        metadata(metadata: any): Dataset;
    }
}


declare module Plottable {
    module RenderPolicies {
        /**
         * A policy for rendering Components.
         */
        interface RenderPolicy {
            render(): any;
        }
        /**
         * Renders Components immediately after they are enqueued.
         * Useful for debugging, horrible for performance.
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
         * Renders with `setTimeout()`.
         * Generally an inferior way to render compared to `requestAnimationFrame`,
         * but useful for browsers that don't suppoort `requestAnimationFrame`.
         */
        class Timeout implements RenderPolicy {
            render(): void;
        }
    }
}


declare module Plottable {
    /**
     * The RenderController is responsible for enqueueing and synchronizing
     * layout and render calls for Components.
     *
     * Layout and render calls occur inside an animation callback
     * (window.requestAnimationFrame if available).
     *
     * RenderController.flush() immediately lays out and renders all Components currently enqueued.
     *
     * To always have immediate rendering (useful for debugging), call
     * ```typescript
     * Plottable.RenderController.setRenderPolicy(
     *   new Plottable.RenderPolicies.Immediate()
     * );
     * ```
     */
    module RenderController {
        module Policy {
            var IMMEDIATE: string;
            var ANIMATION_FRAME: string;
            var TIMEOUT: string;
        }
        var _renderPolicy: RenderPolicies.RenderPolicy;
        function setRenderPolicy(policy: string): void;
        /**
         * Enqueues the Component for rendering.
         *
         * @param {Component} component
         */
        function registerToRender(component: Component): void;
        /**
         * Enqueues the Component for layout and rendering.
         *
         * @param {Component} component
         */
        function registerToComputeLayout(component: Component): void;
        /**
         * Renders all Components waiting to be rendered immediately
         * instead of waiting until the next frame.
         *
         * Useful to call when debugging.
         */
        function flush(): void;
    }
}

declare module Plottable {
    /**
     * Accesses a specific datum property.
     */
    interface Accessor<T> {
        (datum: any, index: number, dataset: Dataset): T;
    }
    /**
     * Retrieves scaled datum property.
     */
    type Projector = (datum: any, index: number, dataset: Dataset) => any;
    type AppliedProjector = (datum: any, index: number) => any;
    /**
     * A mapping from attributes ("x", "fill", etc.) to the functions that get
     * that information out of the data.
     */
    type AttributeToProjector = {
        [attrToSet: string]: Projector;
    };
    type AttributeToAppliedProjector = {
        [attrToSet: string]: AppliedProjector;
    };
    type SpaceRequest = {
        minWidth: number;
        minHeight: number;
    };
    type Range = {
        min: number;
        max: number;
    };
    /**
     * A location in pixel-space.
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
        function timeIntervalToD3Time(timeInterval: string): d3.time.Interval;
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
    interface ScaleCallback<S extends Scale<any, any>> {
        (scale: S): any;
    }
    module Scales {
        /**
         * A function that supplies domain values to be included into a Scale.
         *
         * @param {Scale} scale
         * @returns {D[]} An array of values that should be included in the Scale.
         */
        interface IncludedValuesProvider<D> {
            (scale: Scale<D, any>): D[];
        }
        /**
         * A function that supplies padding exception values for the Scale.
         * If one end of the domain is set to an excepted value as a result of autoDomain()-ing,
         * that end of the domain will not be padded.
         *
         * @param {QuantitativeScale} scale
         * @returns {D[]} An array of values that should not be padded.
         */
        interface PaddingExceptionsProvider<D> {
            (scale: QuantitativeScale<D>): D[];
        }
    }
    class Scale<D, R> {
        /**
         * A Scale is a function (in the mathematical sense) that maps values from a domain to a range.
         *
         * @constructor
         */
        constructor();
        /**
         * Given an array of potential domain values, computes the extent of those values.
         *
         * @param {D[]} values
         * @returns {D[]} The extent of the input values.
         */
        extentOfValues(values: D[]): D[];
        protected _getAllIncludedValues(): D[];
        protected _getExtent(): D[];
        /**
         * Adds a callback to be called when the Scale updates.
         *
         * @param {ScaleCallback} callback.
         * @returns {Scale} The calling Scale.
         */
        onUpdate(callback: ScaleCallback<Scale<D, R>>): Scale<D, R>;
        /**
         * Removes a callback that would be called when the Scale updates.
         *
         * @param {ScaleCallback} callback.
         * @returns {Scale} The calling Scale.
         */
        offUpdate(callback: ScaleCallback<Scale<D, R>>): Scale<D, R>;
        protected _dispatchUpdate(): void;
        /**
         * Sets the Scale's domain so that it spans the Extents of all its ExtentsProviders.
         *
         * @returns {Scale} The calling Scale.
         */
        autoDomain(): Scale<D, R>;
        protected _autoDomainIfAutomaticMode(): void;
        /**
         * Computes the range value corresponding to a given domain value.
         *
         * @param {D} value
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
         * @param {D[]} values
         * @returns {Scale} The calling Scale.
         */
        domain(values: D[]): Scale<D, R>;
        protected _getDomain(): void;
        protected _setDomain(values: D[]): void;
        protected _setBackingScaleDomain(values: D[]): void;
        /**
         * Gets the range.
         *
         * @returns {R[]} The current range.
         */
        range(): R[];
        /**
         * Sets the range.
         *
         * @param {R[]} values
         * @returns {Scale} The calling Scale.
         */
        range(values: R[]): Scale<D, R>;
        protected _getRange(): void;
        protected _setRange(values: R[]): void;
        /**
         * Adds an IncludedValuesProvider to the Scale.
         *
         * @param {Scales.IncludedValuesProvider} provider
         * @returns {Sclae} The calling Scale.
         */
        addIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>): Scale<D, R>;
        /**
         * Removes the IncludedValuesProvider from the Scale.
         *
         * @param {Scales.IncludedValuesProvider} provider
         * @returns {Sclae} The calling Scale.
         */
        removeIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>): Scale<D, R>;
    }
}


declare module Plottable {
    class QuantitativeScale<D> extends Scale<D, number> {
        protected static _DEFAULT_NUM_TICKS: number;
        /**
         * A QuantitativeScale is a Scale that maps number-like values to numbers.
         * It is invertible and continuous.
         *
         * @constructor
         */
        constructor();
        autoDomain(): QuantitativeScale<D>;
        protected _autoDomainIfAutomaticMode(): void;
        protected _getExtent(): D[];
        /**
         * Adds a padding exception provider.
         * If one end of the domain is set to an excepted value as a result of autoDomain()-ing,
         * that end of the domain will not be padded.
         *
         * @param {Scales.PaddingExceptionProvider<D>} provider The provider function.
         * @returns {QuantitativeScale} The calling QuantitativeScale.
         */
        addPaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>): QuantitativeScale<D>;
        /**
         * Removes the padding exception provider.
         *
         * @param {Scales.PaddingExceptionProvider<D>} provider The provider function.
         * @returns {QuantitativeScale} The calling QuantitativeScale.
         */
        removePaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>): QuantitativeScale<D>;
        /**
         * Gets the padding proportion.
         */
        padProportion(): number;
        /**
         * Sets the padding porportion.
         * When autoDomain()-ing, the computed domain will be expanded by this proportion,
         * then rounded to human-readable values.
         *
         * @param {number} padProportion The padding proportion. Passing 0 disables padding.
         * @returns {QuantitativeScale} The calling QuantitativeScale.
         */
        padProportion(padProportion: number): QuantitativeScale<D>;
        protected _expandSingleValueDomain(singleValueDomain: D[]): D[];
        /**
         * Computes the domain value corresponding to a supplied range value.
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
         * Gets the array of tick values generated by the default algorithm.
         */
        defaultTicks(): D[];
        /**
         * Gets an array of tick values spanning the domain.
         *
         * @returns {D[]}
         */
        ticks(): D[];
        /**
         * Given a domain, expands its domain onto "nice" values, e.g. whole
         * numbers.
         */
        protected _niceDomain(domain: D[], count?: number): D[];
        protected _defaultExtent(): D[];
        /**
         * Gets the TickGenerator.
         */
        tickGenerator(): Scales.TickGenerators.TickGenerator<D>;
        /**
         * Sets the TickGenerator
         *
         * @param {TickGenerator} generator
         * @return {QuantitativeScale} The calling QuantitativeScale.
         */
        tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): QuantitativeScale<D>;
    }
}


declare module Plottable {
    module Scales {
        class Linear extends QuantitativeScale<number> {
            /**
             * @constructor
             */
            constructor();
            protected _defaultExtent(): number[];
            protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
            scale(value: number): number;
            protected _getDomain(): number[];
            protected _setBackingScaleDomain(values: number[]): void;
            protected _getRange(): number[];
            protected _setRange(values: number[]): void;
            invert(value: number): number;
            defaultTicks(): number[];
            protected _niceDomain(domain: number[], count?: number): number[];
        }
    }
}


declare module Plottable {
    module Scales {
        class ModifiedLog extends QuantitativeScale<number> {
            /**
             * A ModifiedLog Scale acts as a regular log scale for large numbers.
             * As it approaches 0, it gradually becomes linear.
             * Consequently, a ModifiedLog Scale can process 0 and negative numbers.
             *
             * @constructor
             * @param {number} [base=10]
             *        The base of the log. Must be > 1.
             *
             *        For x <= base, scale(x) = log(x).
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
             * Gets whether or not to generate tick values other than powers of the base.
             *
             * @returns {boolean}
             */
            showIntermediateTicks(): boolean;
            /**
             * Sets whether or not to generate ticks values other than powers of the base.
             *
             * @param {boolean} show
             * @returns {ModifiedLog} The calling ModifiedLog Scale.
             */
            showIntermediateTicks(show: boolean): ModifiedLog;
            protected _defaultExtent(): number[];
            protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
            protected _getRange(): number[];
            protected _setRange(values: number[]): void;
            defaultTicks(): number[];
        }
    }
}


declare module Plottable {
    module Scales {
        class Category extends Scale<string, number> {
            /**
             * A Category Scale maps strings to numbers.
             *
             * @constructor
             */
            constructor();
            extentOfValues(values: string[]): string[];
            protected _getExtent(): string[];
            domain(): string[];
            domain(values: string[]): Category;
            protected _setDomain(values: string[]): void;
            range(): [number, number];
            range(values: [number, number]): Category;
            /**
             * Returns the width of the range band.
             *
             * @returns {number} The range band width
             */
            rangeBand(): number;
            /**
             * Returns the step width of the scale.
             *
             * The step width is the pixel distance between adjacent values in the domain.
             *
             * @returns {number}
             */
            stepWidth(): number;
            /**
             * Gets the inner padding.
             *
             * The inner padding is defined as the padding in between bands on the scale,
             * expressed as a multiple of the rangeBand().
             *
             * @returns {number}
             */
            innerPadding(): number;
            /**
             * Sets the inner padding.
             *
             * The inner padding is defined as the padding in between bands on the scale,
             * expressed as a multiple of the rangeBand().
             *
             * @returns {Category} The calling Category Scale.
             */
            innerPadding(innerPadding: number): Category;
            /**
             * Gets the outer padding.
             *
             * The outer padding is the padding in between the outer bands and the edges of the range,
             * expressed as a multiple of the rangeBand().
             *
             * @returns {number}
             */
            outerPadding(): number;
            /**
             * Sets the outer padding.
             *
             * The outer padding is the padding in between the outer bands and the edges of the range,
             * expressed as a multiple of the rangeBand().
             *
             * @returns {Category} The calling Category Scale.
             */
            outerPadding(outerPadding: number): Category;
            scale(value: string): number;
            protected _getDomain(): string[];
            protected _setBackingScaleDomain(values: string[]): void;
            protected _getRange(): number[];
            protected _setRange(values: number[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        class Color extends Scale<string, string> {
            /**
             * A Color Scale maps string values to color hex values expressed as a string.
             *
             * @constructor
             * @param {string} [scaleType] One of "Category10"/"Category20"/"Category20b"/"Category20c".
             *   (see https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors)
             *   If not supplied, reads the colors defined using CSS -- see plottable.css.
             */
            constructor(scaleType?: string);
            extentOfValues(values: string[]): string[];
            protected _getExtent(): string[];
            /**
             * Returns the color-string corresponding to a given string.
             * If there are not enough colors in the range(), a lightened version of an existing color will be used.
             *
             * @param {string} value
             * @returns {string}
             */
            scale(value: string): string;
            protected _getDomain(): string[];
            protected _setBackingScaleDomain(values: string[]): void;
            protected _getRange(): string[];
            protected _setRange(values: string[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        class Time extends QuantitativeScale<Date> {
            /**
             * A Time Scale maps Date objects to numbers.
             *
             * @constructor
             */
            constructor();
            /**
             * Returns an array of ticks values separated by the specified interval.
             *
             * @param {string} interval A string specifying the interval unit.
             * @param {number?} [step] The number of multiples of the interval between consecutive ticks.
             * @return {Date[]}
             */
            tickInterval(interval: string, step?: number): Date[];
            protected _setDomain(values: Date[]): void;
            protected _defaultExtent(): Date[];
            protected _expandSingleValueDomain(singleValueDomain: Date[]): Date[];
            scale(value: Date): number;
            protected _getDomain(): Date[];
            protected _setBackingScaleDomain(values: Date[]): void;
            protected _getRange(): number[];
            protected _setRange(values: number[]): void;
            invert(value: number): Date;
            defaultTicks(): Date[];
            protected _niceDomain(domain: Date[]): Date[];
        }
    }
}


declare module Plottable {
    module Scales {
        class InterpolatedColor extends Scale<number, string> {
            static REDS: string[];
            static BLUES: string[];
            static POSNEG: string[];
            /**
             * An InterpolatedColor Scale maps numbers to color hex values, expressed as strings.
             *
             * @constructor
             * @param {string[]} [colors=InterpolatedColor.REDS] an array of strings representing color hex values
             *   ("#FFFFFF") or keywords ("white").
             * @param {string} [scaleType="linear"] One of "linear"/"log"/"sqrt"/"pow".
             */
            constructor(colorRange?: string[], scaleType?: string);
            extentOfValues(values: number[]): number[];
            /**
             * Gets the color range.
             *
             * @returns {string[]}
             */
            colorRange(): string[];
            /**
             * Sets the color range.
             *
             * @param {string[]} colorRange
             * @returns {InterpolatedColor} The calling InterpolatedColor Scale.
             */
            colorRange(colorRange: string[]): InterpolatedColor;
            autoDomain(): InterpolatedColor;
            scale(value: number): string;
            protected _getDomain(): number[];
            protected _setBackingScaleDomain(values: number[]): void;
            protected _getRange(): string[];
            protected _setRange(values: string[]): void;
        }
    }
}


declare module Plottable {
    module Scales {
        module TickGenerators {
            /**
             * Generates an array of tick values for the specified scale.
             *
             * @param {QuantitativeScale} scale
             * @returns {D[]}
             */
            interface TickGenerator<D> {
                (scale: Plottable.QuantitativeScale<D>): D[];
            }
            /**
             * Creates a TickGenerator using the specified interval.
             *
             * Generates ticks at multiples of the interval while also including the domain boundaries.
             *
             * @param {number} interval
             * @returns {TickGenerator}
             */
            function intervalTickGenerator(interval: number): TickGenerator<number>;
            /**
             * Creates a TickGenerator returns only integer tick values.
             *
             * @returns {TickGenerator}
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
            animator: Animators.Plot;
        };
        type AppliedDrawStep = {
            attrToAppliedProjector: AttributeToAppliedProjector;
            animator: Animators.Plot;
        };
    }
    class Drawer {
        protected _className: string;
        protected _dataset: Dataset;
        /**
         * Constructs a Drawer
         *
         * @constructor
         * @param {Dataset} dataset The dataset associated with this Drawer
         */
        constructor(dataset: Dataset);
        /**
         * Retrieves the renderArea selection for the Drawer.
         */
        renderArea(): d3.Selection<void>;
        /**
         * Sets the renderArea selection for the Drawer.
         *
         * @param {d3.Selection} Selection containing the <g> to render to.
         * @returns {Drawer} The calling Drawer.
         */
        renderArea(area: d3.Selection<void>): Drawer;
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
        protected _drawStep(step: Drawers.AppliedDrawStep): void;
        protected _numberOfAnimationIterations(data: any[]): number;
        /**
         * Draws the data into the renderArea using the spefic steps and metadata
         *
         * @param{any[]} data The data to be drawn
         * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
         */
        draw(data: any[], drawSteps: Drawers.DrawStep[]): number;
        /**
         * Returns the CSS selector for this Drawer's visual elements.
         */
        selector(): string;
        /**
         * Returns the D3 selection corresponding to the datum with the specified index.
         */
        selectionForIndex(index: number): d3.Selection<any>;
    }
}


declare module Plottable {
    module Drawers {
        class Line extends Drawer {
            static PATH_CLASS: string;
            protected _enterData(data: any[]): void;
            renderArea(): d3.Selection<void>;
            renderArea(area: d3.Selection<void>): Drawer;
            protected _numberOfAnimationIterations(data: any[]): number;
            protected _drawStep(step: AppliedDrawStep): void;
            selector(): string;
            selectionForIndex(index: number): d3.Selection<void>;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Area extends Line {
            static PATH_CLASS: string;
            protected _enterData(data: any[]): void;
            renderArea(): d3.Selection<void>;
            renderArea(area: d3.Selection<void>): Drawer;
            protected _drawStep(step: AppliedDrawStep): void;
            selector(): string;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Element extends Drawer {
            protected _svgElement: string;
            protected _drawStep(step: AppliedDrawStep): void;
            protected _enterData(data: any[]): void;
            selector(): string;
        }
    }
}


declare module Plottable {
    module Drawers {
        class Rectangle extends Element {
            constructor(dataset: Dataset);
        }
    }
}


declare module Plottable {
    module Drawers {
        class Arc extends Element {
            constructor(dataset: Dataset);
        }
    }
}


declare module Plottable {
    module Drawers {
        class Symbol extends Element {
            constructor(dataset: Dataset);
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
        protected _element: d3.Selection<void>;
        protected _content: d3.Selection<void>;
        protected _boundingBox: d3.Selection<void>;
        protected _clipPathEnabled: boolean;
        protected _isSetup: boolean;
        protected _isAnchored: boolean;
        /**
         * Attaches the Component as a child of a given d3 Selection.
         *
         * @param {d3.Selection} selection.
         * @returns {Component} The calling Component.
         */
        anchor(selection: d3.Selection<void>): Component;
        /**
         * Adds a callback to be called on anchoring the Component to the DOM.
         * If the Component is already anchored, the callback is called immediately.
         *
         * @param {ComponentCallback} callback
         * @return {Component}
         */
        onAnchor(callback: ComponentCallback): Component;
        /**
         * Removes a callback that would be called on anchoring the Component to the DOM.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback
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
         * Computes and sets the size, position, and alignment of the Component from the specified values.
         * If no parameters are supplied and the Component is a root node,
         * they are inferred from the size of the Component's element.
         *
         * @param {Point} [origin] Origin of the space offered to the Component.
         * @param {number} [availableWidth] Available width in pixels.
         * @param {number} [availableHeight] Available height in pixels.
         * @returns {Component} The calling Component.
         */
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Component;
        protected _getSize(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        /**
         * Queues the Component for rendering.
         *
         * @returns {Component} The calling Component.
         */
        render(): Component;
        renderImmediately(): Component;
        /**
         * Causes the Component to re-layout and render.
         *
         * This function should be called when a CSS change has occured that could
         * influence the layout of the Component, such as changing the font size.
         *
         * @returns {Component} The calling Component.
         */
        redraw(): Component;
        /**
         * Renders the Component to a given <svg>.
         *
         * @param {String|d3.Selection} element A selector-string for the <svg>, or a d3 selection containing an <svg>.
         * @returns {Component} The calling Component.
         */
        renderTo(element: String | d3.Selection<void>): Component;
        /**
         * Gets the x alignment of the Component.
         */
        xAlignment(): string;
        /**
         * Sets the x alignment of the Component.
         *
         * @param {string} xAlignment The x alignment of the Component ("left"/"center"/"right").
         * @returns {Component} The calling Component.
         */
        xAlignment(xAlignment: string): Component;
        /**
         * Gets the y alignment of the Component.
         */
        yAlignment(): string;
        /**
         * Sets the y alignment of the Component.
         *
         * @param {string} yAlignment The y alignment of the Component ("top"/"center"/"bottom").
         * @returns {Component} The calling Component.
         */
        yAlignment(yAlignment: string): Component;
        /**
         * Checks if the Component has a given CSS class.
         *
         * @param {string} cssClass The CSS class to check for.
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
         * Checks if the Component has a fixed width or if it grows to fill available space.
         * Returns false by default on the base Component class.
         */
        fixedWidth(): boolean;
        /**
         * Checks if the Component has a fixed height or if it grows to fill available space.
         * Returns false by default on the base Component class.
         */
        fixedHeight(): boolean;
        /**
         * Detaches a Component from the DOM. The Component can be reused.
         *
         * This should only be used if you plan on reusing the calling Component. Otherwise, use destroy().
         *
         * @returns The calling Component.
         */
        detach(): Component;
        /**
         * Adds a callback to be called when the Component is detach()-ed.
         *
         * @param {ComponentCallback} callback
         * @return {Component} The calling Component.
         */
        onDetach(callback: ComponentCallback): Component;
        /**
         * Removes a callback to be called when the Component is detach()-ed.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback
         * @return {Component} The calling Component.
         */
        offDetach(callback: ComponentCallback): Component;
        parent(): ComponentContainer;
        parent(parent: ComponentContainer): Component;
        /**
         * Removes a Component from the DOM and disconnects all listeners.
         */
        destroy(): void;
        /**
         * Gets the width of the Component in pixels.
         */
        width(): number;
        /**
         * Gets the height of the Component in pixels.
         */
        height(): number;
        /**
         * Gets the origin of the Component relative to its parent.
         *
         * @return {Point}
         */
        origin(): Point;
        /**
         * Gets the origin of the Component relative to the root <svg>.
         *
         * @return {Point}
         */
        originToSVG(): Point;
        /**
         * Gets the Selection containing the <g> in front of the visual elements of the Component.
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {d3.Selection}
         */
        foreground(): d3.Selection<void>;
        /**
         * Gets a Selection containing a <g> that holds the visual elements of the Component.
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {d3.Selection} content selection for the Component
         */
        content(): d3.Selection<void>;
        /**
         * Gets the Selection containing the <g> behind the visual elements of the Component.
         *
         * Will return undefined if the Component has not been anchored.
         *
         * @return {d3.Selection} background selection for the Component
         */
        background(): d3.Selection<void>;
    }
}


declare module Plottable {
    class ComponentContainer extends Component {
        constructor();
        anchor(selection: d3.Selection<void>): ComponentContainer;
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
             * Constructs a Group.
             *
             * A Group contains Components that will be rendered on top of each other.
             * Components added later will be rendered on top of Components already in the Group.
             *
             * @constructor
             * @param {Component[]} [components=[]] Components to be added to the Group.
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
        protected _tickMarkContainer: d3.Selection<void>;
        protected _tickLabelContainer: d3.Selection<void>;
        protected _baseline: d3.Selection<void>;
        protected _scale: Scale<D, number>;
        protected _computedWidth: number;
        protected _computedHeight: number;
        /**
         * Constructs an Axis.
         * An Axis is a visual representation of a Scale.
         *
         * @constructor
         * @param {Scale} scale
         * @param {string} orientation One of "top"/"bottom"/"left"/"right".
         * @param {Formatter} [formatter=Formatters.identity()] Tick values are passed through this Formatter before being displayed.
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
            [key: string]: number;
        };
        protected _generateTickMarkAttrHash(isEndTickMark?: boolean): {
            [key: string]: number | ((d: any) => number);
        };
        redraw(): Component;
        protected _setDefaultAlignment(): void;
        /**
         * Gets the Formatter on the Axis. Tick values are passed through the
         * Formatter before being displayed.
         */
        formatter(): Formatter;
        /**
         * Sets the Formatter on the Axis. Tick values are passed through the
         * Formatter before being displayed.
         *
         * @param {Formatter} formatter
         * @returns {Axis} The calling Axis.
         */
        formatter(formatter: Formatter): Axis<D>;
        /**
         * Gets the tick mark length in pixels.
         */
        tickLength(): number;
        /**
         * Sets the tick mark length in pixels.
         *
         * @param {number} length
         * @returns {Axis} The calling Axis.
         */
        tickLength(length: number): Axis<D>;
        /**
         * Gets the end tick mark length in pixels.
         */
        endTickLength(): number;
        /**
         * Sets the end tick mark length in pixels.
         *
         * @param {number} length
         * @returns {Axis} The calling Axis.
         */
        endTickLength(length: number): Axis<D>;
        protected _maxLabelTickLength(): number;
        /**
         * Gets the padding between each tick mark and its associated label in pixels.
         */
        tickLabelPadding(): number;
        /**
         * Sets the padding between each tick mark and its associated label in pixels.
         *
         * @param {number} padding
         * @returns {Axis} The calling Axis.
         */
        tickLabelPadding(padding: number): Axis<D>;
        /**
         * Gets the size of the gutter in pixels.
         * The gutter is the extra space between the tick labels and the outer edge of the Axis.
         */
        gutter(): number;
        /**
         * Sets the size of the gutter in pixels.
         * The gutter is the extra space between the tick labels and the outer edge of the Axis.
         *
         * @param {number} size
         * @returns {Axis} The calling Axis.
         */
        gutter(size: number): Axis<D>;
        /**
         * Gets the orientation of the Axis.
         */
        orientation(): string;
        /**
         * Sets the orientation of the Axis.
         *
         * @param {number} orientation One of "top"/"bottom"/"left"/"right".
         * @returns {Axis} The calling Axis.
         */
        orientation(orientation: string): Axis<D>;
        /**
         * Gets whether the Axis shows the end tick labels.
         */
        showEndTickLabels(): boolean;
        /**
         * Sets whether the Axis shows the end tick labels.
         *
         * @param {boolean} show
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
         * Defines a configuration for a Time Axis tier.
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
             * The CSS class applied to each Time Axis tier
             */
            static TIME_AXIS_TIER_CLASS: string;
            /**
             * Constructs a Time Axis.
             *
             * A Time Axis is a visual representation of a Time Scale.
             *
             * @constructor
             * @param {Scales.Time} scale
             * @param {string} orientation One of "top"/"bottom".
             */
            constructor(scale: Scales.Time, orientation: string);
            /**
             * Gets the label positions for each tier.
             */
            tierLabelPositions(): string[];
            /**
             * Sets the label positions for each tier.
             *
             * @param {string[]} newPositions The positions for each tier. "bottom" and "center" are the only supported values.
             * @returns {Axes.Time} The calling Time Axis.
             */
            tierLabelPositions(newPositions: string[]): Time;
            /**
             * Gets the possible TimeAxisConfigurations.
             */
            axisConfigurations(): TimeAxisConfiguration[];
            /**
             * Sets the possible TimeAxisConfigurations.
             * The Time Axis will choose the most precise configuration that will display in the available space.
             *
             * @param {TimeAxisConfiguration[]} configurations
             * @returns {Axes.Time} The calling Time Axis.
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
             * Constructs a Numeric Axis.
             *
             * A Numeric Axis is a visual representation of a QuantitativeScale.
             *
             * @constructor
             * @param {QuantitativeScale} scale
             * @param {string} orientation One of "top"/"bottom"/"left"/"right".
             * @param {Formatter} [formatter=Formatters.general()] Tick values are passed through this Formatter before being displayed.
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
             * @param {string} position "top"/"center"/"bottom" for a vertical Numeric Axis,
             *                          "left"/"center"/"right" for a horizontal Numeric Axis.
             * @returns {Numeric} The calling Numeric Axis.
             */
            tickLabelPosition(position: string): Numeric;
        }
    }
}


declare module Plottable {
    module Axes {
        class Category extends Axis<string> {
            /**
             * Constructs a Category Axis.
             *
             * A Category Axis is a visual representation of a Category Scale.
             *
             * @constructor
             * @param {Scales.Category} scale
             * @param {string} [orientation="bottom"] One of "top"/"bottom"/"left"/"right".
             * @param {Formatter} [formatter=Formatters.identity()]
             */
            constructor(scale: Scales.Category, orientation: string, formatter?: (d: any) => string);
            protected _setup(): void;
            protected _rescale(): Component;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            protected _getTickValues(): string[];
            /**
             * Gets the tick label angle in degrees.
             */
            tickLabelAngle(): number;
            /**
             * Sets the tick label angle in degrees.
             * Right now only -90/0/90 are supported. 0 is horizontal.
             *
             * @param {number} angle
             * @returns {Category} The calling Category Axis.
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
             * A Label is a Component that displays a single line of text.
             *
             * @constructor
             * @param {string} [displayText=""] The text of the Label.
             * @param {number} [angle=0] The angle of the Label in degrees (-90/0/90). 0 is horizontal.
             */
            constructor(displayText?: string, angle?: number);
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            protected _setup(): void;
            /**
             * Gets the Label's text.
             */
            text(): string;
            /**
             * Sets the Label's text.
             *
             * @param {string} displayText
             * @returns {Label} The calling Label.
             */
            text(displayText: string): Label;
            /**
             * Gets the angle of the Label in degrees.
             */
            angle(): number;
            /**
             * Sets the angle of the Label in degrees.
             *
             * @param {number} angle One of -90/0/90. 0 is horizontal.
             * @returns {Label} The calling Label.
             */
            angle(angle: number): Label;
            /**
             * Gets the amount of padding around the Label in pixels.
             */
            padding(): number;
            /**
             * Sets the amount of padding around the Label in pixels.
             *
             * @param {number} padAmount
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
             * @constructor
             * @param {string} [text]
             * @param {number} [angle] One of -90/0/90. 0 is horizontal.
             */
            constructor(text?: string, angle?: number);
        }
        class AxisLabel extends Label {
            static AXIS_LABEL_CLASS: string;
            /**
             * @constructor
             * @param {string} [text]
             * @param {number} [angle] One of -90/0/90. 0 is horizontal.
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
             * The Legend consists of a series of entries, each with a color and label taken from the Color Scale.
             *
             * @constructor
             * @param {Scale.Color} scale
             */
            constructor(scale: Scales.Color);
            protected _setup(): void;
            /**
             * Gets the maximum number of entries per row.
             *
             * @returns {number}
             */
            maxEntriesPerRow(): number;
            /**
             * Sets the maximum number of entries perrow.
             *
             * @param {number} numEntries
             * @returns {Legend} The calling Legend.
             */
            maxEntriesPerRow(numEntries: number): Legend;
            /**
             * Gets the current comparator for the Legend's entries.
             *
             * @returns {(a: string, b: string) => number}
             */
            comparator(): (a: string, b: string) => number;
            /**
             * Sets a new comparator for the Legend's entries.
             * The comparator is used to set the display order of the entries.
             *
             * @param {(a: string, b: string) => number} comparator
             * @returns {Legend} The calling Legend.
             */
            comparator(comparator: (a: string, b: string) => number): Legend;
            /**
             * Gets the Color Scale.
             *
             * @returns {Scales.Color}
             */
            scale(): Scales.Color;
            /**
             * Sets the Color Scale.
             *
             * @param {Scales.Color} scale
             * @returns {Legend} The calling Legend.
             */
            scale(scale: Scales.Color): Legend;
            destroy(): void;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            /**
             * Gets the entry under at given pixel position.
             * Returns an empty Selection if no entry exists at that pixel position.
             *
             * @param {Point} position
             * @returns {d3.Selection}
             */
            getEntry(position: Point): d3.Selection<void>;
            renderImmediately(): Legend;
            /**
             * Gets the SymbolFactory accessor of the Legend.
             * The accessor determines the symbol for each entry.
             *
             * @returns {(datum: any, index: number) => symbolFactory}
             */
            symbolFactoryAccessor(): (datum: any, index: number) => SymbolFactory;
            /**
             * Sets the SymbolFactory accessor of the Legend.
             * The accessor determines the symbol for each entry.
             *
             * @param {(datum: any, index: number) => symbolFactory} symbolFactoryAccessor
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
             * The InterpolatedColorLegend consists of a sequence of swatches that show the
             * associated InterpolatedColor Scale sampled at various points.
             * Two labels show the maximum and minimum values of the InterpolatedColor Scale.
             *
             * @constructor
             * @param {Scales.InterpolatedColor} interpolatedColorScale
             * @param {string} [orientation="horizontal"] One of "horizontal"/"left"/"right".
             * @param {Formatter} [formatter=Formatters.general()] The Formatter for the labels.
             */
            constructor(interpolatedColorScale: Scales.InterpolatedColor, orientation?: string, formatter?: (d: any) => string);
            destroy(): void;
            /**
             * Gets the Formatter for the labels.
             */
            formatter(): Formatter;
            /**
             * Sets the Formatter for the labels.
             *
             * @param {Formatter} formatter
             * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
             */
            formatter(formatter: Formatter): InterpolatedColorLegend;
            /**
             * Gets the orientation.
             */
            orientation(): string;
            /**
             * Sets the orientation.
             *
             * @param {string} orientation One of "horizontal"/"left"/"right".
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
             * @constructor
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
             * A Table combines Components in the form of a grid. A
             * common case is combining a y-axis, x-axis, and the plotted data via
             * ```typescript
             * new Table([[yAxis, plot],
             *            [null,  xAxis]]);
             * ```
             *
             * @constructor
             * @param {Component[][]} [rows=[]] A 2-D array of Components to be added to the Table.
             *   null can be used if a cell is empty.
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
             * @param {number} row
             * @param {number} col
             * @returns {Table} The calling Table.
             */
            add(component: Component, row: number, col: number): Table;
            protected _remove(component: Component): boolean;
            requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Table;
            /**
             * Gets the padding above and below each row in pixels.
             */
            rowPadding(): number;
            /**
             * Sets the padding above and below each row in pixels.
             *
             * @param {number} rowPadding
             * @returns {Table} The calling Table.
             */
            rowPadding(rowPadding: number): Table;
            /**
             * Gets the padding to the left and right of each column in pixels.
             */
            columnPadding(): number;
            /**
             * Sets the padding to the left and right of each column in pixels.
             *
             * @param {number} columnPadding
             * @returns {Table} The calling Table.
             */
            columnPadding(columnPadding: number): Table;
            /**
             * Gets the weight of the specified row.
             *
             * @param {number} index
             */
            rowWeight(index: number): number;
            /**
             * Sets the weight of the specified row.
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
             * @param {number} index
             * @param {number} weight
             * @returns {Table} The calling Table.
             */
            rowWeight(index: number, weight: number): Table;
            /**
             * Gets the weight of the specified column.
             *
             * @param {number} index
             */
            columnWeight(index: number): number;
            /**
             * Sets the weight of the specified column.
             * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
             *
             * Please see `rowWeight` docs for an example.
             *
             * @param {number} index
             * @param {number} weight
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
            protected _box: d3.Selection<void>;
            constructor();
            protected _setup(): void;
            protected _getSize(availableWidth: number, availableHeight: number): {
                width: number;
                height: number;
            };
            /**
             * Gets the Bounds of the box.
             */
            bounds(): Bounds;
            /**
             * Sets the Bounds of the box.
             *
             * @param {Bounds} newBounds
             * @return {SelectionBoxLayer} The calling SelectionBoxLayer.
             */
            bounds(newBounds: Bounds): SelectionBoxLayer;
            protected _setBounds(newBounds: Bounds): void;
            renderImmediately(): SelectionBoxLayer;
            /**
             * Gets whether the box is being shown.
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
        type Entity = {
            datum: any;
            index: number;
            dataset: Dataset;
            position: Point;
            selection: d3.Selection<any>;
            plot: Plot;
        };
        interface AccessorScaleBinding<D, R> {
            accessor: Accessor<any>;
            scale?: Scale<D, R>;
        }
        module Animator {
            var MAIN: string;
            var RESET: string;
        }
    }
    class Plot extends Component {
        protected _dataChanged: boolean;
        protected _datasetToDrawer: Utils.Map<Dataset, Drawer>;
        protected _renderArea: d3.Selection<void>;
        protected _attrBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
        protected _attrExtents: d3.Map<any[]>;
        protected _animate: boolean;
        protected _animateOnNextRender: boolean;
        protected _propertyExtents: d3.Map<any[]>;
        protected _propertyBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
        /**
         * @constructor
         */
        constructor();
        anchor(selection: d3.Selection<void>): Plot;
        protected _setup(): void;
        destroy(): void;
        /**
         * Adds a Dataset to the Plot.
         *
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        addDataset(dataset: Dataset): Plot;
        protected _createNodesForDataset(dataset: Dataset): Drawer;
        protected _getDrawer(dataset: Dataset): Drawer;
        protected _getAnimator(key: string): Animators.Plot;
        protected _onDatasetUpdate(): void;
        /**
         * Gets the AccessorScaleBinding for a particular attribute.
         *
         * @param {string} attr
         */
        attr<A>(attr: string): Plots.AccessorScaleBinding<A, number | string>;
        /**
         * Sets a particular attribute to a constant value or the result of an Accessor.
         *
         * @param {string} attr
         * @param {number|string|Accessor<number>|Accessor<string>} attrValue
         * @returns {Plot} The calling Plot.
         */
        attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): Plot;
        /**
         * Sets a particular attribute to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the attribute values when autoDomain()-ing.
         *
         * @param {string} attr
         * @param {A|Accessor<A>} attrValue
         * @param {Scale<A, number | string>} scale The Scale used to scale the attrValue.
         * @returns {Plot} The calling Plot.
         */
        attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): Plot;
        protected _bindProperty(property: string, value: any, scale: Scale<any, any>): void;
        protected _generateAttrToProjector(): AttributeToProjector;
        renderImmediately(): Plot;
        /**
         * Returns whether the plot will be animated.
         */
        animated(): boolean;
        /**
         * Enables or disables animation.
         */
        animated(willAnimate: boolean): Plot;
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
         * Get the Animator associated with the specified Animator key.
         *
         * @return {Animators.Plot}
         */
        animator(animatorKey: string): Animators.Plot;
        /**
         * Set the Animator associated with the specified Animator key.
         *
         * @param {string} animatorKey
         * @param {Animators.Plot} animator
         * @returns {Plot} The calling Plot.
         */
        animator(animatorKey: string, animator: Animators.Plot): Plot;
        /**
         * Removes a Dataset from the Plot.
         *
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        removeDataset(dataset: Dataset): Plot;
        protected _removeDatasetNodes(dataset: Dataset): void;
        datasets(): Dataset[];
        datasets(datasets: Dataset[]): Plot;
        protected _getDrawersInOrder(): Drawer[];
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _additionalPaint(time: number): void;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        /**
         * Retrieves Selections of this Plot for the specified Datasets.
         *
         * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
         *   If not provided, Selections will be retrieved for all Datasets on the Plot.
         * @returns {d3.Selection}
         */
        getAllSelections(datasets?: Dataset[]): d3.Selection<any>;
        /**
         * Gets the Entities associated with the specified Datasets.
         *
         * @param {dataset[]} datasets The Datasets to retrieve the Entities for.
         *   If not provided, returns defaults to all Datasets on the Plot.
         * @return {Plots.Entity[]}
         */
        entities(datasets?: Dataset[]): Plots.Entity[];
        /**
         * Returns the Entity nearest to the query point by the Euclidian norm, or undefined if no Entity can be found.
         *
         * @param {Point} queryPoint
         * @returns {Plots.Entity} The nearest Entity, or undefined if no Entity can be found.
         */
        entityNearest(queryPoint: Point): Plots.Entity;
        protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: d3.Selection<void>): boolean;
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _propertyProjectors(): AttributeToProjector;
        protected static _scaledAccessor<D, R>(binding: Plots.AccessorScaleBinding<D, R>): Accessor<any>;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
    }
}


declare module Plottable {
    module Plots {
        class Pie extends Plot {
            /**
             * @constructor
             */
            constructor();
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): Pie;
            addDataset(dataset: Dataset): Pie;
            removeDataset(dataset: Dataset): Pie;
            protected _onDatasetUpdate(): void;
            protected _getDrawer(dataset: Dataset): Drawers.Arc;
            entities(datasets?: Dataset[]): Plots.Entity[];
            /**
             * Gets the AccessorScaleBinding for the sector value.
             */
            sectorValue<S>(): AccessorScaleBinding<S, number>;
            /**
             * Sets the sector value to a constant number or the result of an Accessor<number>.
             *
             * @param {number|Accessor<number>} sectorValue
             * @returns {Pie} The calling Pie Plot.
             */
            sectorValue(sectorValue: number | Accessor<number>): Plots.Pie;
            /**
             * Sets the sector value to a scaled constant value or scaled result of an Accessor.
             * The provided Scale will account for the values when autoDomain()-ing.
             *
             * @param {S|Accessor<S>} sectorValue
             * @param {Scale<S, number>} scale
             * @returns {Pie} The calling Pie Plot.
             */
            sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): Plots.Pie;
            /**
             * Gets the AccessorScaleBinding for the inner radius.
             */
            innerRadius<R>(): AccessorScaleBinding<R, number>;
            /**
             * Sets the inner radius to a constant number or the result of an Accessor<number>.
             *
             * @param {number|Accessor<number>} innerRadius
             * @returns {Pie} The calling Pie Plot.
             */
            innerRadius(innerRadius: number | Accessor<number>): Plots.Pie;
            /**
             * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
             * The provided Scale will account for the values when autoDomain()-ing.
             *
             * @param {R|Accessor<R>} innerRadius
             * @param {Scale<R, number>} scale
             * @returns {Pie} The calling Pie Plot.
             */
            innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
            /**
             * Gets the AccessorScaleBinding for the outer radius.
             */
            outerRadius<R>(): AccessorScaleBinding<R, number>;
            /**
             * Sets the outer radius to a constant number or the result of an Accessor<number>.
             *
             * @param {number|Accessor<number>} outerRadius
             * @returns {Pie} The calling Pie Plot.
             */
            outerRadius(outerRadius: number | Accessor<number>): Plots.Pie;
            /**
             * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
             * The provided Scale will account for the values when autoDomain()-ing.
             *
             * @param {R|Accessor<R>} outerRadius
             * @param {Scale<R, number>} scale
             * @returns {Pie} The calling Pie Plot.
             */
            outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
            protected _propertyProjectors(): AttributeToProjector;
            protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
            protected _pixelPoint(datum: any, index: number, dataset: Dataset): {
                x: number;
                y: number;
            };
        }
    }
}


declare module Plottable {
    class XYPlot<X, Y> extends Plot {
        protected static _X_KEY: string;
        protected static _Y_KEY: string;
        /**
         * An XYPlot is a Plot that displays data along two primary directions, X and Y.
         *
         * @constructor
         * @param {Scale} xScale The x scale to use.
         * @param {Scale} yScale The y scale to use.
         */
        constructor();
        /**
         * Gets the AccessorScaleBinding for X.
         */
        x(): Plots.AccessorScaleBinding<X, number>;
        /**
         * Sets X to a constant number or the result of an Accessor<number>.
         *
         * @param {number|Accessor<number>} x
         * @returns {XYPlot} The calling XYPlot.
         */
        x(x: number | Accessor<number>): XYPlot<X, Y>;
        /**
         * Sets X to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {X|Accessor<X>} x
         * @param {Scale<X, number>} xScale
         * @returns {XYPlot} The calling XYPlot.
         */
        x(x: X | Accessor<X>, xScale: Scale<X, number>): XYPlot<X, Y>;
        /**
         * Gets the AccessorScaleBinding for Y.
         */
        y(): Plots.AccessorScaleBinding<Y, number>;
        /**
         * Sets Y to a constant number or the result of an Accessor<number>.
         *
         * @param {number|Accessor<number>} y
         * @returns {XYPlot} The calling XYPlot.
         */
        y(y: number | Accessor<number>): XYPlot<X, Y>;
        /**
         * Sets Y to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {Y|Accessor<Y>} y
         * @param {Scale<Y, number>} yScale
         * @returns {XYPlot} The calling XYPlot.
         */
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): XYPlot<X, Y>;
        protected _filterForProperty(property: string): (datum: any, index: number, dataset: Dataset) => boolean;
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        destroy(): XYPlot<X, Y>;
        /**
         * Gets the automatic domain adjustment setting for visible points.
         */
        autorange(): string;
        /**
         * Sets the automatic domain adjustment for visible points to operate against the X Scale, Y Scale, or neither.
         * If "x" or "y" is specified the adjustment is immediately performed.
         *
         * @param {string} scaleName One of "x"/"y"/"none".
         *   "x" will adjust the x Scale in relation to changes in the y domain.
         *   "y" will adjust the y Scale in relation to changes in the x domain.
         *   "none" means neither Scale will change automatically.
         * @returns {XYPlot} The calling XYPlot.
         */
        autorange(scaleName: string): XYPlot<X, Y>;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): XYPlot<X, Y>;
        /**
         * Adjusts the domains of both X and Y scales to show all data.
         * This call does not override the autorange() behavior.
         *
         * @returns {XYPlot} The calling XYPlot.
         */
        showAllData(): XYPlot<X, Y>;
        protected _projectorsReady(): boolean;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
    }
}


declare module Plottable {
    module Plots {
        class Rectangle<X, Y> extends XYPlot<X, Y> {
            /**
             * A Rectangle Plot displays rectangles based on the data.
             * The left and right edges of each rectangle can be set with x() and x2().
             *   If only x() is set the Rectangle Plot will attempt to compute the correct left and right edge positions.
             * The top and bottom edges of each rectangle can be set with y() and y2().
             *   If only y() is set the Rectangle Plot will attempt to compute the correct top and bottom edge positions.
             *
             * @constructor
             * @param {Scale.Scale} xScale
             * @param {Scale.Scale} yScale
             */
            constructor();
            protected _getDrawer(dataset: Dataset): Drawers.Rectangle;
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _generateDrawSteps(): Drawers.DrawStep[];
            /**
             * Gets the AccessorScaleBinding for X.
             */
            x(): AccessorScaleBinding<X, number>;
            /**
             * Sets X to a constant number or the result of an Accessor<number>.
             *
             * @param {number|Accessor<number>} x
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            x(x: number | Accessor<number>): Plots.Rectangle<X, Y>;
            /**
             * Sets X to a scaled constant value or scaled result of an Accessor.
             * The provided Scale will account for the values when autoDomain()-ing.
             *
             * @param {X|Accessor<X>} x
             * @param {Scale<X, number>} xScale
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            x(x: X | Accessor<X>, xScale: Scale<X, number>): Plots.Rectangle<X, Y>;
            /**
             * Gets the AccessorScaleBinding for X2.
             */
            x2(): AccessorScaleBinding<X, number>;
            /**
             * Sets X2 to a constant number or the result of an Accessor.
             * If a Scale has been set for X, it will also be used to scale X2.
             *
             * @param {number|Accessor<number>|X|Accessor<X>} x2
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            x2(x2: number | Accessor<number> | X | Accessor<X>): Plots.Rectangle<X, Y>;
            /**
             * Gets the AccessorScaleBinding for Y.
             */
            y(): AccessorScaleBinding<Y, number>;
            /**
             * Sets Y to a constant number or the result of an Accessor<number>.
             *
             * @param {number|Accessor<number>} y
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            y(y: number | Accessor<number>): Plots.Rectangle<X, Y>;
            /**
             * Sets Y to a scaled constant value or scaled result of an Accessor.
             * The provided Scale will account for the values when autoDomain()-ing.
             *
             * @param {Y|Accessor<Y>} y
             * @param {Scale<Y, number>} yScale
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): Plots.Rectangle<X, Y>;
            /**
             * Gets the AccessorScaleBinding for Y2.
             */
            y2(): AccessorScaleBinding<Y, number>;
            /**
             * Sets Y2 to a constant number or the result of an Accessor.
             * If a Scale has been set for Y, it will also be used to scale Y2.
             *
             * @param {number|Accessor<number>|Y|Accessor<Y>} y2
             * @returns {Plots.Rectangle} The calling Rectangle Plot.
             */
            y2(y2: number | Accessor<number> | Y | Accessor<Y>): Plots.Rectangle<X, Y>;
            protected _propertyProjectors(): AttributeToProjector;
            protected _pixelPoint(datum: any, index: number, dataset: Dataset): {
                x: any;
                y: any;
            };
            protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
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
            constructor();
            protected _getDrawer(dataset: Dataset): Drawers.Symbol;
            size<S>(): AccessorScaleBinding<S, number>;
            size(size: number | Accessor<number>): Plots.Scatter<X, Y>;
            size<S>(size: S | Accessor<S>, scale: Scale<S, number>): Plots.Scatter<X, Y>;
            symbol(): AccessorScaleBinding<any, any>;
            symbol(symbol: Accessor<SymbolFactory>): Plots.Scatter<X, Y>;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: d3.Selection<void>): boolean;
            protected _propertyProjectors(): AttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plots {
        class Bar<X, Y> extends XYPlot<X, Y> {
            static ORIENTATION_VERTICAL: string;
            static ORIENTATION_HORIZONTAL: string;
            protected static _DEFAULT_WIDTH: number;
            protected _isVertical: boolean;
            /**
             * @constructor
             * @param {Scale} xScale The x scale to use.
             * @param {Scale} yScale The y scale to use.
             * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
             */
            constructor(orientation?: string);
            x(): Plots.AccessorScaleBinding<X, number>;
            x(x: number | Accessor<number>): Bar<X, Y>;
            x(x: X | Accessor<X>, xScale: Scale<X, number>): Bar<X, Y>;
            y(): Plots.AccessorScaleBinding<Y, number>;
            y(y: number | Accessor<number>): Bar<X, Y>;
            y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): Bar<X, Y>;
            /**
             * Gets the orientation of the plot
             *
             * @return "vertical" | "horizontal"
             */
            orientation(): string;
            protected _getDrawer(dataset: Dataset): Drawers.Rectangle;
            protected _setup(): void;
            /**
             * Gets the baseline value.
             * The baseline is the line that the bars are drawn from.
             *
             * @returns {X|Y}
             */
            baselineValue(): X | Y;
            /**
             * Sets the baseline value.
             * The baseline is the line that the bars are drawn from.
             *
             * @param {X|Y} value
             * @returns {Bar} The calling Bar Plot.
             */
            baselineValue(value: X | Y): Bar<X, Y>;
            /**
             * Get whether bar labels are enabled.
             *
             * @returns {boolean} Whether bars should display labels or not.
             */
            labelsEnabled(): boolean;
            /**
             * Sets whether labels are enabled.
             *
             * @param {boolean} labelsEnabled
             * @returns {Bar} The calling Bar Plot.
             */
            labelsEnabled(enabled: boolean): Bar<X, Y>;
            /**
             * Gets the Formatter for the labels.
             */
            labelFormatter(): Formatter;
            /**
             * Sets the Formatter for the labels.
             *
             * @param {Formatter} formatter
             * @returns {Bar} The calling Bar Plot.
             */
            labelFormatter(formatter: Formatter): Bar<X, Y>;
            protected _createNodesForDataset(dataset: Dataset): Drawer;
            protected _removeDatasetNodes(dataset: Dataset): void;
            /**
             * Returns the Entity nearest to the query point according to the following algorithm:
             *   - If the query point is inside a bar, returns the Entity for that bar.
             *   - Otherwise, gets the nearest Entity by the primary direction (X for vertical, Y for horizontal),
             *     breaking ties with the secondary direction.
             * Returns undefined if no Entity can be found.
             *
             * @param {Point} queryPoint
             * @returns {Plots.Entity} The nearest Entity, or undefined if no Entity can be found.
             */
            entityNearest(queryPoint: Point): Plots.Entity;
            protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: d3.Selection<void>): boolean;
            /**
             * Gets the Entities at a particular Point.
             *
             * @param {Point} p
             * @returns {Entity[]}
             */
            entitiesAt(p: Point): Entity[];
            /**
             * Gets the Entities that intersect the Bounds.
             *
             * @param {Bounds} bounds
             * @returns {Entity[]}
             */
            entitiesIn(bounds: Bounds): Entity[];
            /**
             * Gets the Entities that intersect the area defined by the ranges.
             *
             * @param {Range} xRange
             * @param {Range} yRange
             * @returns {Entity[]}
             */
            entitiesIn(xRange: Range, yRange: Range): Entity[];
            protected _additionalPaint(time: number): void;
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
            entities(datasets?: Dataset[]): Plots.Entity[];
            protected _pixelPoint(datum: any, index: number, dataset: Dataset): {
                x: any;
                y: any;
            };
            protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        }
    }
}


declare module Plottable {
    module Plots {
        class Line<X> extends XYPlot<X, number> {
            /**
             * @constructor
             * @param {QuantitativeScale} xScale
             * @param {QuantitativeScale} yScale
             */
            constructor();
            protected _getDrawer(dataset: Dataset): Drawers.Line;
            protected _getResetYFunction(): (d: any, i: number, dataset: Dataset) => number;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            /**
             * Returns the Entity nearest to the query point by X then by Y, or undefined if no Entity can be found.
             *
             * @param {Point} queryPoint
             * @returns {Plots.Entity} The nearest Entity, or undefined if no Entity can be found.
             */
            entityNearest(queryPoint: Point): Plots.Entity;
            protected _propertyProjectors(): AttributeToProjector;
            protected _constructLineProjector(xProjector: Projector, yProjector: Projector): (datum: any, index: number, dataset: Dataset) => string;
            protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        }
    }
}


declare module Plottable {
    module Plots {
        class Area<X> extends Line<X> {
            /**
             * An Area Plot draws a filled region (area) between Y and Y0.
             *
             * @constructor
             * @param {QuantitativeScale} xScale
             * @param {QuantitativeScale} yScale
             */
            constructor();
            protected _setup(): void;
            y(): Plots.AccessorScaleBinding<number, number>;
            y(y: number | Accessor<number>): Area<X>;
            y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): Area<X>;
            /**
             * Gets the AccessorScaleBinding for Y0.
             */
            y0(): Plots.AccessorScaleBinding<number, number>;
            /**
             * Sets Y0 to a constant number or the result of an Accessor<number>.
             * If a Scale has been set for Y, it will also be used to scale Y0.
             *
             * @param {number|Accessor<number>} y0
             * @returns {Area} The calling Area Plot.
             */
            y0(y0: number | Accessor<number>): Area<X>;
            protected _onDatasetUpdate(): void;
            addDataset(dataset: Dataset): Area<X>;
            protected _removeDatasetNodes(dataset: Dataset): void;
            protected _additionalPaint(): void;
            protected _getDrawer(dataset: Dataset): Drawers.Area;
            protected _generateDrawSteps(): Drawers.DrawStep[];
            protected _updateYScale(): void;
            protected _getResetYFunction(): Accessor<any>;
            protected _propertyProjectors(): AttributeToProjector;
            getAllSelections(datasets?: Dataset[]): d3.Selection<any>;
            protected _constructAreaProjector(xProjector: Projector, yProjector: Projector, y0Projector: Projector): (datum: any[], index: number, dataset: Dataset) => string;
        }
    }
}


declare module Plottable {
    module Plots {
        class ClusteredBar<X, Y> extends Bar<X, Y> {
            /**
             * A ClusteredBar Plot groups bars across Datasets based on the primary value of the bars.
             *   On a vertical ClusteredBar Plot, the bars with the same X value are grouped.
             *   On a horizontal ClusteredBar Plot, the bars with the same Y value are grouped.
             *
             * @constructor
             * @param {Scale} xScale
             * @param {Scale} yScale
             * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
             */
            constructor(orientation?: string);
            protected _generateAttrToProjector(): {
                [attrToSet: string]: (datum: any, index: number, dataset: Dataset) => any;
            };
            protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        }
    }
}


declare module Plottable {
    module Plots {
        class StackedArea<X> extends Area<X> {
            /**
             * @constructor
             * @param {QuantitativeScale} xScale
             * @param {QuantitativeScale} yScale
             */
            constructor();
            protected _getAnimator(key: string): Animators.Plot;
            protected _setup(): void;
            x(): Plots.AccessorScaleBinding<X, number>;
            x(x: number | Accessor<number>): StackedArea<X>;
            x(x: X | Accessor<X>, xScale: Scale<X, number>): StackedArea<X>;
            y(): Plots.AccessorScaleBinding<number, number>;
            y(y: number | Accessor<number>): StackedArea<X>;
            y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): StackedArea<X>;
            protected _additionalPaint(): void;
            protected _updateYScale(): void;
            protected _onDatasetUpdate(): StackedArea<X>;
            protected _wholeDatumAttributes(): string[];
            protected _updateExtentsForProperty(property: string): void;
            protected _extentsForProperty(attr: string): any[];
            protected _propertyProjectors(): AttributeToProjector;
            protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
        }
    }
}


declare module Plottable {
    module Plots {
        class StackedBar<X, Y> extends Bar<X, Y> {
            /**
             * A StackedBar Plot stacks bars across Datasets based on the primary value of the bars.
             *   On a vertical StackedBar Plot, the bars with the same X value are stacked.
             *   On a horizontal StackedBar Plot, the bars with the same Y value are stacked.
             *
             * @constructor
             * @param {Scale} xScale
             * @param {Scale} yScale
             * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
             */
            constructor(orientation?: string);
            protected _getAnimator(key: string): Animators.Plot;
            x(): Plots.AccessorScaleBinding<X, number>;
            x(x: number | Accessor<number>): StackedBar<X, Y>;
            x(x: X | Accessor<X>, xScale: Scale<X, number>): StackedBar<X, Y>;
            y(): Plots.AccessorScaleBinding<Y, number>;
            y(y: number | Accessor<number>): StackedBar<X, Y>;
            y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): StackedBar<X, Y>;
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
        interface Plot {
            /**
             * Applies the supplied attributes to a d3.Selection with some animation.
             *
             * @param {d3.Selection} selection The update selection or transition selection that we wish to animate.
             * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
             *     AppliedProjectors that we will use to set attributes on the selection.
             * @return {any} Animators should return the selection or
             *     transition object so that plots may chain the transitions between
             *     animators.
             */
            animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any>;
            /**
             * Given the number of elements, return the total time the animation requires
             *
             * @param {number} numberofIterations The number of elements that will be drawn
             * @returns {number}
             */
            totalTime(numberOfIterations: number): number;
        }
        type PlotAnimatorMap = {
            [animatorKey: string]: Plot;
        };
    }
}


declare module Plottable {
    module Animators {
        /**
         * An animator implementation with no animation. The attributes are
         * immediately set on the selection.
         */
        class Null implements Animators.Plot {
            totalTime(selection: any): number;
            animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any>;
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
        class Base implements Animators.Plot {
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
            totalTime(numberOfIterations: number): number;
            animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Transition<any>;
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
            animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Transition<any>;
            protected _startMovingProjector(attrToAppliedProjector: AttributeToAppliedProjector): (datum: any, index: number) => any;
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
            protected _startMovingProjector(attrToAppliedProjector: AttributeToAppliedProjector): () => number;
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
             * Get a Mouse Dispatcher for the <svg> containing elem.
             * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
             *
             * @param {SVGElement} elem
             * @return {Dispatchers.Mouse}
             */
            static getDispatcher(elem: SVGElement): Dispatchers.Mouse;
            /**
             * This constructor not be invoked directly.
             *
             * @constructor
             * @param {SVGElement} svg The root <svg> to attach to.
             */
            constructor(svg: SVGElement);
            /**
             * Registers a callback to be called when the mouse position changes.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            onMouseMove(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Removes a callback that would be called when the mouse position changes.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            offMouseMove(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called when a mousedown occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            onMouseDown(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Removes a callback that would be called when a mousedown occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            offMouseDown(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called when a mouseup occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            onMouseUp(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Removes a callback that would be called when a mouseup occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            offMouseUp(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called when a wheel event occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            onWheel(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Removes a callback that would be called when a wheel event occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            offWheel(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Registers a callback to be called when a dblClick occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            onDblClick(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Removes a callback that would be called when a dblClick occurs.
             *
             * @param {MouseCallback} callback
             * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
             */
            offDblClick(callback: MouseCallback): Dispatchers.Mouse;
            /**
             * Returns the last computed mouse position in <svg> coordinate space.
             *
             * @return {Point}
             */
            lastMousePosition(): {
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
             * Gets a Touch Dispatcher for the <svg> containing elem.
             * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
             *
             * @param {SVGElement} elem
             * @return {Dispatchers.Touch}
             */
            static getDispatcher(elem: SVGElement): Dispatchers.Touch;
            /**
             * This constructor should not be invoked directly.
             *
             * @constructor
             * @param {SVGElement} svg The root <svg> to attach to.
             */
            constructor(svg: SVGElement);
            /**
             * Registers a callback to be called when a touch starts.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            onTouchStart(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes a callback that would be called when a touch starts.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            offTouchStart(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called when the touch position changes.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            onTouchMove(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes a callback that would be called when the touch position changes.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            offTouchMove(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called when a touch ends.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            onTouchEnd(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes a callback that would be called when a touch ends.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            offTouchEnd(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Registers a callback to be called when a touch is cancelled.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
             */
            onTouchCancel(callback: TouchCallback): Dispatchers.Touch;
            /**
             * Removes a callback that would be called when a touch is cancelled.
             *
             * @param {TouchCallback} callback
             * @return {Dispatchers.Touch} The calling Touch Dispatcher.
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
             * Gets a Key Dispatcher. If one already exists it will be returned;
             * otherwise, a new one will be created.
             *
             * @return {Dispatchers.Key}
             */
            static getDispatcher(): Dispatchers.Key;
            /**
             * This constructor should not be invoked directly.
             *
             * @constructor
             */
            constructor();
            /**
             * Registers a callback to be called whenever a key is pressed.
             *
             * @param {KeyCallback} callback
             * @return {Dispatchers.Key} The calling Key Dispatcher.
             */
            onKeyDown(callback: KeyCallback): Key;
            /**
             * Removes the callback to be called whenever a key is pressed.
             *
             * @param {KeyCallback} callback
             * @return {Dispatchers.Key} The calling Key Dispatcher.
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
         * Attaches this Interaction to a Component.
         * If the Interaction was already attached to a Component, it first detaches itself from the old Component.
         *
         * @param {Component} component
         * @returns {Interaction} The calling Interaction.
         */
        attachTo(component: Component): Interaction;
        /**
         * Detaches this Interaction from the Component.
         * This Interaction can be reused.
         *
         * @param {Component} component
         * @returns {Interaction} The calling Interaction.
         */
        detachFrom(component: Component): Interaction;
        /**
         * Translates an <svg>-coordinate-space point to Component-space coordinates.
         *
         * @param {Point} p A Point in <svg>-space coordinates.
         * @return {Point} The same location in Component-space coordinates.
         */
        protected _translateToComponentSpace(p: Point): Point;
        /**
         * Checks whether a Component-coordinate-space Point is inside the Component.
         *
         * @param {Point} p A Point in Compoennt-space coordinates.
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
             * Adds a callback to be called when the Component is clicked.
             *
             * @param {ClickCallback} callback
             * @return {Interactions.Click} The calling Click Interaction.
             */
            onClick(callback: ClickCallback): Click;
            /**
             * Removes a callback that would be called when the Component is clicked.
             *
             * @param {ClickCallback} callback
             * @return {Interactions.Click} The calling Click Interaction.
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
             * Adds a callback to be called when the Component is double-clicked.
             *
             * @param {ClickCallback} callback
             * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
             */
            onDoubleClick(callback: ClickCallback): DoubleClick;
            /**
             * Removes a callback that would be called when the Component is double-clicked.
             *
             * @param {ClickCallback} callback
             * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
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
             * Adds a callback to be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
             */
            onKey(keyCode: number, callback: KeyCallback): Key;
            /**
             * Removes a callback that would be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
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
             * Adds a callback to be called when the pointer enters the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
             */
            onPointerEnter(callback: PointerCallback): Pointer;
            /**
             * Removes a callback that would be called when the pointer enters the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
             */
            offPointerEnter(callback: PointerCallback): Pointer;
            /**
             * Adds a callback to be called when the pointer moves within the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
             */
            onPointerMove(callback: PointerCallback): Pointer;
            /**
             * Removes a callback that would be called when the pointer moves within the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
             */
            offPointerMove(callback: PointerCallback): Pointer;
            /**
             * Adds a callback to be called when the pointer exits the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
             */
            onPointerExit(callback: PointerCallback): Pointer;
            /**
             * Removes a callback that would be called when the pointer exits the Component.
             *
             * @param {PointerCallback} callback
             * @return {Interactions.Pointer} The calling Pointer Interaction.
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
             * A PanZoom Interaction updates the domains of an x-scale and/or a y-scale
             * in response to the user panning or zooming.
             *
             * @constructor
             * @param {QuantitativeScale} [xScale] The x-scale to update on panning/zooming.
             * @param {QuantitativeScale} [yScale] The y-scale to update on panning/zooming.
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
             * Gets whether the Drag Interaction constrains Points passed to its
             * callbacks to lie inside its Component.
             *
             * If true, when the user drags outside of the Component, the closest Point
             * inside the Component will be passed to the callback instead of the actual
             * cursor position.
             *
             * @return {boolean}
             */
            constrainToComponent(): boolean;
            /**
             * Sets whether the Drag Interaction constrains Points passed to its
             * callbacks to lie inside its Component.
             *
             * If true, when the user drags outside of the Component, the closest Point
             * inside the Component will be passed to the callback instead of the actual
             * cursor position.
             *
             * @param {boolean}
             * @return {Interactions.Drag} The calling Drag Interaction.
             */
            constrainToComponent(constrain: boolean): Drag;
            /**
             * Adds a callback to be called when dragging starts.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
             */
            onDragStart(callback: DragCallback): Drag;
            /**
             * Removes a callback that would be called when dragging starts.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
             */
            offDragStart(callback: DragCallback): Drag;
            /**
             * Adds a callback to be called during dragging.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
             */
            onDrag(callback: DragCallback): Drag;
            /**
             * Removes a callback that would be called during dragging.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
             */
            offDrag(callback: DragCallback): Drag;
            /**
             * Adds a callback to be called when dragging ends.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
             */
            onDragEnd(callback: DragCallback): Drag;
            /**
             * Removes a callback that would be called when dragging ends.
             *
             * @param {DragCallback} callback
             * @returns {Drag} The calling Drag Interaction.
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
            /**
             * Constructs a DragBoxLayer.
             *
             * A DragBoxLayer is a SelectionBoxLayer with a built-in Drag Interaction.
             * A drag gesture will set the Bounds of the box.
             * If resizing is enabled using resizable(true), the edges of box can be repositioned.
             *
             * @constructor
             */
            constructor();
            protected _setup(): void;
            renderImmediately(): DragBoxLayer;
            /**
             * Gets the detection radius of the drag box in pixels.
             */
            detectionRadius(): number;
            /**
             * Sets the detection radius of the drag box in pixels.
             *
             * @param {number} r
             * @return {DragBoxLayer} The calling DragBoxLayer.
             */
            detectionRadius(r: number): DragBoxLayer;
            /**
             * Gets whether or not the drag box is resizable.
             */
            resizable(): boolean;
            /**
             * Sets whether or not the drag box is resizable.
             *
             * @param {boolean} canResize
             * @return {DragBoxLayer} The calling DragBoxLayer.
             */
            resizable(canResize: boolean): DragBoxLayer;
            protected _setResizableClasses(canResize: boolean): void;
            /**
             * Sets the callback to be called when dragging starts.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDragStart(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called when dragging starts.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDragStart(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Sets a callback to be called during dragging.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDrag(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called during dragging.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDrag(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Sets a callback to be called when dragging ends.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            onDragEnd(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Removes a callback to be called when dragging ends.
             *
             * @param {DragBoxCallback} callback
             * @returns {DragBoxLayer} The calling DragBoxLayer.
             */
            offDragEnd(callback: DragBoxCallback): DragBoxLayer;
            /**
             * Gets the internal Interactions.Drag of the DragBoxLayer.
             */
            dragInteraction(): Interactions.Drag;
        }
    }
}


declare module Plottable {
    module Components {
        class XDragBoxLayer extends DragBoxLayer {
            /**
             * An XDragBoxLayer is a DragBoxLayer whose size can only be set in the X-direction.
             * The y-values of the bounds() are always set to 0 and the height() of the XDragBoxLayer.
             *
             * @constructor
             */
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
            /**
             * A YDragBoxLayer is a DragBoxLayer whose size can only be set in the Y-direction.
             * The x-values of the bounds() are always set to 0 and the width() of the YDragBoxLayer.
             *
             * @constructor
             */
            constructor();
            computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): YDragBoxLayer;
            protected _setBounds(newBounds: Bounds): void;
            protected _setResizableClasses(canResize: boolean): void;
        }
    }
}
