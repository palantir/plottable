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
        Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
        Reporters & Editors
        
        Permission is hereby granted, free of charge, to any person
        obtaining a copy of this software and associated documentation
        files (the "Software"), to deal in the Software without
        restriction, including without limitation the rights to use,
        copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the
        Software is furnished to do so, subject to the following
        conditions:
        
        The above copyright notice and this permission notice shall be
        included in all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
        HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
        WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
        OTHER DEALINGS IN THE SOFTWARE.
        */
        function sortedIndex(val: number, arr: number[]): number;
        function sortedIndex(val: number, arr: any[], accessor: IAccessor): number;
    }
}
declare module Plottable {
    class Component {
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
        public renderTo(element: D3.Selection): Component;
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
        public rowMinimum(): number;
        public rowMinimum(newVal: number): Component;
        /**
        * Sets or retrieves the Component's minimum width.
        *
        * @param {number} [newVal] The new value for the Component's minimum width, in pixels.
        * @return {number|Component} The current minimum width, or the calling Component (if newVal is not supplied).
        */
        public colMinimum(): number;
        public colMinimum(newVal: number): Component;
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
    }
}
declare module Plottable {
    class Scale implements IBroadcaster {
        /**
        * Creates a new Scale.
        *
        * @constructor
        * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
        */
        constructor(scale: D3.Scale.Scale);
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
        * @param {any[]} [values] The new value for the domain.
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
        /**
        * Registers a callback to be called when the scale's domain is changed.
        *
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Scale} The Calling Scale.
        */
        public registerListener(callback: IBroadcasterCallback): Scale;
        /**
        * Expands the Scale's domain to cover the data given.
        * Passes an accessor through to the native d3 code.
        *
        * @param data The data to operate on.
        * @param [accessor] The accessor to get values out of the data
        * @returns {Scale} The Scale.
        */
        public widenDomainOnData(data: any[], accessor?: IAccessor): Scale;
    }
    class OrdinalScale extends Scale {
        /**
        * Creates a new OrdinalScale. Domain and Range are set later.
        *
        * @constructor
        */
        constructor();
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
        public rangeBand(): number;
        /**
        * Returns the range type, or sets the range type.
        *
        * @param {string} [rangeType] Either "points" or "bands" indicating the d3 method used to generate range bounds.
        * @returns {string|OrdinalScale} The current range type, or the calling OrdinalScale.
        */
        public rangeType(): string;
        public rangeType(rangeType: string): OrdinalScale;
        public widenDomainOnData(data: any[], accessor?: IAccessor): OrdinalScale;
    }
    class QuantitiveScale extends Scale {
        /**
        * Creates a new QuantitiveScale.
        *
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        constructor(scale: D3.Scale.QuantitiveScale);
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
        /**
        * Expands the QuantitiveScale's domain to cover the new region.
        *
        * @param {number[]} newDomain The additional domain to be covered by the QuantitiveScale.
        * @returns {QuantitiveScale} The scale.
        */
        public widenDomain(newDomain: number[]): QuantitiveScale;
        /**
        * Expands the QuantitiveScale's domain to cover the data given.
        * Passes an accessor through to the native d3 code.
        *
        * @param data The data to operate on.
        * @param [accessor] The accessor to get values out of the data.
        * @returns {QuantitiveScale} The scale.
        */
        public widenDomainOnData(data: any[], accessor?: IAccessor): QuantitiveScale;
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
    class ColorScale extends Scale {
        /**
        * Creates a ColorScale.
        *
        * @constructor
        * @param {string} [scaleType] the type of color scale to create (Category10/Category20/Category20b/Category20c)
        */
        constructor(scaleType?: string);
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
    interface ZoomInfo {
        translate: number[];
        scale: number[];
    }
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
    class AreaInteraction extends Interaction {
        /**
        * Creates an AreaInteraction.
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
        public callback(cb?: (a: SelectionArea) => any): AreaInteraction;
        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public clearBox(): AreaInteraction;
    }
    class ZoomCallbackGenerator {
        /**
        * Adds listen-update pair of X scales.
        *
        * @param {QuantitiveScale} listenerScale An X scale to listen for events on.
        * @param {QuantitiveScale} [targetScale] An X scale to update when events occur.
        * If not supplied, listenerScale will be updated when an event occurs.
        * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
        */
        public addXScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator;
        /**
        * Adds listen-update pair of Y scales.
        *
        * @param {QuantitiveScale} listenerScale A Y scale to listen for events on.
        * @param {QuantitiveScale} [targetScale] A Y scale to update when events occur.
        * If not supplied, listenerScale will be updated when an event occurs.
        * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
        */
        public addYScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator;
        /**
        * Generates a callback that can be passed to Interactions.
        *
        * @returns {(area: SelectionArea) => void} A callback that updates the scales previously specified.
        */
        public getCallback(): (area: SelectionArea) => void;
    }
    class MousemoveInteraction extends Interaction {
        constructor(componentToListenTo: Component);
        public mousemove(x: number, y: number): void;
    }
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
    class CrosshairsInteraction extends MousemoveInteraction {
        constructor(renderer: NumericXYRenderer);
        public mousemove(x: number, y: number): void;
        public rescale(): void;
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
    class Renderer extends Component {
        public renderArea: D3.Selection;
        public element: D3.Selection;
        public scales: Scale[];
        /**
        * Creates a Renderer.
        *
        * @constructor
        * @param {IDataset} [dataset] The dataset associated with the Renderer.
        */
        constructor(dataset?: any);
        /**
        * Sets a new dataset on the Renderer.
        *
        * @param {IDataset} dataset The new dataset to be associated with the Renderer.
        * @returns {Renderer} The calling Renderer.
        */
        public dataset(dataset: IDataset): Renderer;
        public metadata(metadata: IMetadata): Renderer;
        public data(data: any[]): Renderer;
        public colorAccessor(a: IAccessor): Renderer;
        public autorange(): Renderer;
    }
}
declare module Plottable {
    class XYRenderer extends Renderer {
        public dataSelection: D3.UpdateSelection;
        public xScale: Scale;
        public yScale: Scale;
        public autorangeDataOnLayout: boolean;
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        */
        constructor(dataset: any, xScale: Scale, yScale: Scale, xAccessor?: IAccessor, yAccessor?: IAccessor);
        public xAccessor(accessor: any): XYRenderer;
        public yAccessor(accessor: any): XYRenderer;
        /**
        * Autoranges the scales over the data.
        * Actual behavior is dependent on the scales.
        */
        public autorange(): XYRenderer;
    }
}
declare module Plottable {
    class NumericXYRenderer extends XYRenderer {
        public dataSelection: D3.UpdateSelection;
        public xScale: QuantitiveScale;
        public yScale: QuantitiveScale;
        public autorangeDataOnLayout: boolean;
        /**
        * Creates an NumericXYRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
        /**
        * Converts a SelectionArea with pixel ranges to one with data ranges.
        *
        * @param {SelectionArea} pixelArea The selected area, in pixels.
        * @returns {SelectionArea} The corresponding selected area in the domains of the scales.
        */
        public invertXYSelectionArea(pixelArea: SelectionArea): SelectionArea;
        /**
        * Gets the data in a selected area.
        *
        * @param {SelectionArea} dataArea The selected area.
        * @returns {D3.UpdateSelection} The data in the selected area.
        */
        public getSelectionFromArea(dataArea: SelectionArea): D3.UpdateSelection;
        /**
        * Gets the indices of data in a selected area
        *
        * @param {SelectionArea} dataArea The selected area.
        * @returns {number[]} An array of the indices of datapoints in the selected area.
        */
        public getDataIndicesFromArea(dataArea: SelectionArea): number[];
    }
}
declare module Plottable {
    class CircleRenderer extends NumericXYRenderer {
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        * @param {IAccessor} [rAccessor] A function for extracting radius values from the data.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: any, yAccessor?: any, rAccessor?: any);
        public rAccessor(a: any): CircleRenderer;
    }
}
declare module Plottable {
    class LineRenderer extends NumericXYRenderer {
        /**
        * Creates a LineRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    }
}
declare module Plottable {
    class BarRenderer extends NumericXYRenderer {
        public barPaddingPx: number;
        public dxAccessor: any;
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
        * @param {IAccessor} [dxAccessor] A function for extracting the width of each bar from the data.
        * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, dxAccessor?: IAccessor, yAccessor?: IAccessor);
        public autorange(): BarRenderer;
    }
}
declare module Plottable {
    class SquareRenderer extends NumericXYRenderer {
        /**
        * Creates a SquareRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        * @param {IAccessor} [rAccessor] A function for extracting radius values from the data.
        */
        constructor(dataset: any, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor, rAccessor?: IAccessor);
        public rAccessor(a: any): SquareRenderer;
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
        public rowMinimum(): number;
        public rowMinimum(newVal: number): Table;
        public colMinimum(): number;
        public colMinimum(newVal: number): Table;
        public isFixedWidth(): boolean;
        public isFixedHeight(): boolean;
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
        public rowMinimum(): number;
        public rowMinimum(newVal: number): Legend;
    }
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
        public addCenterComponent(c: Component): StandardChart;
    }
}
declare module Plottable {
    class CategoryXYRenderer extends XYRenderer {
        public dataSelection: D3.UpdateSelection;
        public xScale: OrdinalScale;
        public yScale: QuantitiveScale;
        /**
        * Creates a CategoryXYRenderer with an Ordinal x scale and Quantitive y scale.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        */
        constructor(dataset: any, xScale: OrdinalScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    }
}
declare module Plottable {
    class CategoryBarRenderer extends CategoryXYRenderer {
        /**
        * Creates a CategoryBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
        * @param {IAccessor} [widthAccessor] A function for extracting the width position of each bar, in pixels, from the data.
        * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
        */
        constructor(dataset: any, xScale: OrdinalScale, yScale: QuantitiveScale, xAccessor?: IAccessor, widthAccessor?: IAccessor, yAccessor?: IAccessor);
        /**
        * Sets the width accessor.
        *
        * @param {any} accessor The new width accessor.
        * @returns {CategoryBarRenderer} The calling CategoryBarRenderer.
        */
        public widthAccessor(accessor: any): CategoryBarRenderer;
        public autorange(): CategoryBarRenderer;
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
        */
        public deselectAll(): void;
    }
}
declare module Plottable {
    class Axis extends Component {
        static yWidth: number;
        static xHeight: number;
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
        (broadcaster: IBroadcaster, ...args: any[]): any;
    }
    interface IBroadcaster {
        registerListener: (cb: IBroadcasterCallback) => IBroadcaster;
    }
}
