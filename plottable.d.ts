declare namespace Plottable.Utils.Math {
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
    /**
     * Generates an array of consecutive, strictly increasing numbers
     * in the range [start, stop) separeted by step
     */
    function range(start: number, stop: number, step?: number): number[];
    /**
     * Returns the square of the distance between two points
     *
     * @param {Point} p1
     * @param {Point} p2
     * @return {number} dist(p1, p2)^2
     */
    function distanceSquared(p1: Point, p2: Point): number;
    function degreesToRadians(degree: number): number;
}
declare namespace Plottable.Utils {
    /**
     * Shim for ES6 map.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
     */
    class Map<K, V> {
        private _keyValuePairs;
        private _es6Map;
        constructor();
        set(key: K, value: V): this;
        get(key: K): V;
        has(key: K): boolean;
        forEach(callbackFn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
        delete(key: K): boolean;
    }
}
declare namespace Plottable.Utils {
    /**
     * Shim for ES6 set.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
     */
    class Set<T> {
        size: number;
        private _values;
        private _es6Set;
        constructor();
        add(value: T): this;
        delete(value: T): boolean;
        has(value: T): boolean;
        forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    }
}
declare namespace Plottable.Utils.DOM {
    /**
     * Gets the bounding box of an element.
     * @param {d3.Selection} element
     * @returns {SVGRed} The bounding box.
     */
    function elementBBox(element: d3.Selection<any>): SVGRect;
    /**
     * Screen refresh rate which is assumed to be 60fps
     */
    var SCREEN_REFRESH_RATE_MILLISECONDS: number;
    /**
     * Polyfill for `window.requestAnimationFrame`.
     * If the function exists, then we use the function directly.
     * Otherwise, we set a timeout on `SCREEN_REFRESH_RATE_MILLISECONDS` and then perform the function.
     *
     * @param {() => void} callback The callback to call in the next animation frame
     */
    function requestAnimationFramePolyfill(callback: () => void): void;
    /**
     * Calculates the width of the element.
     * The width includes the padding and the border on the element's left and right sides.
     *
     * @param {Element} element The element to query
     * @returns {number} The width of the element.
     */
    function elementWidth(element: Element): number;
    /**
     * Calculates the height of the element.
     * The height includes the padding the and the border on the element's top and bottom sides.
     *
     * @param {Element} element The element to query
     * @returns {number} The height of the element
     */
    function elementHeight(element: Element): number;
    /**
     * Retrieves the number array representing the translation for the selection
     *
     * @param {d3.Selection<any>} selection The selection to query
     * @returns {[number, number]} The number array representing the translation
     */
    function translate(selection: d3.Selection<any>): [number, number];
    /**
     * Translates the given selection by the input x / y pixel amounts.
     *
     * @param {d3.Selection<any>} selection The selection to translate
     * @param {number} x The amount to translate in the x direction
     * @param {number} y The amount to translate in the y direction
     * @returns {d3.Selection<any>} The input selection
     */
    function translate(selection: d3.Selection<any>, x: number, y: number): d3.Selection<any>;
    /**
     * Checks if the first ClientRect overlaps the second.
     *
     * @param {ClientRect} clientRectA The first ClientRect
     * @param {ClientRect} clientRectB The second ClientRect
     * @returns {boolean} If the ClientRects overlap each other.
     */
    function clientRectsOverlap(clientRectA: ClientRect, clientRectB: ClientRect): boolean;
    /**
     * Returns true if and only if innerClientRect is inside outerClientRect.
     *
     * @param {ClientRect} innerClientRect The first ClientRect
     * @param {ClientRect} outerClientRect The second ClientRect
     * @returns {boolean} If and only if the innerClientRect is inside outerClientRect.
     */
    function clientRectInside(innerClientRect: ClientRect, outerClientRect: ClientRect): boolean;
    /**
     * Retrieves the bounding svg of the input element
     *
     * @param {SVGElement} element The element to query
     * @returns {SVGElement} The bounding svg
     */
    function boundingSVG(element: SVGElement): SVGElement;
    /**
     * Generates a ClipPath ID that is unique for this instance of Plottable
     */
    function generateUniqueClipPathId(): string;
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
declare namespace Plottable.Utils.Color {
    /**
     * Return contrast ratio between two colors
     * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under BSD)
     * chroma.js may be found here: https://github.com/gka/chroma.js
     * License may be found here: https://github.com/gka/chroma.js/blob/master/LICENSE
     * see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     */
    function contrast(a: string, b: string): number;
    /**
     * Returns a brighter copy of this color. Each channel is multiplied by 0.7 ^ -factor.
     * Channel values are capped at the maximum value of 255, and the minimum value of 30.
     */
    function lightenColor(color: string, factor: number): string;
    /**
     * Gets the Hex Code of the color resulting by applying the className CSS class to the
     * colorTester selection. Returns null if the tester is transparent.
     *
     * @param {d3.Selection<void>} colorTester The d3 selection to apply the CSS class to
     * @param {string} className The name of the class to be applied
     * @return {string} The hex code of the computed color
     */
    function colorTest(colorTester: d3.Selection<void>, className: string): string;
}
declare namespace Plottable.Utils.Array {
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
declare namespace Plottable.Utils {
    /**
     * A set of callbacks which can be all invoked at once.
     * Each callback exists at most once in the set (based on reference equality).
     * All callbacks should have the same signature.
     */
    class CallbackSet<CB extends Function> extends Set<CB> {
        callCallbacks(...args: any[]): this;
    }
}
declare namespace Plottable.Utils.Stacking {
    type StackedDatum = {
        value: number;
        offset: number;
    };
    type StackingResult = Utils.Map<Dataset, Utils.Map<string, StackedDatum>>;
    /**
     * Computes the StackingResult (value and offset) for each data point in each Dataset.
     *
     * @param {Dataset[]} datasets The Datasets to be stacked on top of each other in the order of stacking
     * @param {Accessor<any>} keyAccessor Accessor for the key of the data
     * @param {Accessor<number>} valueAccessor Accessor for the value of the data
     * @return {StackingResult} value and offset for each datapoint in each Dataset
     */
    function stack(datasets: Dataset[], keyAccessor: Accessor<any>, valueAccessor: Accessor<number>): StackingResult;
    /**
     * Computes the total extent over all data points in all Datasets, taking stacking into consideration.
     *
     * @param {StackingResult} stackingResult The value and offset information for each datapoint in each dataset
     * @oaram {Accessor<any>} keyAccessor Accessor for the key of the data existent in the stackingResult
     * @param {Accessor<boolean>} filter A filter for data to be considered when computing the total extent
     * @return {[number, number]} The total extent
     */
    function stackedExtent(stackingResult: StackingResult, keyAccessor: Accessor<any>, filter: Accessor<boolean>): number[];
    /**
     * Normalizes a key used for stacking
     *
     * @param {any} key The key to be normalized
     * @return {string} The stringified key
     */
    function normalizeKey(key: any): string;
}
declare namespace Plottable.Utils.Window {
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
     * Sends a deprecation warning to the console. The warning includes the name of the deprecated method,
     * version number of the deprecation, and an optional message.
     *
     * To be used in the first line of a deprecated method.
     *
     * @param {string} callingMethod The name of the method being deprecated
     * @param {string} version The version when the tagged method became obsolete
     * @param {string?} message Optional message to be shown with the warning
     */
    function deprecated(callingMethod: string, version: string, message?: string): void;
}
declare namespace Plottable.Utils {
    class ClientToSVGTranslator {
        private static _TRANSLATOR_KEY;
        private _svg;
        private _measureRect;
        /**
         * Returns the ClientToSVGTranslator for the <svg> containing elem.
         * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
         */
        static getTranslator(elem: SVGElement): ClientToSVGTranslator;
        constructor(svg: SVGElement);
        /**
         * Computes the position relative to the <svg> in svg-coordinate-space.
         */
        computePosition(clientX: number, clientY: number): Point;
        /**
         * Checks whether event happened inside <svg> element.
         */
        insideSVG(e: Event): boolean;
    }
}
declare namespace Plottable.Configs {
    /**
     * Specifies if Plottable should show warnings.
     */
    var SHOW_WARNINGS: boolean;
    /**
     * Specifies if Plottable should add <title> elements to text.
     */
    var ADD_TITLE_ELEMENTS: boolean;
}
declare namespace Plottable {
    var version: string;
}
declare namespace Plottable {
    type DatasetCallback = (dataset: Dataset) => void;
    class Dataset {
        private _data;
        private _metadata;
        private _callbacks;
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
        onUpdate(callback: DatasetCallback): this;
        /**
         * Removes a callback that would be called when the Dataset updates.
         *
         * @param {DatasetCallback} callback
         * @returns {Dataset} The calling Dataset.
         */
        offUpdate(callback: DatasetCallback): this;
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
        data(data: any[]): this;
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
        metadata(metadata: any): this;
    }
}
declare namespace Plottable.RenderPolicies {
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
        private _timeoutMsec;
        render(): void;
    }
}
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
declare namespace Plottable.RenderController {
    namespace Policy {
        var IMMEDIATE: string;
        var ANIMATION_FRAME: string;
        var TIMEOUT: string;
    }
    function renderPolicy(): RenderPolicies.RenderPolicy;
    function renderPolicy(renderPolicy: string): void;
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
declare namespace Plottable {
    /**
     * Accesses a specific datum property.
     */
    interface Accessor<T> {
        (datum: any, index: number, dataset: Dataset): T;
    }
    /**
     * Retrieves a scaled datum property.
     * Essentially passes the result of an Accessor through a Scale.
     */
    type Projector = (datum: any, index: number, dataset: Dataset) => any;
    /**
     * A mapping from attributes ("x", "fill", etc.) to the functions that get
     * that information out of the data.
     */
    type AttributeToProjector = {
        [attr: string]: Projector;
    };
    /**
     * A function that generates attribute values from the datum and index.
     * Essentially a Projector with a particular Dataset rolled in.
     */
    type AppliedProjector = (datum: any, index: number) => any;
    /**
     * A mapping from attributes to the AppliedProjectors used to generate them.
     */
    type AttributeToAppliedProjector = {
        [attr: string]: AppliedProjector;
    };
    /**
     * Space request used during layout negotiation.
     *
     * @member {number} minWidth The minimum acceptable width given the offered space.
     * @member {number} minHeight the minimum acceptable height given the offered space.
     */
    type SpaceRequest = {
        minWidth: number;
        minHeight: number;
    };
    /**
     * Min and max values for a particular property.
     */
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
    /**
     * An object representing a data-backed visual entity inside a Component.
     */
    interface Entity<C extends Component> {
        datum: any;
        position: Point;
        selection: d3.Selection<any>;
        component: C;
    }
}
declare namespace Plottable {
    type Formatter = (d: any) => string;
}
declare namespace Plottable.Formatters {
    /**
     * Creates a formatter for currency values.
     *
     * @param {number} [precision] The number of decimal places to show (default 2).
     * @param {string} [symbol] The currency symbol to use (default "$").
     * @param {boolean} [prefix] Whether to prepend or append the currency symbol (default true).
     *
     * @returns {Formatter} A formatter for currency values.
     */
    function currency(precision?: number, symbol?: string, prefix?: boolean): (d: any) => string;
    /**
     * Creates a formatter that displays exactly [precision] decimal places.
     *
     * @param {number} [precision] The number of decimal places to show (default 3).
     *
     * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
     */
    function fixed(precision?: number): (d: any) => string;
    /**
     * Creates a formatter that formats numbers to show no more than
     * [maxNumberOfDecimalPlaces] decimal places. All other values are stringified.
     *
     * @param {number} [maxNumberOfDecimalPlaces] The number of decimal places to show (default 3).
     *
     * @returns {Formatter} A formatter for general values.
     */
    function general(maxNumberOfDecimalPlaces?: number): (d: any) => string;
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
     *
     * @returns {Formatter} A formatter for percentage values.
     */
    function percentage(precision?: number): (d: any) => string;
    /**
     * Creates a formatter for values that displays [numberOfSignificantFigures] significant figures
     * and puts SI notation.
     *
     * @param {number} [numberOfSignificantFigures] The number of significant figures to show (default 3).
     *
     * @returns {Formatter} A formatter for SI values.
     */
    function siSuffix(numberOfSignificantFigures?: number): (d: any) => string;
    /**
     * Creates a formatter for values that displays abbreviated values
     * and uses standard short scale suffixes
     * - K - thousands - 10 ^ 3
     * - M - millions - 10 ^ 6
     * - B - billions - 10 ^ 9
     * - T - trillions - 10 ^ 12
     * - Q - quadrillions - 10 ^ 15
     *
     * Numbers with a magnitude outside of (10 ^ (-precision), 10 ^ 15) are shown using
     * scientific notation to avoid creating extremely long decimal strings.
     *
     * @param {number} [precision] the number of decimal places to show (default 3)
     * @returns {Formatter} A formatter with short scale formatting
     */
    function shortScale(precision?: number): (num: number) => string;
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
}
declare namespace Plottable {
    /**
     * A SymbolFactory is a function that takes in a symbolSize which is the edge length of the render area
     * and returns a string representing the 'd' attribute of the resultant 'path' element
     */
    type SymbolFactory = (symbolSize: number) => string;
}
declare namespace Plottable.SymbolFactories {
    function circle(): SymbolFactory;
    function square(): SymbolFactory;
    function cross(): SymbolFactory;
    function diamond(): SymbolFactory;
    function triangleUp(): SymbolFactory;
    function triangleDown(): SymbolFactory;
}
declare namespace Plottable.Scales {
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
declare namespace Plottable {
    interface ScaleCallback<S extends Scale<any, any>> {
        (scale: S): any;
    }
    class Scale<D, R> {
        private _callbacks;
        private _autoDomainAutomatically;
        private _domainModificationInProgress;
        private _includedValuesProviders;
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
        onUpdate(callback: ScaleCallback<this>): this;
        /**
         * Removes a callback that would be called when the Scale updates.
         *
         * @param {ScaleCallback} callback.
         * @returns {Scale} The calling Scale.
         */
        offUpdate(callback: ScaleCallback<this>): this;
        protected _dispatchUpdate(): void;
        /**
         * Sets the Scale's domain so that it spans the Extents of all its ExtentsProviders.
         *
         * @returns {Scale} The calling Scale.
         */
        autoDomain(): this;
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
        domain(values: D[]): this;
        protected _getDomain(): D[];
        protected _setDomain(values: D[]): void;
        protected _backingScaleDomain(): D[];
        protected _backingScaleDomain(values: D[]): this;
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
        range(values: R[]): this;
        protected _getRange(): R[];
        protected _setRange(values: R[]): void;
        /**
         * Adds an IncludedValuesProvider to the Scale.
         *
         * @param {Scales.IncludedValuesProvider} provider
         * @returns {Scale} The calling Scale.
         */
        addIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>): this;
        /**
         * Removes the IncludedValuesProvider from the Scale.
         *
         * @param {Scales.IncludedValuesProvider} provider
         * @returns {Scale} The calling Scale.
         */
        removeIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>): this;
    }
}
declare namespace Plottable {
    class QuantitativeScale<D> extends Scale<D, number> {
        protected static _DEFAULT_NUM_TICKS: number;
        private _tickGenerator;
        private _padProportion;
        private _paddingExceptionsProviders;
        private _domainMin;
        private _domainMax;
        private _snappingDomainEnabled;
        /**
         * A QuantitativeScale is a Scale that maps number-like values to numbers.
         * It is invertible and continuous.
         *
         * @constructor
         */
        constructor();
        autoDomain(): this;
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
        addPaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>): this;
        /**
         * Removes the padding exception provider.
         *
         * @param {Scales.PaddingExceptionProvider<D>} provider The provider function.
         * @returns {QuantitativeScale} The calling QuantitativeScale.
         */
        removePaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>): this;
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
        padProportion(padProportion: number): this;
        private _padDomain(domain);
        /**
         * Gets whether or not the scale snaps its domain to nice values.
         */
        snappingDomainEnabled(): boolean;
        /**
         * Sets whether or not the scale snaps its domain to nice values.
         */
        snappingDomainEnabled(snappingDomainEnabled: boolean): this;
        protected _expandSingleValueDomain(singleValueDomain: D[]): D[];
        /**
         * Computes the domain value corresponding to a supplied range value.
         *
         * @param {number} value: A value from the Scale's range.
         * @returns {D} The domain value corresponding to the supplied range value.
         */
        invert(value: number): D;
        domain(): D[];
        domain(values: D[]): this;
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
        domainMin(domainMin: D): this;
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
        domainMax(domainMax: D): this;
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
        tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): this;
    }
}
declare namespace Plottable.Scales {
    class Linear extends QuantitativeScale<number> {
        private _d3Scale;
        /**
         * @constructor
         */
        constructor();
        protected _defaultExtent(): number[];
        protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
        scale(value: number): number;
        protected _getDomain(): number[];
        protected _backingScaleDomain(): number[];
        protected _backingScaleDomain(values: number[]): this;
        protected _getRange(): number[];
        protected _setRange(values: number[]): void;
        invert(value: number): number;
        defaultTicks(): number[];
        protected _niceDomain(domain: number[], count?: number): number[];
    }
}
declare namespace Plottable.Scales {
    class ModifiedLog extends QuantitativeScale<number> {
        private _base;
        private _d3Scale;
        private _pivot;
        private _untransformedDomain;
        /**
         * A ModifiedLog Scale acts as a regular log scale for large numbers.
         * As it approaches 0, it gradually becomes linear.
         * Consequently, a ModifiedLog Scale can process 0 and negative numbers.
         *
         * For x >= base, scale(x) = log(x).
         *
         * For 0 < x < base, scale(x) will become more and more
         * linear as it approaches 0.
         *
         * At x == 0, scale(x) == 0.
         *
         * For negative values, scale(-x) = -scale(x).
         *
         * The range and domain for the scale should also be set, using the
         * range() and domain() accessors, respectively.
         *
         * For `range`, provide a two-element array giving the minimum and
         * maximum of values produced when scaling.
         *
         * For `domain` provide a two-element array giving the minimum and
         * maximum of the values that will be scaled.
         *
         * @constructor
         * @param {number} [base=10]
         *        The base of the log. Must be > 1.
         *
         */
        constructor(base?: number);
        /**
         * Returns an adjusted log10 value for graphing purposes.  The first
         * adjustment is that negative values are changed to positive during
         * the calculations, and then the answer is negated at the end.  The
         * second is that, for values less than 10, an increasingly large
         * (0 to 1) scaling factor is added such that at 0 the value is
         * adjusted to 1, resulting in a returned result of 0.
         */
        private _adjustedLog(x);
        private _invertedAdjustedLog(x);
        scale(x: number): number;
        invert(x: number): number;
        protected _getDomain(): number[];
        protected _setDomain(values: number[]): void;
        protected _backingScaleDomain(): number[];
        protected _backingScaleDomain(values: number[]): this;
        ticks(): number[];
        /**
         * Return an appropriate number of ticks from lower to upper.
         *
         * This will first try to fit as many powers of this.base as it can from
         * lower to upper.
         *
         * If it still has ticks after that, it will generate ticks in "clusters",
         * e.g. [20, 30, ... 90, 100] would be a cluster, [200, 300, ... 900, 1000]
         * would be another cluster.
         *
         * This function will generate clusters as large as it can while not
         * drastically exceeding its number of ticks.
         */
        private _logTicks(lower, upper);
        /**
         * How many ticks does the range [lower, upper] deserve?
         *
         * e.g. if your domain was [10, 1000] and I asked _howManyTicks(10, 100),
         * I would get 1/2 of the ticks. The range 10, 100 takes up 1/2 of the
         * distance when plotted.
         */
        private _howManyTicks(lower, upper);
        protected _niceDomain(domain: number[], count?: number): number[];
        protected _defaultExtent(): number[];
        protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
        protected _getRange(): number[];
        protected _setRange(values: number[]): void;
        defaultTicks(): number[];
    }
}
declare namespace Plottable.Scales {
    class Category extends Scale<string, number> {
        private _d3Scale;
        private _range;
        private _innerPadding;
        private _outerPadding;
        /**
         * A Category Scale maps strings to numbers.
         *
         * @constructor
         */
        constructor();
        extentOfValues(values: string[]): string[];
        protected _getExtent(): string[];
        domain(): string[];
        domain(values: string[]): this;
        range(): [number, number];
        range(values: [number, number]): this;
        private static _convertToPlottableInnerPadding(d3InnerPadding);
        private static _convertToPlottableOuterPadding(d3OuterPadding, d3InnerPadding);
        private _setBands();
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
        innerPadding(innerPadding: number): this;
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
        outerPadding(outerPadding: number): this;
        scale(value: string): number;
        protected _getDomain(): string[];
        protected _backingScaleDomain(): string[];
        protected _backingScaleDomain(values: string[]): this;
        protected _getRange(): number[];
        protected _setRange(values: number[]): void;
    }
}
declare namespace Plottable.Scales {
    class Color extends Scale<string, string> {
        private static _LOOP_LIGHTEN_FACTOR;
        private static _MAXIMUM_COLORS_FROM_CSS;
        private static _plottableColorCache;
        private _d3Scale;
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
        static invalidateColorCache(): void;
        private static _getPlottableColors();
        /**
         * Returns the color-string corresponding to a given string.
         * If there are not enough colors in the range(), a lightened version of an existing color will be used.
         *
         * @param {string} value
         * @returns {string}
         */
        scale(value: string): string;
        protected _getDomain(): string[];
        protected _backingScaleDomain(): string[];
        protected _backingScaleDomain(values: string[]): this;
        protected _getRange(): string[];
        protected _setRange(values: string[]): void;
    }
}
declare namespace Plottable.Scales {
    class Time extends QuantitativeScale<Date> {
        private _d3Scale;
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
        protected _backingScaleDomain(): Date[];
        protected _backingScaleDomain(values: Date[]): this;
        protected _getRange(): number[];
        protected _setRange(values: number[]): void;
        invert(value: number): Date;
        defaultTicks(): Date[];
        protected _niceDomain(domain: Date[]): Date[];
        /**
         * Transforms the Plottable TimeInterval string into a d3 time interval equivalent.
         * If the provided TimeInterval is incorrect, the default is d3.time.year
         */
        static timeIntervalToD3Time(timeInterval: string): d3.time.Interval;
    }
}
declare namespace Plottable.Scales {
    class InterpolatedColor extends Scale<number, string> {
        static REDS: string[];
        static BLUES: string[];
        static POSNEG: string[];
        private _colorRange;
        private _colorScale;
        private _d3Scale;
        /**
         * An InterpolatedColor Scale maps numbers to color hex values, expressed as strings.
         *
         * @param {string} [scaleType="linear"] One of "linear"/"log"/"sqrt"/"pow".
         */
        constructor(scaleType?: string);
        extentOfValues(values: number[]): number[];
        /**
         * Generates the converted QuantitativeScale.
         */
        private _d3InterpolatedScale();
        /**
         * Generates the d3 interpolator for colors.
         */
        private _interpolateColors();
        private _resetScale();
        autoDomain(): this;
        scale(value: number): string;
        protected _getDomain(): number[];
        protected _backingScaleDomain(): number[];
        protected _backingScaleDomain(values: number[]): this;
        protected _getRange(): string[];
        protected _setRange(range: string[]): void;
    }
}
declare namespace Plottable.Scales.TickGenerators {
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
declare namespace Plottable {
    namespace Drawers {
        /**
         * A step for the drawer to draw.
         *
         * Specifies how AttributeToProjector needs to be animated.
         */
        type DrawStep = {
            attrToProjector: AttributeToProjector;
            animator: Animator;
        };
        /**
         * A DrawStep that carries an AttributeToAppliedProjector map.
         */
        type AppliedDrawStep = {
            attrToAppliedProjector: AttributeToAppliedProjector;
            animator: Animator;
        };
    }
    class Drawer {
        private _renderArea;
        protected _svgElementName: string;
        protected _className: string;
        private _dataset;
        private _cachedSelectionValid;
        private _cachedSelection;
        /**
         * A Drawer draws svg elements based on the input Dataset.
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
        renderArea(area: d3.Selection<void>): this;
        /**
         * Removes the Drawer and its renderArea
         */
        remove(): void;
        /**
         * Binds data to selection
         *
         * @param{any[]} data The data to be drawn
         */
        private _bindSelectionData(data);
        protected _applyDefaultAttributes(selection: d3.Selection<any>): void;
        /**
         * Draws data using one step
         *
         * @param{AppliedDrawStep} step The step, how data should be drawn.
         */
        private _drawStep(step);
        private _appliedProjectors(attrToProjector);
        /**
         * Calculates the total time it takes to use the input drawSteps to draw the input data
         *
         * @param {any[]} data The data that would have been drawn
         * @param {Drawers.DrawStep[]} drawSteps The DrawSteps to use
         * @returns {number} The total time it takes to draw
         */
        totalDrawTime(data: any[], drawSteps: Drawers.DrawStep[]): number;
        /**
         * Draws the data into the renderArea using the spefic steps and metadata
         *
         * @param{any[]} data The data to be drawn
         * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
         */
        draw(data: any[], drawSteps: Drawers.DrawStep[]): this;
        selection(): d3.Selection<any>;
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
declare namespace Plottable.Drawers {
    class Line extends Drawer {
        constructor(dataset: Dataset);
        protected _applyDefaultAttributes(selection: d3.Selection<any>): void;
        selectionForIndex(index: number): d3.Selection<any>;
    }
}
declare namespace Plottable.Drawers {
    class Area extends Drawer {
        constructor(dataset: Dataset);
        protected _applyDefaultAttributes(selection: d3.Selection<any>): void;
        selectionForIndex(index: number): d3.Selection<any>;
    }
}
declare namespace Plottable.Drawers {
    class Rectangle extends Drawer {
        constructor(dataset: Dataset);
    }
}
declare namespace Plottable.Drawers {
    class Arc extends Drawer {
        constructor(dataset: Dataset);
        protected _applyDefaultAttributes(selection: d3.Selection<any>): void;
    }
}
declare namespace Plottable.Drawers {
    class ArcOutline extends Drawer {
        constructor(dataset: Dataset);
        protected _applyDefaultAttributes(selection: d3.Selection<any>): void;
    }
}
declare namespace Plottable.Drawers {
    class Symbol extends Drawer {
        constructor(dataset: Dataset);
    }
}
declare namespace Plottable.Drawers {
    class Segment extends Drawer {
        constructor(dataset: Dataset);
    }
}
declare namespace Plottable {
    type ComponentCallback = (component: Component) => void;
    namespace Components {
        class Alignment {
            static TOP: string;
            static BOTTOM: string;
            static LEFT: string;
            static RIGHT: string;
            static CENTER: string;
        }
    }
    class Component {
        private _element;
        private _content;
        protected _boundingBox: d3.Selection<void>;
        private _backgroundContainer;
        private _foregroundContainer;
        protected _clipPathEnabled: boolean;
        private _origin;
        private _parent;
        private _xAlignment;
        private static _xAlignToProportion;
        private _yAlignment;
        private static _yAlignToProportion;
        protected _isSetup: boolean;
        protected _isAnchored: boolean;
        private _boxes;
        private _boxContainer;
        private _rootSVG;
        private _isTopLevelComponent;
        private _width;
        private _height;
        private _cssClasses;
        private _destroyed;
        private _clipPathID;
        private _onAnchorCallbacks;
        private _onDetachCallbacks;
        private static _SAFARI_EVENT_BACKING_CLASS;
        constructor();
        /**
         * Attaches the Component as a child of a given d3 Selection.
         *
         * @param {d3.Selection} selection.
         * @returns {Component} The calling Component.
         */
        anchor(selection: d3.Selection<void>): this;
        /**
         * Adds a callback to be called on anchoring the Component to the DOM.
         * If the Component is already anchored, the callback is called immediately.
         *
         * @param {ComponentCallback} callback
         * @return {Component}
         */
        onAnchor(callback: ComponentCallback): this;
        /**
         * Removes a callback that would be called on anchoring the Component to the DOM.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback
         * @return {Component}
         */
        offAnchor(callback: ComponentCallback): this;
        /**
         * Creates additional elements as necessary for the Component to function.
         * Called during anchor() if the Component's element has not been created yet.
         * Override in subclasses to provide additional functionality.
         */
        protected _setup(): void;
        /**
         * Given available space in pixels, returns the minimum width and height this Component will need.
         *
         * @param {number} availableWidth
         * @param {number} availableHeight
         * @returns {SpaceRequest}
         */
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
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        /**
         * Queues the Component for rendering.
         *
         * @returns {Component} The calling Component.
         */
        render(): this;
        private _scheduleComputeLayout();
        /**
         * Renders the Component without waiting for the next frame.
         */
        renderImmediately(): this;
        /**
         * Causes the Component to re-layout and render.
         *
         * This function should be called when a CSS change has occured that could
         * influence the layout of the Component, such as changing the font size.
         *
         * @returns {Component} The calling Component.
         */
        redraw(): this;
        /**
         * Renders the Component to a given <svg>.
         *
         * @param {String|d3.Selection} element A selector-string for the <svg>, or a d3 selection containing an <svg>.
         * @returns {Component} The calling Component.
         */
        renderTo(element: String | Element | d3.Selection<void>): this;
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
        xAlignment(xAlignment: string): this;
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
        yAlignment(yAlignment: string): this;
        private _addBox(className?, parentElement?);
        private _generateClipPath();
        private _updateClipPath();
        /**
         * Checks if the Component has a given CSS class.
         *
         * @param {string} cssClass The CSS class to check for.
         */
        hasClass(cssClass: string): boolean;
        /**
         * Adds a given CSS class to the Component.
         *
         * @param {string} cssClass The CSS class to add.
         * @returns {Component} The calling Component.
         */
        addClass(cssClass: string): this;
        /**
         * Removes a given CSS class from the Component.
         *
         * @param {string} cssClass The CSS class to remove.
         * @returns {Component} The calling Component.
         */
        removeClass(cssClass: string): this;
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
        detach(): this;
        /**
         * Adds a callback to be called when the Component is detach()-ed.
         *
         * @param {ComponentCallback} callback
         * @return {Component} The calling Component.
         */
        onDetach(callback: ComponentCallback): this;
        /**
         * Removes a callback to be called when the Component is detach()-ed.
         * The callback is identified by reference equality.
         *
         * @param {ComponentCallback} callback
         * @return {Component} The calling Component.
         */
        offDetach(callback: ComponentCallback): this;
        /**
         * Gets the parent ComponentContainer for this Component.
         */
        parent(): ComponentContainer;
        /**
         * Sets the parent ComponentContainer for this Component.
         * An error will be thrown if the parent does not contain this Component.
         * Adding a Component to a ComponentContainer should be done
         * using the appropriate method on the ComponentContainer.
         */
        parent(parent: ComponentContainer): this;
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
declare namespace Plottable {
    class ComponentContainer extends Component {
        private _detachCallback;
        constructor();
        anchor(selection: d3.Selection<void>): this;
        render(): this;
        /**
         * Checks whether the specified Component is in the ComponentContainer.
         */
        has(component: Component): boolean;
        protected _adoptAndAnchor(component: Component): void;
        /**
         * Removes the specified Component from the ComponentContainer.
         */
        remove(component: Component): this;
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
declare namespace Plottable.Components {
    class Group extends ComponentContainer {
        private _components;
        /**
         * Constructs a Group.
         *
         * A Group contains Components that will be rendered on top of each other.
         * Components added later will be rendered above Components already in the Group.
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
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        /**
         * @return {Component[]} The Components in this Group.
         */
        components(): Component[];
        /**
         * Adds a Component to this Group.
         * The added Component will be rendered above Components already in the Group.
         */
        append(component: Component): this;
        protected _remove(component: Component): boolean;
    }
}
declare namespace Plottable.Components {
    class PlotGroup extends Group {
        entityNearest(point: Point): Plots.PlotEntity;
        /**
         * Adds a Plot to this Plot Group.
         * The added Plot will be rendered above Plots already in the Group.
         */
        append(plot: Plot): this;
    }
}
declare namespace Plottable {
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
        /**
         * The css class applied to each annotation line, which extends from the axis to the rect.
         */
        static ANNOTATION_LINE_CLASS: string;
        /**
         * The css class applied to each annotation rect, which surrounds the annotation label.
         */
        static ANNOTATION_RECT_CLASS: string;
        /**
         * The css class applied to each annotation circle, which denotes which tick is being annotated.
         */
        static ANNOTATION_CIRCLE_CLASS: string;
        /**
         * The css class applied to each annotation label, which shows the formatted annotation text.
         */
        static ANNOTATION_LABEL_CLASS: string;
        private static _ANNOTATION_LABEL_PADDING;
        protected _tickMarkContainer: d3.Selection<void>;
        protected _tickLabelContainer: d3.Selection<void>;
        protected _baseline: d3.Selection<void>;
        protected _scale: Scale<D, number>;
        private _formatter;
        private _orientation;
        private _endTickLength;
        private _innerTickLength;
        private _tickLabelPadding;
        private _margin;
        private _showEndTickLabels;
        private _rescaleCallback;
        private _annotatedTicks;
        private _annotationFormatter;
        private _annotationsEnabled;
        private _annotationTierCount;
        private _annotationContainer;
        private _annotationMeasurer;
        private _annotationWriter;
        /**
         * Constructs an Axis.
         * An Axis is a visual representation of a Scale.
         *
         * @constructor
         * @param {Scale} scale
         * @param {string} orientation One of "top"/"bottom"/"left"/"right".
         */
        constructor(scale: Scale<D, number>, orientation: string);
        destroy(): void;
        protected _isHorizontal(): boolean;
        protected _computeWidth(): number;
        protected _computeHeight(): number;
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        fixedHeight(): boolean;
        fixedWidth(): boolean;
        protected _rescale(): void;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        protected _setup(): void;
        protected _getTickValues(): D[];
        renderImmediately(): this;
        /**
         * Gets the annotated ticks.
         */
        annotatedTicks(): D[];
        /**
         * Sets the annotated ticks.
         *
         * @returns {Axis} The calling Axis.
         */
        annotatedTicks(annotatedTicks: D[]): this;
        /**
         * Gets the Formatter for the annotations.
         */
        annotationFormatter(): Formatter;
        /**
         * Sets the Formatter for the annotations.
         *
         * @returns {Axis} The calling Axis.
         */
        annotationFormatter(annotationFormatter: Formatter): this;
        /**
         * Gets if annotations are enabled.
         */
        annotationsEnabled(): boolean;
        /**
         * Sets if annotations are enabled.
         *
         * @returns {Axis} The calling Axis.
         */
        annotationsEnabled(annotationsEnabled: boolean): this;
        /**
         * Gets the count of annotation tiers to render.
         */
        annotationTierCount(): number;
        /**
         * Sets the count of annotation tiers to render.
         *
         * @returns {Axis} The calling Axis.
         */
        annotationTierCount(annotationTierCount: number): this;
        protected _drawAnnotations(): void;
        private _annotatedTicksToRender();
        /**
         * Retrieves the size of the core pieces.
         *
         * The core pieces include the labels, the end tick marks, the inner tick marks, and the tick label padding.
         */
        protected _coreSize(): number;
        protected _annotationTierHeight(): number;
        private _annotationToTier(measurements);
        protected _removeAnnotations(): void;
        protected _generateBaselineAttrHash(): {
            [key: string]: number;
        };
        protected _generateTickMarkAttrHash(isEndTickMark?: boolean): {
            [key: string]: number | ((d: any) => number);
        };
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
        formatter(formatter: Formatter): this;
        /**
         * Gets the tick mark length in pixels.
         */
        innerTickLength(): number;
        /**
         * Sets the tick mark length in pixels.
         *
         * @param {number} length
         * @returns {Axis} The calling Axis.
         */
        innerTickLength(length: number): this;
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
        endTickLength(length: number): this;
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
        tickLabelPadding(padding: number): this;
        /**
         * Gets the margin in pixels.
         * The margin is the amount of space between the tick labels and the outer edge of the Axis.
         * The margin also determines the space that annotations will reside in if annotations are enabled.
         */
        margin(): number;
        /**
         * Sets the margin in pixels.
         * The margin is the amount of space between the tick labels and the outer edge of the Axis.
         * The margin also determines the space that annotations will reside in if annotations are enabled.
         *
         * @param {number} size
         * @returns {Axis} The calling Axis.
         */
        margin(size: number): this;
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
        orientation(orientation: string): this;
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
        showEndTickLabels(show: boolean): this;
    }
}
declare namespace Plottable {
    namespace TimeInterval {
        var second: string;
        var minute: string;
        var hour: string;
        var day: string;
        var week: string;
        var month: string;
        var year: string;
    }
}
declare namespace Plottable.Axes {
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
        private static _DEFAULT_TIME_AXIS_CONFIGURATIONS;
        private _tierLabelContainers;
        private _tierMarkContainers;
        private _tierBaselines;
        private _tierHeights;
        private _possibleTimeAxisConfigurations;
        private _numTiers;
        private _measurer;
        private _mostPreciseConfigIndex;
        private _tierLabelPositions;
        private static _LONG_DATE;
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
        tierLabelPositions(newPositions: string[]): this;
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
        axisConfigurations(configurations: TimeAxisConfiguration[]): this;
        /**
         * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
         */
        private _getMostPreciseConfigurationIndex();
        orientation(): string;
        orientation(orientation: string): this;
        protected _computeHeight(): number;
        private _getIntervalLength(config);
        private _maxWidthForInterval(config);
        /**
         * Check if tier configuration fits in the current width.
         */
        private _checkTimeAxisTierConfigurationWidth(config);
        protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        protected _setup(): void;
        private _setupDomElements();
        private _getTickIntervalValues(config);
        protected _getTickValues(): any[];
        private _cleanTiers();
        private _getTickValuesForConfiguration(config);
        private _renderTierLabels(container, config, index);
        private _renderTickMarks(tickValues, index);
        private _renderLabellessTickMarks(tickValues);
        private _generateLabellessTicks();
        renderImmediately(): this;
        private _hideOverflowingTiers();
        private _hideOverlappingAndCutOffLabels(index);
    }
}
declare namespace Plottable.Axes {
    class Numeric extends Axis<number> {
        private _tickLabelPositioning;
        private _usesTextWidthApproximation;
        private _measurer;
        private _wrapper;
        /**
         * Constructs a Numeric Axis.
         *
         * A Numeric Axis is a visual representation of a QuantitativeScale.
         *
         * @constructor
         * @param {QuantitativeScale} scale
         * @param {string} orientation One of "top"/"bottom"/"left"/"right".
         */
        constructor(scale: QuantitativeScale<number>, orientation: string);
        protected _setup(): void;
        protected _computeWidth(): number;
        private _computeExactTextWidth();
        private _computeApproximateTextWidth();
        protected _computeHeight(): number;
        protected _getTickValues(): number[];
        protected _rescale(): void;
        renderImmediately(): this;
        private _showAllTickMarks();
        /**
         * Hides the Tick Marks which have no corresponding Tick Labels
         */
        private _hideTickMarksWithoutLabel();
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
        tickLabelPosition(position: string): this;
        /**
         * Gets the approximate text width setting.
         *
         * @returns {boolean} The current text width approximation setting.
         */
        usesTextWidthApproximation(): boolean;
        /**
         * Sets the approximate text width setting. Approximating text width
         * measurements can drastically speed up plot rendering, but the plot may
         * have extra white space that would be eliminated by exact measurements.
         * Additionally, very abnormal fonts may not approximate reasonably.
         *
         * @param {boolean} The new text width approximation setting.
         * @returns {Axes.Numeric} The calling Axes.Numeric.
         */
        usesTextWidthApproximation(enable: boolean): this;
        private _hideEndTickLabels();
        private _hideOverflowingTickLabels();
        private _hideOverlappingTickLabels();
        /**
         * The method is responsible for evenly spacing the labels on the axis.
         * @return test to see if taking every `interval` recrangle from `rects`
         *         will result in labels not overlapping
         *
         * For top, bottom, left, right positioning of the thicks, we want the padding
         * between the labels to be 3x, such that the label will be  `padding` distance
         * from the tick and 2 * `padding` distance (or more) from the next tick
         *
         */
        private _hasOverlapWithInterval(interval, rects);
    }
}
declare namespace Plottable.Axes {
    class Category extends Axis<string> {
        private _tickLabelAngle;
        private _measurer;
        private _wrapper;
        private _writer;
        /**
         * Constructs a Category Axis.
         *
         * A Category Axis is a visual representation of a Category Scale.
         *
         * @constructor
         * @param {Scales.Category} scale
         * @param {string} [orientation="bottom"] One of "top"/"bottom"/"left"/"right".
         */
        constructor(scale: Scales.Category, orientation: string);
        protected _setup(): void;
        protected _rescale(): this;
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        protected _coreSize(): number;
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
        tickLabelAngle(angle: number): this;
        /**
         * Measures the size of the ticks while also writing them to the DOM.
         * @param {d3.Selection} ticks The tick elements to be written to.
         */
        private _drawTicks(axisWidth, axisHeight, scale, ticks);
        /**
         * Measures the size of the ticks without making any (permanent) DOM
         * changes.
         *
         * @param {string[]} ticks The strings that will be printed on the ticks.
         */
        private _measureTicks(axisWidth, axisHeight, scale, ticks);
        renderImmediately(): this;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
    }
}
declare namespace Plottable.Components {
    class Label extends Component {
        private _textContainer;
        private _text;
        private _angle;
        private _measurer;
        private _wrapper;
        private _writer;
        private _padding;
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
        text(displayText: string): this;
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
        angle(angle: number): this;
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
        padding(padAmount: number): this;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        renderImmediately(): this;
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
declare namespace Plottable.Components {
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
        private _padding;
        private _colorScale;
        private _formatter;
        private _maxEntriesPerRow;
        private _comparator;
        private _measurer;
        private _wrapper;
        private _writer;
        private _symbolFactoryAccessor;
        private _symbolOpacityAccessor;
        private _redrawCallback;
        /**
         * The Legend consists of a series of entries, each with a color and label taken from the Color Scale.
         *
         * @constructor
         * @param {Scale.Color} scale
         */
        constructor(colorScale: Scales.Color);
        protected _setup(): void;
        /**
         * Gets the Formatter for the entry texts.
         */
        formatter(): Formatter;
        /**
         * Sets the Formatter for the entry texts.
         *
         * @param {Formatter} formatter
         * @returns {Legend} The calling Legend.
         */
        formatter(formatter: Formatter): this;
        /**
         * Gets the maximum number of entries per row.
         *
         * @returns {number}
         */
        maxEntriesPerRow(): number;
        /**
         * Sets the maximum number of entries perrow.
         *
         * @param {number} maxEntriesPerRow
         * @returns {Legend} The calling Legend.
         */
        maxEntriesPerRow(maxEntriesPerRow: number): this;
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
        comparator(comparator: (a: string, b: string) => number): this;
        /**
         * Gets the Color Scale.
         *
         * @returns {Scales.Color}
         */
        colorScale(): Scales.Color;
        /**
         * Sets the Color Scale.
         *
         * @param {Scales.Color} scale
         * @returns {Legend} The calling Legend.
         */
        colorScale(colorScale: Scales.Color): this;
        destroy(): void;
        private _calculateLayoutInfo(availableWidth, availableHeight);
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        private _packRows(availableWidth, entries, entryLengths);
        /**
         * Gets the Entities (representing Legend entries) at a particular point.
         * Returns an empty array if no Entities are present at that location.
         *
         * @param {Point} p
         * @returns {Entity<Legend>[]}
         */
        entitiesAt(p: Point): Entity<Legend>[];
        renderImmediately(): this;
        /**
         * Gets the function determining the symbols of the Legend.
         *
         * @returns {(datum: any, index: number) => symbolFactory}
         */
        symbol(): (datum: any, index: number) => SymbolFactory;
        /**
         * Sets the function determining the symbols of the Legend.
         *
         * @param {(datum: any, index: number) => SymbolFactory} symbol
         * @returns {Legend} The calling Legend
         */
        symbol(symbol: (datum: any, index: number) => SymbolFactory): this;
        /**
         * Gets the opacity of the symbols of the Legend.
         *
         * @returns {(datum: any, index: number) => number}
         */
        symbolOpacity(): (datum: any, index: number) => number;
        /**
         * Sets the opacity of the symbols of the Legend.
         *
         * @param {number | ((datum: any, index: number) => number)} symbolOpacity
         * @returns {Legend} The calling Legend
         */
        symbolOpacity(symbolOpacity: number | ((datum: any, index: number) => number)): this;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
    }
}
declare namespace Plottable.Components {
    class InterpolatedColorLegend extends Component {
        private static _DEFAULT_NUM_SWATCHES;
        private _measurer;
        private _wrapper;
        private _writer;
        private _scale;
        private _orientation;
        private _textPadding;
        private _formatter;
        private _expands;
        private _swatchContainer;
        private _swatchBoundingBox;
        private _lowerLabel;
        private _upperLabel;
        private _redrawCallback;
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
         */
        constructor(interpolatedColorScale: Scales.InterpolatedColor);
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
        formatter(formatter: Formatter): this;
        /**
         * Gets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
         */
        expands(): boolean;
        /**
         * Sets whether the InterpolatedColorLegend expands to occupy all offered space in the long direction
         *
         * @param {expands} boolean
         * @returns {InterpolatedColorLegend} The calling InterpolatedColorLegend.
         */
        expands(expands: boolean): this;
        private static _ensureOrientation(orientation);
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
        orientation(orientation: string): this;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        private _generateTicks(numSwatches?);
        protected _setup(): void;
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        private _isVertical();
        renderImmediately(): this;
    }
}
declare namespace Plottable.Components {
    class Gridlines extends Component {
        private _xScale;
        private _yScale;
        private _xLinesContainer;
        private _yLinesContainer;
        private _renderCallback;
        /**
         * @constructor
         * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
         * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
         */
        constructor(xScale: QuantitativeScale<any>, yScale: QuantitativeScale<any>);
        destroy(): this;
        protected _setup(): void;
        renderImmediately(): this;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        private _redrawXLines();
        private _redrawYLines();
    }
}
declare namespace Plottable.Components {
    class Table extends ComponentContainer {
        private _rowPadding;
        private _columnPadding;
        private _rows;
        private _rowWeights;
        private _columnWeights;
        private _nRows;
        private _nCols;
        private _calculatedLayout;
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
         * Returns the Component at the specified row and column index.
         *
         * @param {number} rowIndex
         * @param {number} columnIndex
         * @returns {Component} The Component at the specified position, or null if no Component is there.
         */
        componentAt(rowIndex: number, columnIndex: number): Component;
        /**
         * Adds a Component in the specified row and column position.
         *
         * For example, instead of calling `new Table([[a, b], [null, c]])`, you
         * could call
         * var table = new Plottable.Components.Table();
         * table.add(a, 0, 0);
         * table.add(b, 0, 1);
         * table.add(c, 1, 1);
         *
         * @param {Component} component The Component to be added.
         * @param {number} row
         * @param {number} col
         * @returns {Table} The calling Table.
         */
        add(component: Component, row: number, col: number): this;
        protected _remove(component: Component): boolean;
        private _iterateLayout(availableWidth, availableHeight, isFinalOffer?);
        private _determineGuarantees(offeredWidths, offeredHeights, isFinalOffer?);
        requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
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
        rowPadding(rowPadding: number): this;
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
        columnPadding(columnPadding: number): this;
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
        rowWeight(index: number, weight: number): this;
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
        columnWeight(index: number, weight: number): this;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        private _padTableToSize(nRows, nCols);
        private static _calcComponentWeights(setWeights, componentGroups, fixityAccessor);
        private static _calcProportionalSpace(weights, freeSpace);
        private static _fixedSpace(componentGroup, fixityAccessor);
    }
}
declare namespace Plottable.Components {
    enum PropertyMode {
        VALUE = 0,
        PIXEL = 1,
    }
    class SelectionBoxLayer extends Component {
        protected _box: d3.Selection<void>;
        private _boxArea;
        private _boxVisible;
        private _boxBounds;
        private _xExtent;
        private _yExtent;
        private _xScale;
        private _yScale;
        private _adjustBoundsCallback;
        protected _xBoundsMode: PropertyMode;
        protected _yBoundsMode: PropertyMode;
        constructor();
        protected _setup(): void;
        protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
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
        bounds(newBounds: Bounds): this;
        protected _setBounds(newBounds: Bounds): void;
        private _getBounds();
        renderImmediately(): this;
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
        boxVisible(show: boolean): this;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        /**
         * Gets the x scale for this SelectionBoxLayer.
         */
        xScale(): QuantitativeScale<number | {
            valueOf(): number;
        }>;
        /**
         * Sets the x scale for this SelectionBoxLayer.
         *
         * @returns {SelectionBoxLayer} The calling SelectionBoxLayer.
         */
        xScale(xScale: QuantitativeScale<number | {
            valueOf(): number;
        }>): this;
        /**
         * Gets the y scale for this SelectionBoxLayer.
         */
        yScale(): QuantitativeScale<number | {
            valueOf(): number;
        }>;
        /**
         * Sets the y scale for this SelectionBoxLayer.
         *
         * @returns {SelectionBoxLayer} The calling SelectionBoxLayer.
         */
        yScale(yScale: QuantitativeScale<number | {
            valueOf(): number;
        }>): this;
        /**
         * Gets the data values backing the left and right edges of the box.
         *
         * Returns an undefined array if the edges are not backed by a scale.
         */
        xExtent(): (number | {
            valueOf(): number;
        })[];
        /**
         * Sets the data values backing the left and right edges of the box.
         */
        xExtent(xExtent: (number | {
            valueOf(): number;
        })[]): this;
        private _getXExtent();
        protected _setXExtent(xExtent: (number | {
            valueOf(): number;
        })[]): void;
        /**
         * Gets the data values backing the top and bottom edges of the box.
         *
         * Returns an undefined array if the edges are not backed by a scale.
         */
        yExtent(): (number | {
            valueOf(): number;
        })[];
        /**
         * Sets the data values backing the top and bottom edges of the box.
         */
        yExtent(yExtent: (number | {
            valueOf(): number;
        })[]): this;
        private _getYExtent();
        protected _setYExtent(yExtent: (number | {
            valueOf(): number;
        })[]): void;
        destroy(): void;
    }
}
declare namespace Plottable.Components {
    class GuideLineLayer<D> extends Component {
        static ORIENTATION_VERTICAL: string;
        static ORIENTATION_HORIZONTAL: string;
        private _orientation;
        private _value;
        private _scale;
        private _pixelPosition;
        private _scaleUpdateCallback;
        private _guideLine;
        private _mode;
        constructor(orientation: string);
        protected _setup(): void;
        protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
            width: number;
            height: number;
        };
        protected _isVertical(): boolean;
        fixedWidth(): boolean;
        fixedHeight(): boolean;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        renderImmediately(): this;
        private _syncPixelPositionAndValue();
        protected _setPixelPositionWithoutChangingMode(pixelPosition: number): void;
        /**
         * Gets the QuantitativeScale on the GuideLineLayer.
         *
         * @return {QuantitativeScale<D>}
         */
        scale(): QuantitativeScale<D>;
        /**
         * Sets the QuantitativeScale on the GuideLineLayer.
         * If value() was the last property set, pixelPosition() will be updated according to the new scale.
         * If pixelPosition() was the last property set, value() will be updated according to the new scale.
         *
         * @param {QuantitativeScale<D>} scale
         * @return {GuideLineLayer<D>} The calling GuideLineLayer.
         */
        scale(scale: QuantitativeScale<D>): this;
        /**
         * Gets the value of the guide line in data-space.
         *
         * @return {D}
         */
        value(): D;
        /**
         * Sets the value of the guide line in data-space.
         * If the GuideLineLayer has a scale, pixelPosition() will be updated now and whenever the scale updates.
         *
         * @param {D} value
         * @return {GuideLineLayer<D>} The calling GuideLineLayer.
         */
        value(value: D): this;
        /**
         * Gets the position of the guide line in pixel-space.
         *
         * @return {number}
         */
        pixelPosition(): number;
        /**
         * Sets the position of the guide line in pixel-space.
         * If the GuideLineLayer has a scale, the value() will be updated now and whenever the scale updates.
         *
         * @param {number} pixelPosition
         * @return {GuideLineLayer<D>} The calling GuideLineLayer.
         */
        pixelPosition(pixelPosition: number): this;
        destroy(): void;
    }
}
declare namespace Plottable.Plots {
    interface PlotEntity extends Entity<Plot> {
        dataset: Dataset;
        index: number;
        component: Plot;
    }
    interface AccessorScaleBinding<D, R> {
        accessor: Accessor<any>;
        scale?: Scale<D, R>;
    }
    namespace Animator {
        var MAIN: string;
        var RESET: string;
    }
}
declare namespace Plottable {
    class Plot extends Component {
        protected static _ANIMATION_MAX_DURATION: number;
        private _dataChanged;
        private _datasetToDrawer;
        protected _renderArea: d3.Selection<void>;
        private _attrBindings;
        private _attrExtents;
        private _includedValuesProvider;
        private _animate;
        private _animators;
        protected _renderCallback: ScaleCallback<Scale<any, any>>;
        private _onDatasetUpdateCallback;
        protected _propertyExtents: d3.Map<any[]>;
        protected _propertyBindings: d3.Map<Plots.AccessorScaleBinding<any, any>>;
        /**
         * A Plot draws some visualization of the inputted Datasets.
         *
         * @constructor
         */
        constructor();
        anchor(selection: d3.Selection<void>): this;
        protected _setup(): void;
        destroy(): void;
        protected _createNodesForDataset(dataset: Dataset): Drawer;
        protected _createDrawer(dataset: Dataset): Drawer;
        protected _getAnimator(key: string): Animator;
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
        attr(attr: string, attrValue: number | string | Accessor<number> | Accessor<string>): this;
        /**
         * Sets a particular attribute to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the attribute values when autoDomain()-ing.
         *
         * @param {string} attr
         * @param {A|Accessor<A>} attrValue
         * @param {Scale<A, number | string>} scale The Scale used to scale the attrValue.
         * @returns {Plot} The calling Plot.
         */
        attr<A>(attr: string, attrValue: A | Accessor<A>, scale: Scale<A, number | string>): this;
        protected _bindProperty(property: string, value: any, scale: Scale<any, any>): void;
        private _bindAttr(attr, value, scale);
        protected _generateAttrToProjector(): AttributeToProjector;
        renderImmediately(): this;
        /**
         * Returns whether the plot will be animated.
         */
        animated(): boolean;
        /**
         * Enables or disables animation.
         */
        animated(willAnimate: boolean): this;
        detach(): this;
        /**
         * @returns {Scale[]} A unique array of all scales currently used by the Plot.
         */
        private _scales();
        /**
         * Updates the extents associated with each attribute, then autodomains all scales the Plot uses.
         */
        protected _updateExtents(): void;
        private _updateExtentsForAttr(attr);
        protected _updateExtentsForProperty(property: string): void;
        protected _filterForProperty(property: string): Accessor<boolean>;
        private _updateExtentsForKey(key, bindings, extents, filter);
        private _computeExtent(dataset, accScaleBinding, filter);
        /**
         * Override in subclass to add special extents, such as included values
         */
        protected _extentsForProperty(property: string): any[];
        private _includedValuesForScale<D>(scale);
        /**
         * Get the Animator associated with the specified Animator key.
         *
         * @return {Animator}
         */
        animator(animatorKey: string): Animator;
        /**
         * Set the Animator associated with the specified Animator key.
         *
         * @param {string} animatorKey
         * @param {Animator} animator
         * @returns {Plot} The calling Plot.
         */
        animator(animatorKey: string, animator: Animator): this;
        /**
         * Adds a Dataset to the Plot.
         *
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        addDataset(dataset: Dataset): this;
        protected _addDataset(dataset: Dataset): this;
        /**
         * Removes a Dataset from the Plot.
         *
         * @param {Dataset} dataset
         * @returns {Plot} The calling Plot.
         */
        removeDataset(dataset: Dataset): this;
        protected _removeDataset(dataset: Dataset): this;
        protected _removeDatasetNodes(dataset: Dataset): void;
        datasets(): Dataset[];
        datasets(datasets: Dataset[]): this;
        protected _getDrawersInOrder(): Drawer[];
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _additionalPaint(time: number): void;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        private _paint();
        /**
         * Retrieves Selections of this Plot for the specified Datasets.
         *
         * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
         *   If not provided, Selections will be retrieved for all Datasets on the Plot.
         * @returns {d3.Selection}
         */
        selections(datasets?: Dataset[]): d3.Selection<any>;
        /**
         * Gets the Entities associated with the specified Datasets.
         *
         * @param {dataset[]} datasets The Datasets to retrieve the Entities for.
         *   If not provided, returns defaults to all Datasets on the Plot.
         * @return {Plots.PlotEntity[]}
         */
        entities(datasets?: Dataset[]): Plots.PlotEntity[];
        private _lightweightEntities(datasets?);
        private _lightweightPlotEntityToPlotEntity(entity);
        /**
         * Returns the PlotEntity nearest to the query point by the Euclidian norm, or undefined if no PlotEntity can be found.
         *
         * @param {Point} queryPoint
         * @returns {Plots.PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
         */
        entityNearest(queryPoint: Point): Plots.PlotEntity;
        protected _entityVisibleOnPlot(pixelPoint: Point, datum: any, index: number, dataset: Dataset): boolean;
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _propertyProjectors(): AttributeToProjector;
        protected static _scaledAccessor<D, R>(binding: Plots.AccessorScaleBinding<D, R>): Accessor<any>;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
        protected _animateOnNextRender(): boolean;
    }
}
declare namespace Plottable.Plots {
    class Pie extends Plot {
        private static _INNER_RADIUS_KEY;
        private static _OUTER_RADIUS_KEY;
        private static _SECTOR_VALUE_KEY;
        private _startAngles;
        private _endAngles;
        private _labelFormatter;
        private _labelsEnabled;
        private _strokeDrawers;
        /**
         * @constructor
         */
        constructor();
        protected _setup(): void;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        addDataset(dataset: Dataset): this;
        protected _addDataset(dataset: Dataset): this;
        removeDataset(dataset: Dataset): this;
        protected _removeDatasetNodes(dataset: Dataset): void;
        protected _removeDataset(dataset: Dataset): this;
        selections(datasets?: Dataset[]): d3.Selection<any>;
        protected _onDatasetUpdate(): void;
        protected _createDrawer(dataset: Dataset): Drawers.Arc;
        entities(datasets?: Dataset[]): PlotEntity[];
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
        sectorValue(sectorValue: number | Accessor<number>): this;
        /**
         * Sets the sector value to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {S|Accessor<S>} sectorValue
         * @param {Scale<S, number>} scale
         * @returns {Pie} The calling Pie Plot.
         */
        sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): this;
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
        innerRadius(innerRadius: number | Accessor<number>): any;
        /**
         * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {R|Accessor<R>} innerRadius
         * @param {Scale<R, number>} scale
         * @returns {Pie} The calling Pie Plot.
         */
        innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): any;
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
        outerRadius(outerRadius: number | Accessor<number>): this;
        /**
         * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {R|Accessor<R>} outerRadius
         * @param {Scale<R, number>} scale
         * @returns {Pie} The calling Pie Plot.
         */
        outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): this;
        /**
         * Get whether slice labels are enabled.
         *
         * @returns {boolean} Whether slices should display labels or not.
         */
        labelsEnabled(): boolean;
        /**
         * Sets whether labels are enabled.
         *
         * @param {boolean} labelsEnabled
         * @returns {Pie} The calling Pie Plot.
         */
        labelsEnabled(enabled: boolean): this;
        /**
         * Gets the Formatter for the labels.
         */
        labelFormatter(): Formatter;
        /**
         * Sets the Formatter for the labels.
         *
         * @param {Formatter} formatter
         * @returns {Pie} The calling Pie Plot.
         */
        labelFormatter(formatter: Formatter): this;
        entitiesAt(queryPoint: Point): PlotEntity[];
        protected _propertyProjectors(): AttributeToProjector;
        private _updatePieAngles();
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        protected static _isValidData(value: any): boolean;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): {
            x: number;
            y: number;
        };
        protected _additionalPaint(time: number): void;
        private _generateStrokeDrawSteps();
        private _sliceIndexForPoint(p);
        private _drawLabels();
    }
}
declare namespace Plottable {
    class XYPlot<X, Y> extends Plot {
        protected static _X_KEY: string;
        protected static _Y_KEY: string;
        private _autoAdjustXScaleDomain;
        private _autoAdjustYScaleDomain;
        private _adjustYDomainOnChangeFromXCallback;
        private _adjustXDomainOnChangeFromYCallback;
        private _deferredRendering;
        private _cachedDomainX;
        private _cachedDomainY;
        /**
         * An XYPlot is a Plot that displays data along two primary directions, X and Y.
         *
         * @constructor
         * @param {Scale} xScale The x scale to use.
         * @param {Scale} yScale The y scale to use.
         */
        constructor();
        /**
         * Returns the whether or not the rendering is deferred for performance boost.
         * @return {boolean} The deferred rendering option
         */
        deferredRendering(): boolean;
        /**
         * Sets / unsets the deferred rendering option
         * Activating this option improves the performance of plot interaction (pan / zoom) by
         * performing lazy renders, only after the interaction has stopped. Because re-rendering
         * is no longer performed during the interaction, the zooming might experience a small
         * resolution degradation, before the lazy re-render is performed.
         *
         * This option is intended for cases where performance is an issue.
         */
        deferredRendering(deferredRendering: boolean): this;
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
        x(x: number | Accessor<number>): this;
        /**
         * Sets X to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {X|Accessor<X>} x
         * @param {Scale<X, number>} xScale
         * @returns {XYPlot} The calling XYPlot.
         */
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
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
        y(y: number | Accessor<number>): this;
        /**
         * Sets Y to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {Y|Accessor<Y>} y
         * @param {Scale<Y, number>} yScale
         * @returns {XYPlot} The calling XYPlot.
         */
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
        protected _filterForProperty(property: string): (datum: any, index: number, dataset: Dataset) => boolean;
        private _makeFilterByProperty(property);
        protected _uninstallScaleForKey(scale: Scale<any, any>, key: string): void;
        protected _installScaleForKey(scale: Scale<any, any>, key: string): void;
        destroy(): this;
        /**
         * Gets the automatic domain adjustment mode for visible points.
         */
        autorangeMode(): string;
        /**
         * Sets the automatic domain adjustment mode for visible points to operate against the X Scale, Y Scale, or neither.
         * If "x" or "y" is specified the adjustment is immediately performed.
         *
         * @param {string} autorangeMode One of "x"/"y"/"none".
         *   "x" will adjust the x Scale in relation to changes in the y domain.
         *   "y" will adjust the y Scale in relation to changes in the x domain.
         *   "none" means neither Scale will change automatically.
         * @returns {XYPlot} The calling XYPlot.
         */
        autorangeMode(autorangeMode: string): this;
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        private _updateXExtentsAndAutodomain();
        private _updateYExtentsAndAutodomain();
        /**
         * Adjusts the domains of both X and Y scales to show all data.
         * This call does not override the autorange() behavior.
         *
         * @returns {XYPlot} The calling XYPlot.
         */
        showAllData(): this;
        private _adjustYDomainOnChangeFromX();
        private _adjustXDomainOnChangeFromY();
        protected _projectorsReady(): boolean;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
    }
}
declare namespace Plottable.Plots {
    class Rectangle<X, Y> extends XYPlot<X, Y> {
        private static _X2_KEY;
        private static _Y2_KEY;
        private _labelsEnabled;
        private _label;
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
        protected _createDrawer(dataset: Dataset): Drawers.Rectangle;
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _updateExtentsForProperty(property: string): void;
        protected _filterForProperty(property: string): (datum: any, index: number, dataset: Dataset) => boolean;
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
        x(x: number | Accessor<number>): this;
        /**
         * Sets X to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {X|Accessor<X>} x
         * @param {Scale<X, number>} xScale
         * @returns {Plots.Rectangle} The calling Rectangle Plot.
         */
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
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
        x2(x2: number | Accessor<number> | X | Accessor<X>): this;
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
        y(y: number | Accessor<number>): this;
        /**
         * Sets Y to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {Y|Accessor<Y>} y
         * @param {Scale<Y, number>} yScale
         * @returns {Plots.Rectangle} The calling Rectangle Plot.
         */
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
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
        y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
        /**
         * Gets the PlotEntities at a particular Point.
         *
         * @param {Point} point The point to query.
         * @returns {PlotEntity[]} The PlotEntities at the particular point
         */
        entitiesAt(point: Point): PlotEntity[];
        /**
         * Gets the Entities that intersect the Bounds.
         *
         * @param {Bounds} bounds
         * @returns {PlotEntity[]}
         */
        entitiesIn(bounds: Bounds): PlotEntity[];
        /**
         * Gets the Entities that intersect the area defined by the ranges.
         *
         * @param {Range} xRange
         * @param {Range} yRange
         * @returns {PlotEntity[]}
         */
        entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
        private _entityBBox(datum, index, dataset, attrToProjector);
        private _entitiesIntersecting(xValOrRange, yValOrRange);
        /**
         * Gets the accessor for labels.
         *
         * @returns {Accessor<string>}
         */
        label(): Accessor<string>;
        /**
         * Sets the text of labels to the result of an Accessor.
         *
         * @param {Accessor<string>} label
         * @returns {Plots.Rectangle} The calling Rectangle Plot.
         */
        label(label: Accessor<string>): this;
        /**
         * Gets whether labels are enabled.
         *
         * @returns {boolean}
         */
        labelsEnabled(): boolean;
        /**
         * Sets whether labels are enabled.
         * Labels too big to be contained in the rectangle, cut off by edges, or blocked by other rectangles will not be shown.
         *
         * @param {boolean} labelsEnabled
         * @returns {Rectangle} The calling Rectangle Plot.
         */
        labelsEnabled(enabled: boolean): this;
        protected _propertyProjectors(): AttributeToProjector;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): {
            x: any;
            y: any;
        };
        private _rectangleWidth(scale);
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        protected _additionalPaint(time: number): void;
        private _drawLabels();
        private _drawLabel(dataToDraw, dataset, datasetIndex);
        private _overlayLabel(labelXRange, labelYRange, datumIndex, datasetIndex, dataToDraw);
    }
}
declare namespace Plottable.Plots {
    class Scatter<X, Y> extends XYPlot<X, Y> {
        private static _SIZE_KEY;
        private static _SYMBOL_KEY;
        /**
         * A Scatter Plot draws a symbol at each data point.
         *
         * @constructor
         */
        constructor();
        protected _createDrawer(dataset: Dataset): Drawers.Symbol;
        /**
         * Gets the AccessorScaleBinding for the size property of the plot.
         * The size property corresponds to the area of the symbol.
         */
        size<S>(): AccessorScaleBinding<S, number>;
        /**
         * Sets the size property to a constant number or the result of an Accessor<number>.
         *
         * @param {number|Accessor<number>} size
         * @returns {Plots.Scatter} The calling Scatter Plot.
         */
        size(size: number | Accessor<number>): this;
        /**
         * Sets the size property to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {S|Accessor<S>} sectorValue
         * @param {Scale<S, number>} scale
         * @returns {Plots.Scatter} The calling Scatter Plot.
         */
        size<S>(size: S | Accessor<S>, scale: Scale<S, number>): this;
        /**
         * Gets the AccessorScaleBinding for the symbol property of the plot.
         * The symbol property corresponds to how the symbol will be drawn.
         */
        symbol(): AccessorScaleBinding<any, any>;
        /**
         * Sets the symbol property to an Accessor<SymbolFactory>.
         *
         * @param {Accessor<SymbolFactory>} symbol
         * @returns {Plots.Scatter} The calling Scatter Plot.
         */
        symbol(symbol: Accessor<SymbolFactory>): this;
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _entityVisibleOnPlot(pixelPoint: Point, datum: any, index: number, dataset: Dataset): boolean;
        protected _propertyProjectors(): AttributeToProjector;
        /**
         * Gets the Entities that intersect the Bounds.
         *
         * @param {Bounds} bounds
         * @returns {PlotEntity[]}
         */
        entitiesIn(bounds: Bounds): PlotEntity[];
        /**
         * Gets the Entities that intersect the area defined by the ranges.
         *
         * @param {Range} xRange
         * @param {Range} yRange
         * @returns {PlotEntity[]}
         */
        entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
        /**
         * Gets the Entities at a particular Point.
         *
         * @param {Point} p
         * @returns {PlotEntity[]}
         */
        entitiesAt(p: Point): PlotEntity[];
    }
}
declare namespace Plottable.Plots {
    class Bar<X, Y> extends XYPlot<X, Y> {
        static ORIENTATION_VERTICAL: string;
        static ORIENTATION_HORIZONTAL: string;
        private static _BAR_WIDTH_RATIO;
        private static _SINGLE_BAR_DIMENSION_RATIO;
        private static _BAR_AREA_CLASS;
        private static _LABEL_AREA_CLASS;
        private static _LABEL_VERTICAL_PADDING;
        private static _LABEL_HORIZONTAL_PADDING;
        private _baseline;
        private _baselineValue;
        protected _isVertical: boolean;
        private _labelFormatter;
        private _labelsEnabled;
        private _hideBarsIfAnyAreTooWide;
        private _labelConfig;
        private _baselineValueProvider;
        private _barPixelWidth;
        private _updateBarPixelWidthCallback;
        /**
         * A Bar Plot draws bars growing out from a baseline to some value
         *
         * @constructor
         * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
         */
        constructor(orientation?: string);
        x(): Plots.AccessorScaleBinding<X, number>;
        x(x: number | Accessor<number>): this;
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
        y(): Plots.AccessorScaleBinding<Y, number>;
        y(y: number | Accessor<number>): this;
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
        /**
         * Gets the orientation of the plot
         *
         * @return "vertical" | "horizontal"
         */
        orientation(): string;
        render(): this;
        protected _createDrawer(dataset: Dataset): Drawers.Rectangle;
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
        baselineValue(value: X | Y): this;
        addDataset(dataset: Dataset): this;
        protected _addDataset(dataset: Dataset): this;
        removeDataset(dataset: Dataset): this;
        protected _removeDataset(dataset: Dataset): this;
        datasets(): Dataset[];
        datasets(datasets: Dataset[]): this;
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
        labelsEnabled(enabled: boolean): this;
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
        labelFormatter(formatter: Formatter): this;
        protected _createNodesForDataset(dataset: Dataset): Drawer;
        protected _removeDatasetNodes(dataset: Dataset): void;
        /**
         * Returns the PlotEntity nearest to the query point according to the following algorithm:
         *   - If the query point is inside a bar, returns the PlotEntity for that bar.
         *   - Otherwise, gets the nearest PlotEntity by the primary direction (X for vertical, Y for horizontal),
         *     breaking ties with the secondary direction.
         * Returns undefined if no PlotEntity can be found.
         *
         * @param {Point} queryPoint
         * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
         */
        entityNearest(queryPoint: Point): PlotEntity;
        protected _entityVisibleOnPlot(pixelPoint: Point, datum: any, index: number, dataset: Dataset): boolean;
        /**
         * Gets the Entities at a particular Point.
         *
         * @param {Point} p
         * @returns {PlotEntity[]}
         */
        entitiesAt(p: Point): PlotEntity[];
        /**
         * Gets the Entities that intersect the Bounds.
         *
         * @param {Bounds} bounds
         * @returns {PlotEntity[]}
         */
        entitiesIn(bounds: Bounds): PlotEntity[];
        /**
         * Gets the Entities that intersect the area defined by the ranges.
         *
         * @param {Range} xRange
         * @param {Range} yRange
         * @returns {PlotEntity[]}
         */
        entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
        private _entitiesIntersecting(xValOrRange, yValOrRange);
        private _updateValueScale();
        protected _additionalPaint(time: number): void;
        /**
         * Makes sure the extent takes into account the widths of the bars
         */
        protected _extentsForProperty(property: string): any[];
        private _drawLabels();
        private _drawLabel(data, dataset);
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        /**
         * Computes the barPixelWidth of all the bars in the plot.
         *
         * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
         * If the position scale of the plot is a QuantitativeScale, then the bar width is equal to the smallest distance between
         * two adjacent data points, padded for visualisation.
         */
        protected _getBarPixelWidth(): number;
        private _updateBarPixelWidth();
        entities(datasets?: Dataset[]): PlotEntity[];
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
        protected _uninstallScaleForKey(scale: Scale<any, number>, key: string): void;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
    }
}
declare namespace Plottable.Plots {
    class Line<X> extends XYPlot<X, number> {
        private _interpolator;
        private _autorangeSmooth;
        private _croppedRenderingEnabled;
        private _downsamplingEnabled;
        /**
         * A Line Plot draws line segments starting from the first data point to the next.
         *
         * @constructor
         */
        constructor();
        x(): Plots.AccessorScaleBinding<X, number>;
        x(x: number | Accessor<number>): this;
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
        y(): Plots.AccessorScaleBinding<number, number>;
        y(y: number | Accessor<number>): this;
        y(y: number | Accessor<number>, yScale: Scale<number, number>): this;
        autorangeMode(): string;
        autorangeMode(autorangeMode: string): this;
        /**
         * Gets whether or not the autoranging is done smoothly.
         */
        autorangeSmooth(): boolean;
        /**
         * Sets whether or not the autorange is done smoothly.
         *
         * Smooth autoranging is done by making sure lines always exit on the left / right side of the plot
         * and deactivating the nice domain feature on the scales
         */
        autorangeSmooth(autorangeSmooth: boolean): this;
        private _setScaleSnapping();
        /**
         * Gets the interpolation function associated with the plot.
         *
         * @return {string | (points: Array<[number, number]>) => string)}
         */
        interpolator(): string | ((points: Array<[number, number]>) => string);
        /**
         * Sets the interpolation function associated with the plot.
         *
         * @param {string | points: Array<[number, number]>) => string} interpolator Interpolation function
         * @return Plots.Line
         */
        interpolator(interpolator: string | ((points: Array<[number, number]>) => string)): this;
        interpolator(interpolator: "linear"): this;
        interpolator(interpolator: "linear-closed"): this;
        interpolator(interpolator: "step"): this;
        interpolator(interpolator: "step-before"): this;
        interpolator(interpolator: "step-after"): this;
        interpolator(interpolator: "basis"): this;
        interpolator(interpolator: "basis-open"): this;
        interpolator(interpolator: "basis-closed"): this;
        interpolator(interpolator: "bundle"): this;
        interpolator(interpolator: "cardinal"): this;
        interpolator(interpolator: "cardinal-open"): this;
        interpolator(interpolator: "cardinal-closed"): this;
        interpolator(interpolator: "monotone"): this;
        /**
         * Gets if downsampling is enabled
         *
         * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
         */
        downsamplingEnabled(): boolean;
        /**
         * Sets if downsampling is enabled
         *
         * @returns {Plots.Line} The calling Plots.Line
         */
        downsamplingEnabled(downsampling: boolean): this;
        /**
         * Gets if croppedRendering is enabled
         *
         * When croppedRendering is enabled, lines that will not be visible in the viewport will not be drawn.
         */
        croppedRenderingEnabled(): boolean;
        /**
         * Sets if croppedRendering is enabled
         *
         * @returns {Plots.Line} The calling Plots.Line
         */
        croppedRenderingEnabled(croppedRendering: boolean): this;
        protected _createDrawer(dataset: Dataset): Drawer;
        protected _extentsForProperty(property: string): any[];
        private _getEdgeIntersectionPoints();
        protected _getResetYFunction(): (d: any, i: number, dataset: Dataset) => number;
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        /**
         * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
         *
         * @param {Point} queryPoint
         * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
         */
        entityNearestByXThenY(queryPoint: Point): PlotEntity;
        protected _propertyProjectors(): AttributeToProjector;
        protected _constructLineProjector(xProjector: Projector, yProjector: Projector): (datum: any, index: number, dataset: Dataset) => string;
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
        private _filterCroppedRendering(dataset, indices);
        private _filterDownsampling(dataset, indices);
    }
}
declare namespace Plottable.Plots {
    class Area<X> extends Line<X> {
        private static _Y0_KEY;
        private _lineDrawers;
        private _constantBaselineValueProvider;
        /**
         * An Area Plot draws a filled region (area) between Y and Y0.
         *
         * @constructor
         */
        constructor();
        protected _setup(): void;
        y(): Plots.AccessorScaleBinding<number, number>;
        y(y: number | Accessor<number>): this;
        y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): this;
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
        y0(y0: number | Accessor<number>): this;
        protected _onDatasetUpdate(): void;
        addDataset(dataset: Dataset): this;
        protected _addDataset(dataset: Dataset): this;
        protected _removeDatasetNodes(dataset: Dataset): void;
        protected _additionalPaint(): void;
        private _generateLineDrawSteps();
        private _generateLineAttrToProjector();
        protected _createDrawer(dataset: Dataset): Drawers.Area;
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _updateYScale(): void;
        protected _getResetYFunction(): Accessor<any>;
        protected _propertyProjectors(): AttributeToProjector;
        selections(datasets?: Dataset[]): d3.Selection<any>;
        protected _constructAreaProjector(xProjector: Projector, yProjector: Projector, y0Projector: Projector): (datum: any[], index: number, dataset: Dataset) => string;
    }
}
declare namespace Plottable.Plots {
    class ClusteredBar<X, Y> extends Bar<X, Y> {
        private _clusterOffsets;
        /**
         * A ClusteredBar Plot groups bars across Datasets based on the primary value of the bars.
         *   On a vertical ClusteredBar Plot, the bars with the same X value are grouped.
         *   On a horizontal ClusteredBar Plot, the bars with the same Y value are grouped.
         *
         * @constructor
         * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
         */
        constructor(orientation?: string);
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        private _updateClusterPosition();
        private _makeInnerScale();
        protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
    }
}
declare namespace Plottable.Plots {
    class StackedArea<X> extends Area<X> {
        private _stackingResult;
        private _stackedExtent;
        private _baseline;
        private _baselineValue;
        private _baselineValueProvider;
        /**
         * @constructor
         */
        constructor();
        croppedRenderingEnabled(): boolean;
        croppedRenderingEnabled(croppedRendering: boolean): this;
        protected _getAnimator(key: string): Animator;
        protected _setup(): void;
        x(): Plots.AccessorScaleBinding<X, number>;
        x(x: number | Accessor<number>): this;
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
        y(): Plots.AccessorScaleBinding<number, number>;
        y(y: number | Accessor<number>): this;
        y(y: number | Accessor<number>, yScale: QuantitativeScale<number>): this;
        /**
         * Gets if downsampling is enabled
         *
         * When downsampling is enabled, two consecutive lines with the same slope will be merged to one line.
         */
        downsamplingEnabled(): boolean;
        /**
         * Sets if downsampling is enabled
         *
         * For now, downsampling is always disabled in stacked area plot
         * @returns {Plots.StackedArea} The calling Plots.StackedArea
         */
        downsamplingEnabled(downsampling: boolean): this;
        protected _additionalPaint(): void;
        protected _updateYScale(): void;
        protected _onDatasetUpdate(): this;
        protected _updateExtentsForProperty(property: string): void;
        protected _extentsForProperty(attr: string): any[];
        private _updateStackExtentsAndOffsets();
        private _checkSameDomain(datasets, keyAccessor);
        /**
         * Given an array of Datasets and the accessor function for the key, computes the
         * set reunion (no duplicates) of the domain of each Dataset. The keys are stringified
         * before being returned.
         *
         * @param {Dataset[]} datasets The Datasets for which we extract the domain keys
         * @param {Accessor<any>} keyAccessor The accessor for the key of the data
         * @return {string[]} An array of stringified keys
         */
        private static _domainKeys(datasets, keyAccessor);
        protected _propertyProjectors(): AttributeToProjector;
        protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
    }
}
declare namespace Plottable.Plots {
    class StackedBar<X, Y> extends Bar<X, Y> {
        private _stackingResult;
        private _stackedExtent;
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
        x(): Plots.AccessorScaleBinding<X, number>;
        x(x: number | Accessor<number>): this;
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
        y(): Plots.AccessorScaleBinding<Y, number>;
        y(y: number | Accessor<number>): this;
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        protected _onDatasetUpdate(): this;
        protected _updateExtentsForProperty(property: string): void;
        protected _extentsForProperty(attr: string): any[];
        private _updateStackExtentsAndOffsets();
    }
}
declare namespace Plottable.Plots {
    class Segment<X, Y> extends XYPlot<X, Y> {
        private static _X2_KEY;
        private static _Y2_KEY;
        /**
         * A Segment Plot displays line segments based on the data.
         *
         * @constructor
         */
        constructor();
        protected _createDrawer(dataset: Dataset): Drawers.Segment;
        protected _generateDrawSteps(): Drawers.DrawStep[];
        protected _updateExtentsForProperty(property: string): void;
        protected _filterForProperty(property: string): (datum: any, index: number, dataset: Dataset) => boolean;
        /**
         * Gets the AccessorScaleBinding for X
         */
        x(): AccessorScaleBinding<X, number>;
        /**
         * Sets X to a constant value or the result of an Accessor.
         *
         * @param {X|Accessor<X>} x
         * @returns {Plots.Segment} The calling Segment Plot.
         */
        x(x: number | Accessor<number>): this;
        /**
         * Sets X to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {X|Accessor<X>} x
         * @param {Scale<X, number>} xScale
         * @returns {Plots.Segment} The calling Segment Plot.
         */
        x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
        /**
         * Gets the AccessorScaleBinding for X2
         */
        x2(): AccessorScaleBinding<X, number>;
        /**
         * Sets X2 to a constant number or the result of an Accessor.
         * If a Scale has been set for X, it will also be used to scale X2.
         *
         * @param {number|Accessor<number>|Y|Accessor<Y>} y2
         * @returns {Plots.Segment} The calling Segment Plot
         */
        x2(x2: number | Accessor<number> | X | Accessor<X>): this;
        /**
         * Gets the AccessorScaleBinding for Y
         */
        y(): AccessorScaleBinding<Y, number>;
        /**
         * Sets Y to a constant value or the result of an Accessor.
         *
         * @param {Y|Accessor<Y>} y
         * @returns {Plots.Segment} The calling Segment Plot.
         */
        y(y: number | Accessor<number>): this;
        /**
         * Sets Y to a scaled constant value or scaled result of an Accessor.
         * The provided Scale will account for the values when autoDomain()-ing.
         *
         * @param {Y|Accessor<Y>} y
         * @param {Scale<Y, number>} yScale
         * @returns {Plots.Segment} The calling Segment Plot.
         */
        y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
        /**
         * Gets the AccessorScaleBinding for Y2.
         */
        y2(): AccessorScaleBinding<Y, number>;
        /**
         * Sets Y2 to a constant number or the result of an Accessor.
         * If a Scale has been set for Y, it will also be used to scale Y2.
         *
         * @param {number|Accessor<number>|Y|Accessor<Y>} y2
         * @returns {Plots.Segment} The calling Segment Plot.
         */
        y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
        protected _propertyProjectors(): AttributeToProjector;
        /**
         * Gets the Entities that intersect the Bounds.
         *
         * @param {Bounds} bounds
         * @returns {PlotEntity[]}
         */
        entitiesIn(bounds: Bounds): PlotEntity[];
        /**
         * Gets the Entities that intersect the area defined by the ranges.
         *
         * @param {Range} xRange
         * @param {Range} yRange
         * @returns {PlotEntity[]}
         */
        entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
        private _entitiesIntersecting(xRange, yRange);
        private _lineIntersectsBox(entity, xRange, yRange, attrToProjector);
        private _lineIntersectsSegment(point1, point2, point3, point4);
    }
}
declare namespace Plottable.Plots {
    class Waterfall<X, Y> extends Bar<X, number> {
        private static _BAR_DECLINE_CLASS;
        private static _BAR_GROWTH_CLASS;
        private static _BAR_TOTAL_CLASS;
        private static _CONNECTOR_CLASS;
        private static _CONNECTOR_AREA_CLASS;
        private static _TOTAL_KEY;
        private _connectorArea;
        private _connectorsEnabled;
        private _extent;
        private _subtotals;
        constructor();
        /**
         * Gets whether connectors are enabled.
         *
         * @returns {boolean} Whether connectors should be shown or not.
         */
        connectorsEnabled(): boolean;
        /**
         * Sets whether connectors are enabled.
         *
         * @param {boolean} enabled
         * @returns {Plots.Waterfall} The calling Waterfall Plot.
         */
        connectorsEnabled(enabled: boolean): this;
        /**
         * Gets the AccessorScaleBinding for whether a bar represents a total or a delta.
         */
        total<T>(): Plots.AccessorScaleBinding<T, boolean>;
        /**
         * Sets total to a constant number or the result of an Accessor
         *
         * @param {Accessor<boolean>}
         * @returns {Plots.Waterfall} The calling Waterfall Plot.
         */
        total(total: Accessor<boolean>): this;
        protected _additionalPaint(time: number): void;
        protected _createNodesForDataset(dataset: Dataset): Drawer;
        protected _extentsForProperty(attr: string): any[];
        protected _generateAttrToProjector(): {
            [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
        };
        protected _onDatasetUpdate(): this;
        private _calculateSubtotalsAndExtent(dataset);
        private _drawConnectors();
        private _updateSubtotals();
    }
}
declare namespace Plottable {
    interface Animator {
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
}
declare namespace Plottable.Animators {
    /**
     * An animator implementation with no animation. The attributes are
     * immediately set on the selection.
     */
    class Null implements Animator {
        totalTime(selection: any): number;
        animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any>;
    }
}
declare namespace Plottable.Animators {
    /**
     * An Animator with easing and configurable durations and delays.
     */
    class Easing implements Animator {
        /**
         * The default starting delay of the animation in milliseconds
         */
        private static _DEFAULT_START_DELAY_MILLISECONDS;
        /**
         * The default duration of one animation step in milliseconds
         */
        private static _DEFAULT_STEP_DURATION_MILLISECONDS;
        /**
         * The default maximum start delay between each step of an animation
         */
        private static _DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
        /**
         * The default maximum total animation duration
         */
        private static _DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS;
        /**
         * The default easing of the animation
         */
        private static _DEFAULT_EASING_MODE;
        private _startDelay;
        private _stepDuration;
        private _stepDelay;
        private _maxTotalDuration;
        private _easingMode;
        /**
         * Constructs the default animator
         *
         * @constructor
         */
        constructor();
        totalTime(numberOfSteps: number): number;
        animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Transition<any>;
        /**
         * Gets the start delay of the animation in milliseconds.
         *
         * @returns {number} The current start delay.
         */
        startDelay(): number;
        /**
         * Sets the start delay of the animation in milliseconds.
         *
         * @param {number} startDelay The start delay in milliseconds.
         * @returns {Easing} The calling Easing Animator.
         */
        startDelay(startDelay: number): this;
        /**
         * Gets the duration of one animation step in milliseconds.
         *
         * @returns {number} The current duration.
         */
        stepDuration(): number;
        /**
         * Sets the duration of one animation step in milliseconds.
         *
         * @param {number} stepDuration The duration in milliseconds.
         * @returns {Easing} The calling Easing Animator.
         */
        stepDuration(stepDuration: number): this;
        /**
         * Gets the maximum start delay between animation steps in milliseconds.
         *
         * @returns {number} The current maximum iterative delay.
         */
        stepDelay(): number;
        /**
         * Sets the maximum start delay between animation steps in milliseconds.
         *
         * @param {number} stepDelay The maximum iterative delay in milliseconds.
         * @returns {Easing} The calling Easing Animator.
         */
        stepDelay(stepDelay: number): this;
        /**
         * Gets the maximum total animation duration constraint in milliseconds.
         *
         * If the animation time would exceed the specified time, the duration of each step
         * and the delay between each step will be reduced until the animation fits within
         * the specified time.
         *
         * @returns {number} The current maximum total animation duration.
         */
        maxTotalDuration(): number;
        /**
         * Sets the maximum total animation duration constraint in miliseconds.
         *
         * If the animation time would exceed the specified time, the duration of each step
         * and the delay between each step will be reduced until the animation fits within
         * the specified time.
         *
         * @param {number} maxTotalDuration The maximum total animation duration in milliseconds.
         * @returns {Easing} The calling Easing Animator.
         */
        maxTotalDuration(maxTotalDuration: number): this;
        /**
         * Gets the current easing mode of the animation.
         *
         * @returns {string} the current easing mode.
         */
        easingMode(): string;
        /**
         * Sets the easing mode of the animation.
         *
         * @param {string} easingMode The desired easing mode.
         * @returns {Easing} The calling Easing Animator.
         */
        easingMode(easingMode: string): this;
        /**
         * Adjust the iterative delay, such that it takes into account the maxTotalDuration constraint
         */
        private _getAdjustedIterativeDelay(numberOfSteps);
    }
}
declare namespace Plottable {
    class Dispatcher {
        protected _eventToProcessingFunction: {
            [eventName: string]: (e: Event) => any;
        };
        private _eventNameToCallbackSet;
        private _connected;
        private _hasNoCallbacks();
        private _connect();
        private _disconnect();
        protected _addCallbackForEvent(eventName: string, callback: Function): void;
        protected _removeCallbackForEvent(eventName: string, callback: Function): void;
        protected _callCallbacksForEvent(eventName: string, ...args: any[]): void;
    }
}
declare namespace Plottable.Dispatchers {
    type MouseCallback = (p: Point, event: MouseEvent) => void;
    class Mouse extends Dispatcher {
        private static _DISPATCHER_KEY;
        private _translator;
        private _lastMousePosition;
        private static _MOUSEOVER_EVENT_NAME;
        private static _MOUSEMOVE_EVENT_NAME;
        private static _MOUSEOUT_EVENT_NAME;
        private static _MOUSEDOWN_EVENT_NAME;
        private static _MOUSEUP_EVENT_NAME;
        private static _WHEEL_EVENT_NAME;
        private static _DBLCLICK_EVENT_NAME;
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
        onMouseMove(callback: MouseCallback): this;
        /**
         * Removes a callback that would be called when the mouse position changes.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        offMouseMove(callback: MouseCallback): this;
        /**
         * Registers a callback to be called when a mousedown occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        onMouseDown(callback: MouseCallback): this;
        /**
         * Removes a callback that would be called when a mousedown occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        offMouseDown(callback: MouseCallback): this;
        /**
         * Registers a callback to be called when a mouseup occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        onMouseUp(callback: MouseCallback): this;
        /**
         * Removes a callback that would be called when a mouseup occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        offMouseUp(callback: MouseCallback): this;
        /**
         * Registers a callback to be called when a wheel event occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        onWheel(callback: MouseCallback): this;
        /**
         * Removes a callback that would be called when a wheel event occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        offWheel(callback: MouseCallback): this;
        /**
         * Registers a callback to be called when a dblClick occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        onDblClick(callback: MouseCallback): this;
        /**
         * Removes a callback that would be called when a dblClick occurs.
         *
         * @param {MouseCallback} callback
         * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
         */
        offDblClick(callback: MouseCallback): this;
        /**
         * Computes the mouse position from the given event, and if successful
         * calls all the callbacks in the provided callbackSet.
         */
        private _measureAndDispatch(event, eventName, scope?);
        eventInsideSVG(event: MouseEvent): boolean;
        /**
         * Returns the last computed mouse position in <svg> coordinate space.
         *
         * @return {Point}
         */
        lastMousePosition(): Point;
    }
}
declare namespace Plottable.Dispatchers {
    type TouchCallback = (ids: number[], idToPoint: {
        [id: number]: Point;
    }, event: TouchEvent) => void;
    class Touch extends Dispatcher {
        private static _DISPATCHER_KEY;
        private static _TOUCHSTART_EVENT_NAME;
        private static _TOUCHMOVE_EVENT_NAME;
        private static _TOUCHEND_EVENT_NAME;
        private static _TOUCHCANCEL_EVENT_NAME;
        private _translator;
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
        onTouchStart(callback: TouchCallback): this;
        /**
         * Removes a callback that would be called when a touch starts.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        offTouchStart(callback: TouchCallback): this;
        /**
         * Registers a callback to be called when the touch position changes.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        onTouchMove(callback: TouchCallback): this;
        /**
         * Removes a callback that would be called when the touch position changes.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        offTouchMove(callback: TouchCallback): this;
        /**
         * Registers a callback to be called when a touch ends.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        onTouchEnd(callback: TouchCallback): this;
        /**
         * Removes a callback that would be called when a touch ends.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        offTouchEnd(callback: TouchCallback): this;
        /**
         * Registers a callback to be called when a touch is cancelled.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        onTouchCancel(callback: TouchCallback): this;
        /**
         * Removes a callback that would be called when a touch is cancelled.
         *
         * @param {TouchCallback} callback
         * @return {Dispatchers.Touch} The calling Touch Dispatcher.
         */
        offTouchCancel(callback: TouchCallback): this;
        /**
         * Computes the Touch position from the given event, and if successful
         * calls all the callbacks in the provided callbackSet.
         */
        private _measureAndDispatch(event, eventName, scope?);
        eventInsideSVG(event: TouchEvent): boolean;
    }
}
declare namespace Plottable.Dispatchers {
    type KeyCallback = (keyCode: number, event: KeyboardEvent) => void;
    class Key extends Dispatcher {
        private static _DISPATCHER_KEY;
        private static _KEYDOWN_EVENT_NAME;
        private static _KEYUP_EVENT_NAME;
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
        private _processKeydown(event);
        private _processKeyup(event);
        /**
         * Registers a callback to be called whenever a key is pressed.
         *
         * @param {KeyCallback} callback
         * @return {Dispatchers.Key} The calling Key Dispatcher.
         */
        onKeyDown(callback: KeyCallback): this;
        /**
         * Removes the callback to be called whenever a key is pressed.
         *
         * @param {KeyCallback} callback
         * @return {Dispatchers.Key} The calling Key Dispatcher.
         */
        offKeyDown(callback: KeyCallback): this;
        /** Registers a callback to be called whenever a key is released.
         *
         * @param {KeyCallback} callback
         * @return {Dispatchers.Key} The calling Key Dispatcher.
         */
        onKeyUp(callback: KeyCallback): this;
        /**
         * Removes the callback to be called whenever a key is released.
         *
         * @param {KeyCallback} callback
         * @return {Dispatchers.Key} The calling Key Dispatcher.
         */
        offKeyUp(callback: KeyCallback): this;
    }
}
declare namespace Plottable {
    class Interaction {
        protected _componentAttachedTo: Component;
        private _anchorCallback;
        private _isAnchored;
        private _enabled;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        /**
         * Attaches this Interaction to a Component.
         * If the Interaction was already attached to a Component, it first detaches itself from the old Component.
         *
         * @param {Component} component
         * @returns {Interaction} The calling Interaction.
         */
        attachTo(component: Component): this;
        private _connect();
        /**
         * Detaches this Interaction from the Component.
         * This Interaction can be reused.
         *
         * @param {Component} component
         * @returns {Interaction} The calling Interaction.
         */
        detachFrom(component: Component): this;
        private _disconnect();
        /**
         * Gets whether this Interaction is enabled.
         */
        enabled(): boolean;
        /**
         * Enables or disables this Interaction.
         *
         * @param {boolean} enabled Whether the Interaction should be enabled.
         * @return {Interaction} The calling Interaction.
         */
        enabled(enabled: boolean): this;
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
declare namespace Plottable {
    type ClickCallback = (point: Point) => void;
}
declare namespace Plottable.Interactions {
    class Click extends Interaction {
        private _mouseDispatcher;
        private _touchDispatcher;
        private _clickedDown;
        private _onClickCallbacks;
        private _mouseDownCallback;
        private _mouseUpCallback;
        private _touchStartCallback;
        private _touchEndCallback;
        private _touchCancelCallback;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        private _handleClickDown(p);
        private _handleClickUp(p);
        /**
         * Adds a callback to be called when the Component is clicked.
         *
         * @param {ClickCallback} callback
         * @return {Interactions.Click} The calling Click Interaction.
         */
        onClick(callback: ClickCallback): this;
        /**
         * Removes a callback that would be called when the Component is clicked.
         *
         * @param {ClickCallback} callback
         * @return {Interactions.Click} The calling Click Interaction.
         */
        offClick(callback: ClickCallback): this;
    }
}
declare namespace Plottable.Interactions {
    class DoubleClick extends Interaction {
        private _mouseDispatcher;
        private _touchDispatcher;
        private _clickState;
        private _clickedDown;
        private _clickedPoint;
        private _onDoubleClickCallbacks;
        private _mouseDownCallback;
        private _mouseUpCallback;
        private _dblClickCallback;
        private _touchStartCallback;
        private _touchEndCallback;
        private _touchCancelCallback;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        private _handleClickDown(p);
        private _handleClickUp(p);
        private _handleDblClick();
        private _handleClickCancel();
        private static _pointsEqual(p1, p2);
        /**
         * Adds a callback to be called when the Component is double-clicked.
         *
         * @param {ClickCallback} callback
         * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
         */
        onDoubleClick(callback: ClickCallback): this;
        /**
         * Removes a callback that would be called when the Component is double-clicked.
         *
         * @param {ClickCallback} callback
         * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
         */
        offDoubleClick(callback: ClickCallback): this;
    }
}
declare namespace Plottable {
    type KeyCallback = (keyCode: number) => void;
    namespace Interactions {
        class Key extends Interaction {
            /**
             * A Key Interaction listens to key events that occur while the Component is
             * moused over.
             */
            private _positionDispatcher;
            private _keyDispatcher;
            private _keyPressCallbacks;
            private _keyReleaseCallbacks;
            private _mouseMoveCallback;
            private _downedKeys;
            private _keyDownCallback;
            private _keyUpCallback;
            protected _anchor(component: Component): void;
            protected _unanchor(): void;
            private _handleKeyDownEvent(keyCode, event);
            private _handleKeyUpEvent(keyCode);
            /**
             * Adds a callback to be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
             */
            onKeyPress(keyCode: number, callback: KeyCallback): this;
            /**
             * Removes a callback that would be called when the key with the given keyCode is
             * pressed and the user is moused over the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
             */
            offKeyPress(keyCode: number, callback: KeyCallback): this;
            /**
             * Adds a callback to be called when the key with the given keyCode is
             * released if the key was pressed with the mouse inside of the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
             */
            onKeyRelease(keyCode: number, callback: KeyCallback): this;
            /**
             * Removes a callback that would be called when the key with the given keyCode is
             * released if the key was pressed with the mouse inside of the Component.
             *
             * @param {number} keyCode
             * @param {KeyCallback} callback
             * @returns {Interactions.Key} The calling Key Interaction.
             */
            offKeyRelease(keyCode: number, callback: KeyCallback): this;
        }
    }
}
declare namespace Plottable {
    type PointerCallback = (point: Point) => void;
}
declare namespace Plottable.Interactions {
    class Pointer extends Interaction {
        private _mouseDispatcher;
        private _touchDispatcher;
        private _overComponent;
        private _pointerEnterCallbacks;
        private _pointerMoveCallbacks;
        private _pointerExitCallbacks;
        private _mouseMoveCallback;
        private _touchStartCallback;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        private _handleMouseEvent(p, e);
        private _handleTouchEvent(p, e);
        private _handlePointerEvent(p, insideSVG);
        /**
         * Adds a callback to be called when the pointer enters the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        onPointerEnter(callback: PointerCallback): this;
        /**
         * Removes a callback that would be called when the pointer enters the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        offPointerEnter(callback: PointerCallback): this;
        /**
         * Adds a callback to be called when the pointer moves within the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        onPointerMove(callback: PointerCallback): this;
        /**
         * Removes a callback that would be called when the pointer moves within the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        offPointerMove(callback: PointerCallback): this;
        /**
         * Adds a callback to be called when the pointer exits the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        onPointerExit(callback: PointerCallback): this;
        /**
         * Removes a callback that would be called when the pointer exits the Component.
         *
         * @param {PointerCallback} callback
         * @return {Interactions.Pointer} The calling Pointer Interaction.
         */
        offPointerExit(callback: PointerCallback): this;
    }
}
declare namespace Plottable.Interactions {
    class PanZoom extends Interaction {
        /**
         * The number of pixels occupied in a line.
         */
        private static _PIXELS_PER_LINE;
        private _xScales;
        private _yScales;
        private _dragInteraction;
        private _mouseDispatcher;
        private _touchDispatcher;
        private _touchIds;
        private _wheelCallback;
        private _touchStartCallback;
        private _touchMoveCallback;
        private _touchEndCallback;
        private _touchCancelCallback;
        private _minDomainExtents;
        private _maxDomainExtents;
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
        private _handleTouchStart(ids, idToPoint, e);
        private _handlePinch(ids, idToPoint, e);
        private static _centerPoint(point1, point2);
        private static _pointDistance(point1, point2);
        private _handleTouchEnd(ids, idToPoint, e);
        private _magnifyScale<D>(scale, magnifyAmount, centerValue);
        private _translateScale<D>(scale, translateAmount);
        private _handleWheelEvent(p, e);
        private _constrainedZoomAmount(scale, zoomAmount);
        private _setupDragInteraction();
        private _nonLinearScaleWithExtents(scale);
        /**
         * Gets the x scales for this PanZoom Interaction.
         */
        xScales(): QuantitativeScale<any>[];
        /**
         * Sets the x scales for this PanZoom Interaction.
         *
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        xScales(xScales: QuantitativeScale<any>[]): this;
        /**
         * Gets the y scales for this PanZoom Interaction.
         */
        yScales(): QuantitativeScale<any>[];
        /**
         * Sets the y scales for this PanZoom Interaction.
         *
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        yScales(yScales: QuantitativeScale<any>[]): this;
        /**
         * Adds an x scale to this PanZoom Interaction
         *
         * @param {QuantitativeScale<any>} An x scale to add
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        addXScale(xScale: QuantitativeScale<any>): this;
        /**
         * Removes an x scale from this PanZoom Interaction
         *
         * @param {QuantitativeScale<any>} An x scale to remove
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        removeXScale(xScale: QuantitativeScale<any>): this;
        /**
         * Adds a y scale to this PanZoom Interaction
         *
         * @param {QuantitativeScale<any>} A y scale to add
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        addYScale(yScale: QuantitativeScale<any>): this;
        /**
         * Removes a y scale from this PanZoom Interaction
         *
         * @param {QuantitativeScale<any>} A y scale to remove
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        removeYScale(yScale: QuantitativeScale<any>): this;
        /**
         * Gets the minimum domain extent for the scale, specifying the minimum allowable amount
         * between the ends of the domain.
         *
         * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
         *
         * @param {QuantitativeScale<any>} quantitativeScale The scale to query
         * @returns {D} The minimum domain extent for the scale.
         */
        minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
        /**
         * Sets the minimum domain extent for the scale, specifying the minimum allowable amount
         * between the ends of the domain.
         *
         * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
         *
         * @param {QuantitativeScale<any>} quantitativeScale The scale to query
         * @param {D} minDomainExtent The minimum domain extent for the scale.
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        minDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, minDomainExtent: D): this;
        /**
         * Gets the maximum domain extent for the scale, specifying the maximum allowable amount
         * between the ends of the domain.
         *
         * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
         *
         * @param {QuantitativeScale<any>} quantitativeScale The scale to query
         * @returns {D} The maximum domain extent for the scale.
         */
        maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>): D;
        /**
         * Sets the maximum domain extent for the scale, specifying the maximum allowable amount
         * between the ends of the domain.
         *
         * Note that extents will mainly work on scales that work linearly like Linear Scale and Time Scale
         *
         * @param {QuantitativeScale<any>} quantitativeScale The scale to query
         * @param {D} minDomainExtent The maximum domain extent for the scale.
         * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
         */
        maxDomainExtent<D>(quantitativeScale: QuantitativeScale<D>, maxDomainExtent: D): this;
    }
}
declare namespace Plottable {
    type DragCallback = (start: Point, end: Point) => void;
}
declare namespace Plottable.Interactions {
    class Drag extends Interaction {
        private _dragging;
        private _constrainedToComponent;
        private _mouseDispatcher;
        private _touchDispatcher;
        private _dragOrigin;
        private _dragStartCallbacks;
        private _dragCallbacks;
        private _dragEndCallbacks;
        private _mouseDownCallback;
        private _mouseMoveCallback;
        private _mouseUpCallback;
        private _touchStartCallback;
        private _touchMoveCallback;
        private _touchEndCallback;
        protected _anchor(component: Component): void;
        protected _unanchor(): void;
        private _translateAndConstrain(p);
        private _startDrag(point, event);
        private _doDrag(point, event);
        private _endDrag(point, event);
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
        constrainedToComponent(): boolean;
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
        constrainedToComponent(constrainedToComponent: boolean): this;
        /**
         * Adds a callback to be called when dragging starts.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        onDragStart(callback: DragCallback): this;
        /**
         * Removes a callback that would be called when dragging starts.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        offDragStart(callback: DragCallback): this;
        /**
         * Adds a callback to be called during dragging.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        onDrag(callback: DragCallback): this;
        /**
         * Removes a callback that would be called during dragging.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        offDrag(callback: DragCallback): this;
        /**
         * Adds a callback to be called when dragging ends.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        onDragEnd(callback: DragCallback): this;
        /**
         * Removes a callback that would be called when dragging ends.
         *
         * @param {DragCallback} callback
         * @returns {Drag} The calling Drag Interaction.
         */
        offDragEnd(callback: DragCallback): this;
    }
}
declare namespace Plottable {
    type DragBoxCallback = (bounds: Bounds) => void;
}
declare namespace Plottable.Components {
    class DragBoxLayer extends Components.SelectionBoxLayer {
        private _dragInteraction;
        private _detectionEdgeT;
        private _detectionEdgeB;
        private _detectionEdgeL;
        private _detectionEdgeR;
        private _detectionCornerTL;
        private _detectionCornerTR;
        private _detectionCornerBL;
        private _detectionCornerBR;
        private _detectionRadius;
        private _resizable;
        private _movable;
        protected _hasCorners: boolean;
        private _dragStartCallbacks;
        private _dragCallbacks;
        private _dragEndCallbacks;
        private _disconnectInteraction;
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
        private _setUpCallbacks();
        protected _setup(): void;
        private _getResizingEdges(p);
        renderImmediately(): this;
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
        detectionRadius(r: number): this;
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
        resizable(canResize: boolean): this;
        protected _setResizableClasses(canResize: boolean): void;
        /**
         * Gets whether or not the drag box is movable.
         */
        movable(): boolean;
        /**
         * Sets whether or not the drag box is movable.
         *
         * @param {boolean} movable
         * @return {DragBoxLayer} The calling DragBoxLayer.
         */
        movable(movable: boolean): this;
        private _setMovableClass();
        /**
         * Sets the callback to be called when dragging starts.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        onDragStart(callback: DragBoxCallback): this;
        /**
         * Removes a callback to be called when dragging starts.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        offDragStart(callback: DragBoxCallback): this;
        /**
         * Sets a callback to be called during dragging.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        onDrag(callback: DragBoxCallback): this;
        /**
         * Removes a callback to be called during dragging.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        offDrag(callback: DragBoxCallback): this;
        /**
         * Sets a callback to be called when dragging ends.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        onDragEnd(callback: DragBoxCallback): this;
        /**
         * Removes a callback to be called when dragging ends.
         *
         * @param {DragBoxCallback} callback
         * @returns {DragBoxLayer} The calling DragBoxLayer.
         */
        offDragEnd(callback: DragBoxCallback): this;
        /**
         * Gets the internal Interactions.Drag of the DragBoxLayer.
         */
        dragInteraction(): Interactions.Drag;
        /**
         * Enables or disables the interaction and drag box.
         */
        enabled(enabled: boolean): this;
        /**
         * Gets the enabled state.
         */
        enabled(): boolean;
        destroy(): void;
        detach(): this;
        anchor(selection: d3.Selection<void>): this;
        private _resetState();
    }
}
declare namespace Plottable.Components {
    class XDragBoxLayer extends DragBoxLayer {
        /**
         * An XDragBoxLayer is a DragBoxLayer whose size can only be set in the X-direction.
         * The y-values of the bounds() are always set to 0 and the height() of the XDragBoxLayer.
         *
         * @constructor
         */
        constructor();
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        protected _setBounds(newBounds: Bounds): void;
        protected _setResizableClasses(canResize: boolean): void;
        yScale<D extends number | {
            valueOf(): number;
        }>(): QuantitativeScale<D>;
        yScale<D extends number | {
            valueOf(): number;
        }>(yScale: QuantitativeScale<D>): this;
        yExtent(): (number | {
            valueOf(): number;
        })[];
        yExtent(yExtent: (number | {
            valueOf(): number;
        })[]): this;
    }
}
declare namespace Plottable.Components {
    class YDragBoxLayer extends DragBoxLayer {
        /**
         * A YDragBoxLayer is a DragBoxLayer whose size can only be set in the Y-direction.
         * The x-values of the bounds() are always set to 0 and the width() of the YDragBoxLayer.
         *
         * @constructor
         */
        constructor();
        computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
        protected _setBounds(newBounds: Bounds): void;
        protected _setResizableClasses(canResize: boolean): void;
        xScale<D extends number | {
            valueOf(): number;
        }>(): QuantitativeScale<D>;
        xScale<D extends number | {
            valueOf(): number;
        }>(xScale: QuantitativeScale<D>): this;
        xExtent(): (number | {
            valueOf(): number;
        })[];
        xExtent(xExtent: (number | {
            valueOf(): number;
        })[]): this;
    }
}
declare namespace Plottable {
    interface DragLineCallback<D> {
        (dragLineLayer: Components.DragLineLayer<D>): void;
    }
}
declare namespace Plottable.Components {
    class DragLineLayer<D> extends GuideLineLayer<D> {
        private _dragInteraction;
        private _detectionRadius;
        private _detectionEdge;
        private _enabled;
        private _dragStartCallbacks;
        private _dragCallbacks;
        private _dragEndCallbacks;
        private _disconnectInteraction;
        constructor(orientation: string);
        protected _setup(): void;
        renderImmediately(): this;
        /**
         * Gets the detection radius of the drag line in pixels.
         */
        detectionRadius(): number;
        /**
         * Sets the detection radius of the drag line in pixels.
         *
         * @param {number} detectionRadius
         * @return {DragLineLayer<D>} The calling DragLineLayer.
         */
        detectionRadius(detectionRadius: number): this;
        /**
         * Gets whether the DragLineLayer is enabled.
         */
        enabled(): boolean;
        /**
         * Enables or disables the DragLineLayer.
         *
         * @param {boolean} enabled
         * @return {DragLineLayer<D>} The calling DragLineLayer.
         */
        enabled(enabled: boolean): this;
        /**
         * Sets the callback to be called when dragging starts.
         * The callback will be passed the calling DragLineLayer.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        onDragStart(callback: DragLineCallback<D>): this;
        /**
         * Removes a callback that would be called when dragging starts.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        offDragStart(callback: DragLineCallback<D>): this;
        /**
         * Sets a callback to be called during dragging.
         * The callback will be passed the calling DragLineLayer.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        onDrag(callback: DragLineCallback<D>): this;
        /**
         * Removes a callback that would be called during dragging.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        offDrag(callback: DragLineCallback<D>): this;
        /**
         * Sets a callback to be called when dragging ends.
         * The callback will be passed the calling DragLineLayer.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        onDragEnd(callback: DragLineCallback<D>): this;
        /**
         * Removes a callback that would be called when dragging ends.
         *
         * @param {DragLineCallback<D>} callback
         * @returns {DragLineLayer<D>} The calling DragLineLayer.
         */
        offDragEnd(callback: DragLineCallback<D>): this;
        destroy(): void;
    }
}
