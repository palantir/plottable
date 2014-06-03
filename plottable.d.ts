
declare module Plottable {
    module Utils {
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
        * Takes two arrays of numbers and adds them together
        *
        * @param {number[]} alist The first array of numbers
        * @param {number[]} blist The second array of numbers
        * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
        */
        function addArrays(alist: number[], blist: number[]): number[];
        function accessorize(accessor: any): IAccessor;
        function applyAccessor(accessor: IAccessor, dataSource: DataSource): (d: any, i: number) => any;
        function uniq(strings: string[]): string[];
        /**
        * Creates an array of length `count`, filled with value or (if value is a function), value()
        *
        * @param {any} value The value to fill the array with, or, if a function, a generator for values
        * @param {number} count The length of the array to generate
        * @return {any[]}
        */
        function createFilledArray(value: any, count: number): any[];
        /**
        * Returns the concatenation of each sub-array in `a`. Note that it isn't
        * recursive, it only goes "one level down" so that it can have a proper
        * type signature.
        */
        function flatten(a: any[][]): any[];
    }
}


declare module Plottable {
    module OSUtils {
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


declare module Plottable {
    class IDCounter {
        public increment(id: any): number;
        public decrement(id: any): number;
        public get(id: any): number;
    }
}


declare module Plottable {
    /**
    * An associative array that can be keyed by anything (inc objects).
    * Uses pointer equality checks which is why this works.
    * This power has a price: everything is linear time since it is actually backed by an array...
    */
    class StrictEqualityAssociativeArray {
        /**
        * Set a new key/value pair in the store.
        *
        * @param {any} Key to set in the store
        * @param {any} Value to set in the store
        * @return {boolean} True if key already in store, false otherwise
        */
        public set(key: any, value: any): boolean;
        public get(key: any): any;
        public has(key: any): boolean;
        public values(): any[];
        public delete(key: any): boolean;
    }
}


declare module Plottable {
    module TextUtils {
        interface TextMeasurer {
            (s: string): number[];
        }
        /**
        * Returns a quasi-pure function of typesignature (t: string) => number[] which measures height and width of text
        *
        * @param {D3.Selection} selection: The selection in which text will be drawn and measured
        * @returns {number[]} width and height of the text
        */
        function getTextMeasure(selection: D3.Selection): TextMeasurer;
        /**
        * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
        *
        * @param {string} text: The string to be truncated
        * @param {number} availableWidth: The available width, in pixels
        * @param {D3.Selection} element: The text element used to measure the text
        * @returns {string} text - the shortened text
        */
        function getTruncatedText(text: string, availableWidth: number, element: D3.Selection): string;
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
        function addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
        function writeLineHorizontally(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): number[];
        function writeLineVertically(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): number[];
        function writeTextHorizontally(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): number[];
        function writeTextVertically(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): number[];
        interface IWriteTextResult {
            textFits: boolean;
            usedWidth: number;
            usedHeight: number;
        }
        /**
        * Attempt to write the string 'text' to a D3.Selection containing a svg.g.
        * Contains the text within a rectangle with dimensions width, height. Tries to
        * orient the text using xOrient and yOrient parameters.
        * Will align the text vertically if it seems like that is appropriate.
        * Returns an IWriteTextResult with info on whether the text fit, and how much width/height was used.
        */
        function writeText(text: string, g: D3.Selection, width: number, height: number, xAlign: string, yAlign: string): IWriteTextResult;
    }
}


declare var LINE_BREAKS_BEFORE: RegExp;
declare var LINE_BREAKS_AFTER: RegExp;
declare var SPACES: RegExp;
declare module Plottable {
    module WordWrapUtils {
        interface IWrappedText {
            originalText: string;
            lines: string[];
            textFits: boolean;
        }
        /**
        * Takes a block of text, a width and height to fit it in, and a 2-d text measurement function.
        * Wraps words and fits as much of the text as possible into the given width and height.
        */
        function breakTextToFitRect(text: string, width: number, height: number, measureText: TextUtils.TextMeasurer): IWrappedText;
        /**
        * Splits up the text so that it will fit in width (or splits into a list of single characters if it is impossible
        * to fit in width). Tries to avoid breaking words on non-linebreak-or-space characters, and will only break a word if
        * the word is too big to fit within width on its own.
        */
        function breakTextToFitWidth(text: string, width: number, widthMeasure: (s: string) => number): string[];
        /**
        * Determines if it is possible to fit a given text within width without breaking any of the words.
        * Simple algorithm, split the text up into tokens, and make sure that the widest token doesn't exceed
        * allowed width.
        */
        function canWrapWithoutBreakingWords(text: string, width: number, widthMeasure: (s: string) => number): boolean;
    }
}

declare module Plottable {
    module DOMUtils {
        /**
        * Gets the bounding box of an element.
        * @param {D3.Selection} element
        * @returns {SVGRed} The bounding box.
        */
        function getBBox(element: D3.Selection): SVGRect;
        function isSelectionRemoved(selection: D3.Selection): boolean;
        function getElementWidth(elem: HTMLScriptElement): number;
        function getElementHeight(elem: HTMLScriptElement): number;
        function getSVGPixelWidth(svg: D3.Selection): number;
        function translate(s: D3.Selection, x?: number, y?: number): any;
    }
}


declare module Plottable {
    class PlottableObject {
    }
}


declare module Plottable {
    class Broadcaster extends PlottableObject {
        /**
        * Registers a callback to be called when the broadcast method is called. Also takes a listener which
        * is used to support deregistering the same callback later, by passing in the same listener.
        * If there is already a callback associated with that listener, then the callback will be replaced.
        *
        * This should NOT be called directly by a Component; registerToBroadcaster should be used instead.
        *
        * @param listener The listener associated with the callback.
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Broadcaster} this object
        */
        public registerListener(listener: any, callback: IBroadcasterCallback): Broadcaster;
        /**
        * Registers deregister the callback associated with a listener.
        *
        * @param listener The listener to deregister.
        * @returns {Broadcaster} this object
        */
        public deregisterListener(listener: any): Broadcaster;
    }
}


declare module Plottable {
    class DataSource extends Broadcaster {
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        constructor(data?: any[], metadata?: any);
        /**
        * Retrieves the current data from the DataSource, or sets the data.
        *
        * @param {any[]} [data] The new data.
        * @returns {any[]|DataSource} The current data, or the calling DataSource.
        */
        public data(): any[];
        public data(data: any[]): DataSource;
        /**
        * Retrieves the current metadata from the DataSource, or sets the metadata.
        *
        * @param {any[]} [metadata] The new metadata.
        * @returns {any[]|DataSource} The current metadata, or the calling DataSource.
        */
        public metadata(): any;
        public metadata(metadata: any): DataSource;
    }
}


declare module Plottable {
    class Component extends PlottableObject {
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
        public merge(c: Component): ComponentGroup;
        /**
        * Removes a Component from the DOM.
        */
        public remove(): Component;
    }
}


declare module Plottable {
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
        * Remove all components contained in the  ComponentContainer
        *
        * @returns {ComponentContainer} The calling ComponentContainer
        */
        public removeAll(): ComponentContainer;
    }
}


declare module Plottable {
    class ComponentGroup extends ComponentContainer {
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        constructor(components?: Component[]);
        public merge(c: Component): ComponentGroup;
    }
}


declare module Plottable {
    interface IterateLayoutResult {
        colProportionalSpace: number[];
        rowProportionalSpace: number[];
        guaranteedWidths: number[];
        guaranteedHeights: number[];
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    class Table extends ComponentContainer {
        /**
        * Creates a Table.
        *
        * @constructor
        * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
        * null can be used if a cell is empty.
        */
        constructor(rows?: Component[][]);
        /**
        * Adds a Component in the specified cell.
        *
        * @param {number} row The row in which to add the Component.
        * @param {number} col The column in which to add the Component.
        * @param {Component} component The Component to be added.
        */
        public addComponent(row: number, col: number, component: Component): Table;
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


declare module Plottable {
    class Scale extends Broadcaster {
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
        * Retrieves the current domain, or sets the Scale's domain to the specified values.
        *
        * @param {any[]} [values] The new value for the domain. This array may
        *     contain more than 2 values if the scale type allows it (e.g.
        *     ordinal scales). Other scales such as quantitative scales accept
        *     only a 2-value extent array.
        * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
        */
        public domain(): any[];
        public domain(values: any[]): Scale;
        /**
        * Retrieves the current range, or sets the Scale's range to the specified values.
        *
        * @param {any[]} [values] The new value for the range.
        * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
        */
        public range(): any[];
        public range(values: any[]): Scale;
        /**
        * Creates a copy of the Scale with the same domain and range but without any registered listeners.
        *
        * @returns {Scale} A copy of the calling Scale.
        */
        public copy(): Scale;
    }
}


declare module Plottable {
    interface _IProjector {
        accessor: IAccessor;
        scale?: Scale;
    }
    class Renderer extends Component {
        /**
        * Creates a Renderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        */
        constructor();
        constructor(dataset: any[]);
        constructor(dataset: DataSource);
        /**
        * Retrieves the current DataSource, or sets a DataSource if the Renderer doesn't yet have one.
        *
        * @param {DataSource} [source] The DataSource the Renderer should use, if it doesn't yet have one.
        * @return {DataSource|Renderer} The current DataSource or the calling Renderer.
        */
        public dataSource(): DataSource;
        public dataSource(source: DataSource): Renderer;
        public project(attrToSet: string, accessor: any, scale?: Scale): Renderer;
        /**
        * Enables or disables animation.
        *
        * @param {boolean} enabled Whether or not to animate.
        */
        public animate(enabled: boolean): Renderer;
    }
}


declare module Plottable {
    class RenderController {
        static enabled: boolean;
        static registerToRender(c: Component): void;
        static registerToComputeLayout(c: Component): void;
        static flush(): void;
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
    interface IBroadcasterCallback {
        (broadcaster: Broadcaster, ...args: any[]): any;
    }
    interface ISpaceRequest {
        width: number;
        height: number;
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
}


declare module Plottable {
    class QuantitiveScale extends Scale {
        /**
        * Creates a new QuantitiveScale.
        *
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        constructor(scale: D3.Scale.QuantitiveScale);
        public autoDomain(): QuantitiveScale;
        /**
        * Retrieves the domain value corresponding to a supplied range value.
        *
        * @param {number} value: A value from the Scale's range.
        * @returns {number} The domain value corresponding to the supplied range value.
        */
        public invert(value: number): number;
        /**
        * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
        *
        * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
        */
        public copy(): QuantitiveScale;
        public domain(): any[];
        public domain(values: any[]): QuantitiveScale;
        /**
        * Sets or gets the QuantitiveScale's output interpolator
        *
        * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
        * @returns {D3.Transition.Interpolate|QuantitiveScale} The current output interpolator, or the calling QuantitiveScale.
        */
        public interpolate(): D3.Transition.Interpolate;
        public interpolate(factory: D3.Transition.Interpolate): QuantitiveScale;
        /**
        * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
        *
        * @param {number[]} values The new range value for the range.
        */
        public rangeRound(values: number[]): QuantitiveScale;
        /**
        * Gets or sets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
        *
        * @param {boolean} [clamp] Whether or not to clamp the QuantitiveScale.
        * @returns {boolean|QuantitiveScale} The current clamp status, or the calling QuantitiveScale.
        */
        public clamp(): boolean;
        public clamp(clamp: boolean): QuantitiveScale;
        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        */
        public nice(count?: number): QuantitiveScale;
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
        public domainFunction(fn?: (values: number[]) => number[]): (values: number[]) => number[];
    }
}


declare module Plottable {
    class LinearScale extends QuantitiveScale {
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
        public copy(): LinearScale;
    }
}


declare module Plottable {
    class LogScale extends QuantitiveScale {
        /**
        * Creates a new LogScale.
        *
        * @constructor
        * @param {D3.Scale.LogScale} [scale] The D3 LogScale backing the LogScale. If not supplied, uses a default scale.
        */
        constructor();
        constructor(scale: D3.Scale.LogScale);
        /**
        * Creates a copy of the LogScale with the same domain and range but without any registered listeners.
        *
        * @returns {LogScale} A copy of the calling LogScale.
        */
        public copy(): LogScale;
    }
}


declare module Plottable {
    class OrdinalScale extends Scale {
        /**
        * Creates a new OrdinalScale. Domain and Range are set later.
        *
        * @constructor
        */
        constructor(scale?: D3.Scale.OrdinalScale);
        /**
        * Retrieves the current domain, or sets the Scale's domain to the specified values.
        *
        * @param {any[]} [values] The new values for the domain. This array may contain more than 2 values.
        * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
        */
        public domain(): any[];
        public domain(values: any[]): OrdinalScale;
        /**
        * Returns the range of pixels spanned by the scale, or sets the range.
        *
        * @param {number[]} [values] The pixel range to set on the scale.
        * @returns {number[]|OrdinalScale} The pixel range, or the calling OrdinalScale.
        */
        public range(): any[];
        public range(values: number[]): OrdinalScale;
        /**
        * Returns the width of the range band. Only valid when rangeType is set to "bands".
        *
        * @returns {number} The range band width or 0 if rangeType isn't "bands".
        */
        public rangeBand(): number;
        public innerPadding(): number;
        public fullBandStartAndWidth(v: any): number[];
        /**
        * Returns the range type, or sets the range type.
        *
        * @param {string} [rangeType] Either "points" or "bands" indicating the
        *     d3 method used to generate range bounds.
        * @param {number} [outerPadding] The padding outside the range,
        *     proportional to the range step.
        * @param {number} [innerPadding] The padding between bands in the range,
        *     proportional to the range step. This parameter is only used in
        *     "bands" type ranges.
        * @returns {string|OrdinalScale} The current range type, or the calling
        *     OrdinalScale.
        */
        public rangeType(): string;
        public rangeType(rangeType: string, outerPadding?: number, innerPadding?: number): OrdinalScale;
    }
}


declare module Plottable {
    class ColorScale extends Scale {
        /**
        * Creates a ColorScale.
        *
        * @constructor
        * @param {string} [scaleType] the type of color scale to create
        *     (Category10/Category20/Category20b/Category20c).
        */
        constructor(scaleType?: string);
    }
}


declare module Plottable {
    class TimeScale extends QuantitiveScale {
        /**
        * Creates a new TimeScale.
        *
        * @constructor
        */
        constructor();
    }
}


declare module Plottable {
    class InterpolatedColorScale extends QuantitiveScale {
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
        * Gets or sets the color range.
        *
        * @param {string|string[]} [colorRange]. If no argument is passed,
        *     returns the current range of colors. If the param is one of
        *     (reds/blues/posneg) we lookup the scale from the built-in color
        *     groups. Finally, if params is an array of strings with at least 2
        *     values (e.g. ["#FF00FF", "red", "dodgerblue"], the resulting scale
        *     will interpolate between the color values across the domain.
        *
        * @returns the current color values for the range as strings or this
        *     InterpolatedColorScale object.
        */
        public colorRange(): string[];
        public colorRange(colorRange: any): InterpolatedColorScale;
        /**
        * Gets or sets the internal scale type.
        *
        * @param {string} [scaleType]. If no argument is passed, returns the
        *     current scale type string. Otherwise, we set the internal scale
        *     using the d3 scale name. These scales must be quantitative scales,
        *     so the valid values are (linear/log/sqrt/pow).
        *
        * @returns the current scale type or this InterpolatedColorScale object.
        */
        public scaleType(): string;
        public scaleType(scaleType: string): InterpolatedColorScale;
    }
}


declare module Plottable {
    class ScaleDomainCoordinator {
        /**
        * Creates a ScaleDomainCoordinator.
        *
        * @constructor
        * @param {Scale[]} scales A list of scales whose domains should be linked.
        */
        constructor(scales: Scale[]);
        public rescale(scale: Scale): void;
    }
}


declare module Plottable {
    class Axis extends Component {
        static _DEFAULT_TICK_SIZE: number;
        /**
        * Creates an Axis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(axisScale: Scale, orientation: string, formatter?: any);
        public showEndTickLabels(): boolean;
        public showEndTickLabels(show: boolean): Axis;
        public scale(): Scale;
        public scale(newScale: Scale): Axis;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        * The exact consequences of particular tick label positionings depends on the subclass implementation.
        *
        * @param {string} [position] The relative position of the tick label.
        * @returns {string|Axis} The current tick label position, or the calling Axis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): Axis;
        public orient(): string;
        public orient(newOrient: string): Axis;
        public ticks(): any[];
        public ticks(...args: any[]): Axis;
        public tickValues(): any[];
        public tickValues(...args: any[]): Axis;
        public tickSize(): number;
        public tickSize(inner: number): Axis;
        public tickSize(inner: number, outer: number): Axis;
        public innerTickSize(): number;
        public innerTickSize(val: number): Axis;
        public outerTickSize(): number;
        public outerTickSize(val: number): Axis;
        public tickPadding(): number;
        public tickPadding(val: number): Axis;
        /**
        * Gets the current tick formatting function, or sets the tick formatting function.
        *
        * @param {(value: any) => string} [formatter] The new tick formatting function.
        * @returns The current tick formatting function, or the calling Axis.
        */
        public tickFormat(): (value: any) => string;
        public tickFormat(formatter: (value: any) => string): Axis;
    }
    class XAxis extends Axis {
        /**
        * Creates an XAxis (a horizontal Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Scale, orientation?: string, formatter?: any);
        public height(h: number): XAxis;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        *
        * @param {string} [position] The relative position of the tick label (left/center/right).
        * @returns {string|XAxis} The current tick label position, or the calling XAxis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): XAxis;
    }
    class YAxis extends Axis {
        /**
        * Creates a YAxis (a vertical Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Scale, orientation?: string, formatter?: any);
        public width(w: number): YAxis;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        *
        * @param {string} [position] The relative position of the tick label (top/middle/bottom).
        * @returns {string|YAxis} The current tick label position, or the calling YAxis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): YAxis;
    }
}


declare module Plottable {
    class BaseAxis extends Component {
        /**
        * Creates a BaseAxis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the BaseAxis on.
        * @param {string} orientation The orientation of the BaseAxis (top/bottom/left/right)
        * @param {(n: any) => string} [formatter] A function to format tick labels.
        */
        constructor(scale: Scale, orientation: string, formatter?: (n: any) => string);
        /**
        * Sets a new tick formatter.
        *
        * @param {(n: any) => string} formatter A function to format tick labels.
        * @returns {BaseAxis} The calling BaseAxis.
        */
        public formatter(formatFunction: (n: any) => string): BaseAxis;
        /**
        * Gets or sets the length of each tick mark.
        *
        * @param {number} [length] The length of each tick.
        * @returns {number|BaseAxis} The current tick mark length, or the calling BaseAxis.
        */
        public tickLength(): number;
        public tickLength(length: number): BaseAxis;
        /**
        * Gets or sets the padding between each tick mark and its associated label.
        *
        * @param {number} [length] The length of each tick.
        * @returns {number|BaseAxis} The current tick mark length, or the calling BaseAxis.
        */
        public tickLabelPadding(): number;
        public tickLabelPadding(padding: number): BaseAxis;
        public orient(): string;
        public orient(newOrientation: string): BaseAxis;
    }
}


declare module Plottable {
    class CategoryAxis extends BaseAxis {
        constructor(scale: OrdinalScale, orientation?: string);
    }
}


declare module Plottable {
    class Label extends Component {
        /**
        * Creates a Label.
        *
        * @constructor
        * @param {string} [text] The text of the Label.
        * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
        */
        constructor(text?: string, orientation?: string);
        /**
        * Sets the text on the Label.
        *
        * @param {string} text The new text for the Label.
        * @returns {Label} The calling Label.
        */
        public setText(text: string): Label;
    }
    class TitleLabel extends Label {
        constructor(text?: string, orientation?: string);
    }
    class AxisLabel extends Label {
        constructor(text?: string, orientation?: string);
    }
}


declare module Plottable {
    class Legend extends Component {
        /**
        * Creates a Legend.
        *
        * @constructor
        * @param {ColorScale} colorScale
        */
        constructor(colorScale?: ColorScale);
        /**
        * Assigns a new ColorScale to the Legend.
        *
        * @param {ColorScale} scale
        * @returns {Legend} The calling Legend.
        */
        public scale(scale: ColorScale): Legend;
        public scale(): ColorScale;
    }
}


declare module Plottable {
    class Gridlines extends Component {
        /**
        * Creates a set of Gridlines.
        * @constructor
        *
        * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
        * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
        */
        constructor(xScale: QuantitiveScale, yScale: QuantitiveScale);
    }
}


declare module Plottable {
    module AxisUtils {
        var ONE_DAY: number;
        /**
        * Generates a relative date axis formatter.
        *
        * @param {number} baseValue The start date (as epoch time) used in computing relative dates
        * @param {number} increment The unit used in calculating relative date tick values
        * @param {string} label The label to append to tick values
        */
        function generateRelativeDateFormatter(baseValue: number, increment?: number, label?: string): (tickValue: any) => string;
    }
}


declare module Plottable {
    class XYRenderer extends Renderer {
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): XYRenderer;
    }
}


declare module Plottable {
    class CircleRenderer extends XYRenderer {
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): CircleRenderer;
    }
}


declare module Plottable {
    class LineRenderer extends XYRenderer {
        /**
        * Creates a LineRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
    }
}


declare module Plottable {
    class RectRenderer extends XYRenderer {
        /**
        * Creates a RectRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
    }
}


declare module Plottable {
    class GridRenderer extends XYRenderer {
        /**
        * Creates a GridRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {OrdinalScale} yScale The y scale to use.
        * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
        *     cell.
        */
        constructor(dataset: any, xScale: OrdinalScale, yScale: OrdinalScale, colorScale: Scale);
        public project(attrToSet: string, accessor: any, scale?: Scale): GridRenderer;
    }
}


declare module Plottable {
    class AbstractBarRenderer extends XYRenderer {
        /**
        * Creates an AbstractBarRenderer.
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
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public baseline(value: number): AbstractBarRenderer;
        /**
        * Sets the bar alignment relative to the independent axis.
        * Behavior depends on subclass implementation.
        *
        * @param {string} alignment The desired alignment.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public barAlignment(alignment: string): AbstractBarRenderer;
        /**
        * Selects the bar under the given pixel position.
        *
        * @param {number} x The pixel x position.
        * @param {number} y The pixel y position.
        * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
        * @return {D3.Selection} The selected bar, or null if no bar was selected.
        */
        public selectBar(x: number, y: number, select?: boolean): D3.Selection;
        /**
        * Deselects all bars.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        public deselectAll(): AbstractBarRenderer;
    }
}


declare module Plottable {
    class BarRenderer extends AbstractBarRenderer {
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: QuantitiveScale);
        /**
        * Sets the horizontal alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (left/center/right).
        * @return {BarRenderer} The calling BarRenderer.
        */
        public barAlignment(alignment: string): BarRenderer;
    }
}


declare module Plottable {
    class HorizontalBarRenderer extends AbstractBarRenderer {
        /**
        * Creates a HorizontalBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: Scale);
        /**
        * Sets the vertical alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (top/middle/bottom).
        * @return {HorizontalBarRenderer} The calling HorizontalBarRenderer.
        */
        public barAlignment(alignment: string): HorizontalBarRenderer;
    }
}


declare module Plottable {
    class AreaRenderer extends XYRenderer {
        /**
        * Creates an AreaRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale);
    }
}


declare module Plottable {
    interface IKeyEventListenerCallback {
        (e: D3.Event): any;
    }
    class KeyEventListener {
        static initialize(): void;
        static addCallback(keyCode: number, cb: IKeyEventListenerCallback): void;
    }
}


declare module Plottable {
    class Interaction {
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


declare module Plottable {
    class ClickInteraction extends Interaction {
        /**
        * Creates a ClickInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for clicks on.
        */
        constructor(componentToListenTo: Component);
        /**
        * Sets an callback to be called when a click is received.
        *
        * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
        */
        public callback(cb: (x: number, y: number) => any): ClickInteraction;
    }
}


declare module Plottable {
    class MousemoveInteraction extends Interaction {
        constructor(componentToListenTo: Component);
        public mousemove(x: number, y: number): void;
    }
}


declare module Plottable {
    class KeyInteraction extends Interaction {
        /**
        * Creates a KeyInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for keypresses on.
        * @param {number} keyCode The key code to listen for.
        */
        constructor(componentToListenTo: Component, keyCode: number);
        /**
        * Sets an callback to be called when the designated key is pressed.
        *
        * @param {() => any} cb: Callback to be called.
        */
        public callback(cb: () => any): KeyInteraction;
    }
}


declare module Plottable {
    class PanZoomInteraction extends Interaction {
        /**
        * Creates a PanZoomInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
        * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
        */
        constructor(componentToListenTo: Component, xScale: QuantitiveScale, yScale: QuantitiveScale);
        public resetZoom(): void;
    }
}


declare module Plottable {
    class DragInteraction extends Interaction {
        public callbackToCall: (dragInfo: any) => any;
        /**
        * Creates a DragInteraction.
        *
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        constructor(componentToListenTo: Component);
        /**
        * Adds a callback to be called when the AreaInteraction triggers.
        *
        * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public callback(cb?: (a: any) => any): DragInteraction;
    }
}


declare module Plottable {
    class DragBoxInteraction extends DragInteraction {
        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public clearBox(): DragBoxInteraction;
        public setBox(x0: number, x1: number, y0: number, y1: number): DragBoxInteraction;
    }
}


declare module Plottable {
    class XDragBoxInteraction extends DragBoxInteraction {
        public setBox(x0: number, x1: number): XDragBoxInteraction;
    }
}


declare module Plottable {
    class XYDragBoxInteraction extends DragBoxInteraction {
    }
}


declare module Plottable {
    interface IPixelArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    function setupDragBoxZoom(dragBox: XYDragBoxInteraction, xScale: QuantitiveScale, yScale: QuantitiveScale): void;
}


declare module Plottable {
    class StandardChart extends Table {
        constructor();
        public yAxis(y: YAxis): StandardChart;
        public yAxis(): YAxis;
        public xAxis(x: XAxis): StandardChart;
        public xAxis(): XAxis;
        public yLabel(y: AxisLabel): StandardChart;
        public yLabel(y: string): StandardChart;
        public yLabel(): AxisLabel;
        public xLabel(x: AxisLabel): StandardChart;
        public xLabel(x: string): StandardChart;
        public xLabel(): AxisLabel;
        public titleLabel(x: TitleLabel): StandardChart;
        public titleLabel(x: string): StandardChart;
        public titleLabel(): TitleLabel;
        public center(c: Component): StandardChart;
    }
}
