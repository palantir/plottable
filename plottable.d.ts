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
        function sortedIndex(val: number, arr: any[], accessor: Plottable.IAccessor): number;
    }
}
declare module Plottable {
    class Component {
        private static clipPathId;
        public element: D3.Selection;
        public content: D3.Selection;
        private hitBox;
        private interactionsToRegister;
        private boxes;
        private boxContainer;
        public backgroundContainer: D3.Selection;
        public foregroundContainer: D3.Selection;
        public clipPathEnabled: boolean;
        public fixedWidthVal: boolean;
        public fixedHeightVal: boolean;
        private rowMinimumVal;
        private colMinimumVal;
        private isTopLevelComponent;
        public availableWidth: number;
        public availableHeight: number;
        public xOrigin: number;
        public yOrigin: number;
        private xOffsetVal;
        private yOffsetVal;
        public xAlignProportion: number;
        public yAlignProportion: number;
        private cssClasses;
        /**
        * Attaches the Component to a DOM element. Usually only directly invoked on root-level Components.
        *
        * @param {D3.Selection} element A D3 selection consisting of the element to anchor to.
        * @returns {Component} The calling component.
        */
        public anchor(element: D3.Selection): Component;
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
        public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Component;
        /**
        * Renders the component.
        *
        * @returns {Component} The calling Component.
        */
        public render(): Component;
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
        private addBox(className?, parentElement?);
        private generateClipPath();
        /**
        * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
        *
        * @param {Interaction} interaction The Interaction to attach to the Component.
        * @return {Component} The calling Component.
        */
        public registerInteraction(interaction: Plottable.Interaction): Component;
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
    }
}
declare module Plottable {
    class Scale implements Plottable.IBroadcaster {
        public scale: D3.Scale.Scale;
        private broadcasterCallbacks;
        /**
        * Creates a new Scale.
        * @constructor
        * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
        */
        constructor(scale: D3.Scale.Scale);
        /**
        * Retrieves the current domain, or sets the Scale's domain to the specified values.
        * @param {any[]} [values] The new value for the domain.
        * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
        */
        public domain(): any[];
        public domain(values: any[]): Scale;
        /**
        * Retrieves the current range, or sets the Scale's range to the specified values.
        * @param {any[]} [values] The new value for the range.
        * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
        */
        public range(): any[];
        public range(values: any[]): Scale;
        /**
        * Creates a copy of the Scale with the same domain and range but without any registered listeners.
        * @returns {Scale} A copy of the calling Scale.
        */
        public copy(): Scale;
        /**
        * Registers a callback to be called when the scale's domain is changed.
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Scale} The Calling Scale.
        */
        public registerListener(callback: Plottable.IBroadcasterCallback): Scale;
    }
    class QuantitiveScale extends Scale {
        public scale: D3.Scale.QuantitiveScale;
        /**
        * Creates a new QuantitiveScale.
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        constructor(scale: D3.Scale.QuantitiveScale);
        /**
        * Retrieves the domain value corresponding to a supplied range value.
        * @param {number} value: A value from the Scale's range.
        * @returns {number} The domain value corresponding to the supplied range value.
        */
        public invert(value: number): number;
        /**
        * Generates tick values.
        * @param {number} count The number of ticks to generate.
        * @returns {any[]} The generated ticks.
        */
        public ticks(count: number): any[];
        /**
        * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
        * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
        */
        public copy(): QuantitiveScale;
        /**
        * Expands the QuantitiveScale's domain to cover the new region.
        * @param {number} newDomain The additional domain to be covered by the QuantitiveScale.
        * @returns {QuantitiveScale} The scale.
        */
        public widenDomain(newDomain: number[]): QuantitiveScale;
    }
    class LinearScale extends QuantitiveScale {
        /**
        * Creates a new LinearScale.
        * @constructor
        * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
        */
        constructor();
        constructor(scale: D3.Scale.LinearScale);
        /**
        * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
        * @returns {LinearScale} A copy of the calling LinearScale.
        */
        public copy(): LinearScale;
    }
    class ColorScale extends Scale {
        /**
        * Creates a ColorScale.
        * @constructor
        * @param {string} [scaleType] the type of color scale to create (Category10/Category20/Category20b/Category20c)
        */
        constructor(scaleType?: string);
    }
}
declare module Plottable {
    class Interaction {
        public hitBox: D3.Selection;
        public componentToListenTo: Plottable.Component;
        /**
        * Creates an Interaction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        constructor(componentToListenTo: Plottable.Component);
        public anchor(hitBox: D3.Selection): void;
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
        private zoom;
        public xScale: Plottable.QuantitiveScale;
        public yScale: Plottable.QuantitiveScale;
        /**
        * Creates a PanZoomInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
        * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
        */
        constructor(componentToListenTo: Plottable.Component, xScale: Plottable.QuantitiveScale, yScale: Plottable.QuantitiveScale);
        public anchor(hitBox: D3.Selection): void;
        private rerenderZoomed();
    }
    class AreaInteraction extends Interaction {
        private static CLASS_DRAG_BOX;
        private dragInitialized;
        private dragBehavior;
        private origin;
        private location;
        private constrainX;
        private constrainY;
        private dragBox;
        private callbackToCall;
        /**
        * Creates an AreaInteraction.
        *
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        constructor(componentToListenTo: Plottable.Component);
        /**
        * Adds a callback to be called when the AreaInteraction triggers.
        *
        * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public callback(cb?: (a: Plottable.SelectionArea) => any): AreaInteraction;
        private dragstart();
        private drag();
        private dragend();
        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        public clearBox(): AreaInteraction;
        public anchor(hitBox: D3.Selection): AreaInteraction;
    }
    class ZoomCallbackGenerator {
        private xScaleMappings;
        private yScaleMappings;
        /**
        * Adds listen-update pair of X scales.
        *
        * @param {QuantitiveScale} listenerScale An X scale to listen for events on.
        * @param {QuantitiveScale} [targetScale] An X scale to update when events occur.
        * If not supplied, listenerScale will be updated when an event occurs.
        * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
        */
        public addXScale(listenerScale: Plottable.QuantitiveScale, targetScale?: Plottable.QuantitiveScale): ZoomCallbackGenerator;
        /**
        * Adds listen-update pair of Y scales.
        *
        * @param {QuantitiveScale} listenerScale A Y scale to listen for events on.
        * @param {QuantitiveScale} [targetScale] A Y scale to update when events occur.
        * If not supplied, listenerScale will be updated when an event occurs.
        * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
        */
        public addYScale(listenerScale: Plottable.QuantitiveScale, targetScale?: Plottable.QuantitiveScale): ZoomCallbackGenerator;
        private updateScale(referenceScale, targetScale, pixelMin, pixelMax);
        /**
        * Generates a callback that can be passed to Interactions.
        *
        * @returns {(area: SelectionArea) => void} A callback that updates the scales previously specified.
        */
        public getCallback(): (area: Plottable.SelectionArea) => void;
    }
    class MousemoveInteraction extends Interaction {
        constructor(componentToListenTo: Plottable.Component);
        public anchor(hitBox: D3.Selection): void;
        public mousemove(x: number, y: number): void;
    }
    class CrosshairsInteraction extends MousemoveInteraction {
        private renderer;
        private circle;
        private xLine;
        private yLine;
        constructor(renderer: Plottable.XYRenderer);
        public anchor(hitBox: D3.Selection): void;
        public mousemove(x: number, y: number): void;
    }
}
declare module Plottable {
    class Label extends Plottable.Component {
        private static CSS_CLASS;
        private textElement;
        private text;
        private orientation;
        private textLength;
        private textHeight;
        /**
        * Creates a Label.
        *
        * @constructor
        * @param {string} [text] The text of the Label.
        * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
        */
        constructor(text?: string, orientation?: string);
        public anchor(element: D3.Selection): Label;
        /**
        * Sets the text on the Label.
        *
        * @param {string} text The new text for the Label.
        * @returns {Label} The calling Label.
        */
        public setText(text: string): Label;
        private measureAndSetTextSize();
        private truncateTextAndRemeasure(availableLength);
        public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Label;
    }
    class TitleLabel extends Label {
        private static CSS_CLASS;
        constructor(text?: string, orientation?: string);
    }
    class AxisLabel extends Label {
        private static CSS_CLASS;
        constructor(text?: string, orientation?: string);
    }
}
declare module Plottable {
    class Renderer extends Plottable.Component {
        private static CSS_CLASS;
        public dataset: Plottable.IDataset;
        public renderArea: D3.Selection;
        public element: D3.Selection;
        public scales: Plottable.Scale[];
        /**
        * Creates a Renderer.
        *
        * @constructor
        * @param {IDataset} [dataset] The dataset associated with the Renderer.
        */
        constructor(dataset?: Plottable.IDataset);
        /**
        * Sets a new dataset on the Renderer.
        *
        * @param {IDataset} dataset The new dataset to be associated with the Renderer.
        * @returns {Renderer} The calling Renderer.
        */
        public data(dataset: Plottable.IDataset): Renderer;
        public anchor(element: D3.Selection): Renderer;
    }
    interface IAccessor {
        (d: any): number;
    }
    class XYRenderer extends Renderer {
        private static CSS_CLASS;
        public dataSelection: D3.UpdateSelection;
        private static defaultXAccessor;
        private static defaultYAccessor;
        public xScale: Plottable.QuantitiveScale;
        public yScale: Plottable.QuantitiveScale;
        public xAccessor: IAccessor;
        public yAccessor: IAccessor;
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        */
        constructor(dataset: Plottable.IDataset, xScale: Plottable.QuantitiveScale, yScale: Plottable.QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
        public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): XYRenderer;
        /**
        * Converts a SelectionArea with pixel ranges to one with data ranges.
        *
        * @param {SelectionArea} pixelArea The selected area, in pixels.
        * @returns {SelectionArea} The corresponding selected area in the domains of the scales.
        */
        public invertXYSelectionArea(pixelArea: Plottable.SelectionArea): Plottable.SelectionArea;
        /**
        * Gets the data in a selected area.
        *
        * @param {SelectionArea} dataArea The selected area.
        * @returns {D3.UpdateSelection} The data in the selected area.
        */
        public getSelectionFromArea(dataArea: Plottable.SelectionArea): D3.UpdateSelection;
        /**
        * Gets the indices of data in a selected area
        *
        * @param {SelectionArea} dataArea The selected area.
        * @returns {number[]} An array of the indices of datapoints in the selected area.
        */
        public getDataIndicesFromArea(dataArea: Plottable.SelectionArea): number[];
        private rescale();
    }
    class LineRenderer extends XYRenderer {
        private static CSS_CLASS;
        private path;
        private line;
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
        constructor(dataset: Plottable.IDataset, xScale: Plottable.QuantitiveScale, yScale: Plottable.QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
        public anchor(element: D3.Selection): LineRenderer;
        public render(): LineRenderer;
    }
    class CircleRenderer extends XYRenderer {
        private static CSS_CLASS;
        public size: number;
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
        * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
        * @param {number} [size] The radius of the circles, in pixels.
        */
        constructor(dataset: Plottable.IDataset, xScale: Plottable.QuantitiveScale, yScale: Plottable.QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor, size?: number);
        public render(): CircleRenderer;
    }
    class BarRenderer extends XYRenderer {
        private static CSS_CLASS;
        private static defaultX2Accessor;
        public barPaddingPx: number;
        public x2Accessor: IAccessor;
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
        * @param {IAccessor} [x2Accessor] A function for extracting the end position of each bar from the data.
        * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
        */
        constructor(dataset: Plottable.IDataset, xScale: Plottable.QuantitiveScale, yScale: Plottable.QuantitiveScale, xAccessor?: IAccessor, x2Accessor?: IAccessor, yAccessor?: IAccessor);
        public render(): BarRenderer;
    }
}
declare module Plottable {
    class Table extends Plottable.Component {
        private static CSS_CLASS;
        private rowPadding;
        private colPadding;
        private rows;
        private rowMinimums;
        private colMinimums;
        private rowWeights;
        private colWeights;
        /**
        * Creates a Table.
        *
        * @constructor
        * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
        * null can be used if a cell is empty.
        */
        constructor(rows?: Plottable.Component[][]);
        /**
        * Adds a Component in the specified cell.
        *
        * @param {number} row The row in which to add the Component.
        * @param {number} col The column in which to add the Component.
        * @param {Component} component The Component to be added.
        */
        public addComponent(row: number, col: number, component: Plottable.Component): Table;
        private padTableToSize(nRows, nCols);
        public anchor(element: D3.Selection): Table;
        public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Table;
        private static calcComponentWeights(setWeights, componentGroups, fixityAccessor);
        private static calcProportionalSpace(weights, freeSpace);
        public render(): Table;
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
        private static fixedSpace(componentGroup, fixityAccessor);
        public isFixedWidth(): boolean;
        public isFixedHeight(): boolean;
    }
}
declare module Plottable {
    class ScaleDomainCoordinator {
        private rescaleInProgress;
        private scales;
        /**
        * Creates a ScaleDomainCoordinator.
        *
        * @constructor
        * @param {Scale[]} scales A list of scales whose domains should be linked.
        */
        constructor(scales: Plottable.Scale[]);
        public rescale(scale: Plottable.Scale): void;
    }
}
declare module Plottable {
    class Legend extends Plottable.Component {
        private static CSS_CLASS;
        private static SUBELEMENT_CLASS;
        private static MARGIN;
        private colorScale;
        private maxWidth;
        /**
        * Creates a Legend.
        *
        * @constructor
        * @param {ColorScale} colorScale
        */
        constructor(colorScale?: Plottable.ColorScale);
        /**
        * Assigns a new ColorScale to the Legend.
        *
        * @param {ColorScale} scale
        * @returns {Legend} The calling Legend.
        */
        public scale(scale: Plottable.ColorScale): Legend;
        public rowMinimum(): number;
        public rowMinimum(newVal: number): Legend;
        private measureTextHeight();
        public render(): Legend;
    }
}
declare module Plottable {
    class Axis extends Plottable.Component {
        private static CSS_CLASS;
        private scale;
        private orientation;
        private formatter;
        static yWidth: number;
        static xHeight: number;
        public axisElement: D3.Selection;
        public d3axis: D3.Svg.Axis;
        private cachedScale;
        private cachedTranslate;
        private isXAligned;
        /**
        * Creates an Axis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Plottable.Scale, orientation: string, formatter?: any);
        public anchor(element: D3.Selection): Axis;
        private transformString(translate, scale);
        public render(): Axis;
        private rescale();
    }
    class XAxis extends Axis {
        /**
        * Creates an XAxis (a horizontal Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Plottable.Scale, orientation: string, formatter?: any);
    }
    class YAxis extends Axis {
        /**
        * Creates a YAxis (a vertical Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Plottable.Scale, orientation: string, formatter?: any);
    }
}
declare module Plottable {
    class ComponentGroup extends Plottable.Component {
        private components;
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        constructor(components?: Plottable.Component[]);
        /**
        * Adds a Component to the ComponentGroup.
        *
        * @param {Component} c The Component to add.
        * @returns {ComponentGroup} The calling ComponentGroup.
        */
        public addComponent(c: Plottable.Component): ComponentGroup;
        public anchor(element: D3.Selection): ComponentGroup;
        public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): ComponentGroup;
        public render(): ComponentGroup;
        public isFixedWidth(): boolean;
        public isFixedHeight(): boolean;
    }
}
declare module Plottable {
    interface IDataset {
        data: any[];
        seriesName: string;
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
