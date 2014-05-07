declare module Plottable {
    module Utils {
        /**
        * Checks if x is between a and b.
        */
        function inRange(x: number, a: number, b: number): boolean;
        /**
        * Gets the bounding box of an element.
        * @param {D3.Selection} element
        * @returns {SVGRed} The bounding box.
        */
        function getBBox(element: D3.Selection): SVGRect;
        function getElementWidth(elem: HTMLScriptElement): number;
        function getElementHeight(elem: HTMLScriptElement): number;
        /**
        * Truncates a text string to a max length, given the element in which to draw the text
        *
        * @param {string} text: The string to put in the text element, and truncate
        * @param {D3.Selection} element: The element in which to measure and place the text
        * @param {number} length: How much space to truncate text into
        * @returns {string} text - the shortened text
        */
        function truncateTextToLength(text: string, length: number, element: D3.Selection): string;
        /**
        * Gets the height of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The height of the text element, in pixels.
        */
        function getTextHeight(textElement: D3.Selection): number;
        function getSVGPixelWidth(svg: D3.Selection): number;
        function accessorize(accessor: any): IAccessor;
        function applyAccessor(accessor: IAccessor, dataSource: DataSource): (d: any, i: number) => any;
        function uniq(strings: string[]): string[];
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
        class IDCounter {
            public increment(id: any): number;
            public decrement(id: any): number;
            public get(id: any): number;
        }
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
        * Call all listening callbacks, optionally with arguments passed through.
        *
        * @param ...args A variable number of optional arguments
        * @returns {Broadcaster} this object
        */
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
        public element: D3.Selection;
        public content: D3.Selection;
        public backgroundContainer: D3.Selection;
        public foregroundContainer: D3.Selection;
        public clipPathEnabled: boolean;
        public availableWidth: number;
        public availableHeight: number;
        public xOrigin: number;
        public yOrigin: number;
        /**
        * Attaches the Component to a DOM element. Usually only directly invoked on root-level Components.
        *
        * @param {D3.Selection} element A D3 selection consisting of the element to anchor to.
        * @returns {Component} The calling component.
        */
        /**
        * Computes the size, position, and alignment from the specified values.
        * If no parameters are supplied and the component is a root node,
        * they are inferred from the size of the component's element.
        *
        * @param {number} xOrigin
        * @param {number} yOrigin
        * @param {number} availableWidth
        * @param {number} availableHeight
        * @returns {Component} The calling Component.
        */
        /**
        * Renders the component.
        *
        * @returns {Component} The calling Component.
        */
        public renderTo(element: any): Component;
        /**
        * Cause the Component to recompute layout and redraw. Useful if the window resized.
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
        * Sets or retrieves the Component's minimum height.
        *
        * @param {number} [newVal] The new value for the Component's minimum height, in pixels.
        * @return {number|Component} The current minimum height, or the calling Component (if newVal is not supplied).
        */
        public minimumHeight(): number;
        public minimumHeight(newVal: number): Component;
        /**
        * Sets or retrieves the Component's minimum width.
        *
        * @param {number} [newVal] The new value for the Component's minimum width, in pixels.
        * @return {number|Component} The current minimum width, or the calling Component (if newVal is not supplied).
        */
        public minimumWidth(): number;
        public minimumWidth(newVal: number): Component;
        /**
        * Checks if the Component has a fixed width or scales to fill available space.
        * Returns true by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed width.
        */
        public isFixedWidth(): boolean;
        /**
        * Checks if the Component has a fixed height or scales to fill available space.
        * Returns true by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed height.
        */
        public isFixedHeight(): boolean;
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
        * Blow up a component and its DOM, so it can be safely removed
        */
        public remove(): void;
    }
}
declare module Plottable {
    class ComponentGroup extends Component {
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        constructor(components?: Component[]);
        public merge(c: Component): ComponentGroup;
        public isFixedWidth(): boolean;
        public isFixedHeight(): boolean;
        public remove(): void;
    }
}
declare module Plottable {
    class Table extends Component {
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
        public minimumHeight(): number;
        public minimumHeight(newVal: number): Table;
        public minimumWidth(): number;
        public minimumWidth(newVal: number): Table;
        public isFixedWidth(): boolean;
        public isFixedHeight(): boolean;
        public remove(): void;
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
        public renderArea: D3.Selection;
        public element: D3.Selection;
        public scales: Scale[];
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
        public animate(toggle?: boolean): Renderer;
    }
}
declare module Plottable {
    class RenderController {
        static enabled: boolean;
        static registerToRender(c: Component): void;
        static doRender(): void;
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
        /**
        * Pads out the domain of the scale by a specified ratio.
        *
        * @param {number} [padProportion] Proportionally how much bigger the new domain should be (0.05 = 5% larger)
        * @returns {QuantitiveScale} The calling QuantitiveScale.
        */
        public padDomain(padProportion?: number): QuantitiveScale;
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
        constructor();
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
        * Converts the string array into a d3 scale.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        * @param {string} scaleType a string representing the underlying scale
        *     type (linear/log/sqrt/pow)
        * @returns a quantitive d3 scale.
        */
        /**
        * Creates a d3 interpolator given the color array.
        *
        * d3 doesn't accept more than 2 range values unless we use a ordinal
        * scale. So, in order to interpolate smoothly between the full color
        * range, we must override the interpolator and compute the color values
        * manually.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        */
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
        public minimumHeight(): number;
        public minimumHeight(newVal: number): Legend;
    }
}
declare module Plottable {
    class XYRenderer extends Renderer {
        public dataSelection: D3.UpdateSelection;
        public xScale: Scale;
        public yScale: Scale;
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
    class SquareRenderer extends XYRenderer {
        /**
        * Creates a SquareRenderer.
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
        public colorScale: Scale;
        public xScale: OrdinalScale;
        public yScale: OrdinalScale;
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
        public xScale: QuantitiveScale;
        public yScale: QuantitiveScale;
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
        public origin: number[];
        public location: number[];
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
        public dragBox: D3.Selection;
        public boxIsDrawn: boolean;
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
declare module Plottable {
    class Axis extends Component {
        static Y_WIDTH: number;
        static X_HEIGHT: number;
        public axisElement: D3.Selection;
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
        constructor(scale: Scale, orientation: string, formatter?: any);
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
        constructor(scale: Scale, orientation: string, formatter?: any);
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
}
