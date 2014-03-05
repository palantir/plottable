/// <reference path="typings/d3/d3.d.ts" />
/// <reference path="src/interfaces.d.ts" />
declare module Utils {
    function inRange(x: number, a: number, b: number): boolean;
    function getBBox(element: D3.Selection): SVGRect;
    /** Truncates a text string to a max length, given the element in which to draw the text
    * @param {string} text: The string to put in the text element, and truncate
    * @param {D3.Selection} element: The element in which to measure and place the text
    * @param {number} length: How much space to truncate text into
    * @returns {string} text - the shortened text
    */
    function truncateTextToLength(text: string, length: number, element: D3.Selection): string;
    function getTextHeight(textElement: D3.Selection): number;
}
declare class Component {
    private static clipPathId;
    public element: D3.Selection;
    public hitBox: D3.Selection;
    private registeredInteractions;
    private boxes;
    public clipPathEnabled: boolean;
    public fixedWidthVal: boolean;
    public fixedHeightVal: boolean;
    private rowMinimumVal;
    private colMinimumVal;
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
    * @param {D3.Selection} element A D3 selection consisting of the element to anchor to.
    * @returns {Component} The calling component.
    */
    public anchor(element: D3.Selection): Component;
    /**
    * Computes the size, position, and alignment from the specified values.
    * If no parameters are supplied and the component is a root node,
    * they are inferred from the size of the component's element.
    * @param {number} xOrigin
    * @param {number} yOrigin
    * @param {number} availableWidth
    * @param {number} availableHeight
    * @returns {Component} The calling Component.
    */
    public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Component;
    /**
    * Renders the component.
    * @returns {Component} The calling Component.
    */
    public render(): Component;
    public renderTo(element: D3.Selection): Component;
    /**
    * Sets the x alignment of the Component.
    * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
    * @returns {Component} The calling Component.
    */
    public xAlign(alignment: string): Component;
    /**
    * Sets the y alignment of the Component.
    * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
    * @returns {Component} The calling Component.
    */
    public yAlign(alignment: string): Component;
    /**
    * Sets the x offset of the Component.
    * @param {number} offset The desired x offset, in pixels.
    * @returns {Component} The calling Component.
    */
    public xOffset(offset: number): Component;
    /**
    * Sets the y offset of the Component.
    * @param {number} offset The desired y offset, in pixels.
    * @returns {Component} The calling Component.
    */
    public yOffset(offset: number): Component;
    private addBox(className?, parentElement?);
    private generateClipPath();
    /**
    * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
    * @param {Interaction} interaction The Interaction to attach to the Component.
    * @return {Component} The calling Component.
    */
    public registerInteraction(interaction: Interaction): Component;
    /**
    * Adds/removes a given CSS class to/from the Component, or checks if the Component has a particular CSS class.
    * @param {string} cssClass The CSS class to add/remove/check for.
    * @param {boolean} [addClass] Whether to add or remove the CSS class. If not supplied, checks for the CSS class.
    * @return {boolean|Component} Whether the Component has the given CSS class, or the calling Component (if addClass is supplied).
    */
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    /**
    * Sets or retrieves the Component's minimum height.
    * @param {number} [newVal] The new value for the Component's minimum height, in pixels.
    * @return {number|Component} The current minimum height, or the calling Component (if newVal is not supplied).
    */
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    /**
    * Sets or retrieves the Component's minimum width.
    * @param {number} [newVal] The new value for the Component's minimum width, in pixels.
    * @return {number|Component} The current minimum width, or the calling Component (if newVal is not supplied).
    */
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    public isFixedWidth(): boolean;
    public isFixedHeight(): boolean;
}
declare class Scale implements IBroadcaster {
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
    public registerListener(callback: IBroadcasterCallback): Scale;
}
declare class QuantitiveScale extends Scale {
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
declare class LinearScale extends QuantitiveScale {
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
declare class ColorScale extends Scale {
    /**
    * Creates a ColorScale.
    * @constructor
    * @param {string} [scaleType] the type of color scale to create (Category10/Category20/Category20b/Category20c)
    */
    constructor(scaleType?: string);
}
declare class Interaction {
    public hitBox: D3.Selection;
    public componentToListenTo: Component;
    constructor(componentToListenTo: Component);
    public anchor(hitBox: D3.Selection): void;
    public registerWithComponent(): void;
}
interface ZoomInfo {
    translate: number[];
    scale: number[];
}
declare class PanZoomInteraction extends Interaction {
    private zoom;
    public renderers: Component[];
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    constructor(componentToListenTo: Component, renderers: Component[], xScale: QuantitiveScale, yScale: QuantitiveScale);
    public anchor(hitBox: D3.Selection): void;
    private rerenderZoomed();
}
declare class AreaInteraction extends Interaction {
    private static CLASS_DRAG_BOX;
    private dragInitialized;
    private dragBehavior;
    private origin;
    private location;
    private constrainX;
    private constrainY;
    private dragBox;
    private callbackToCall;
    constructor(componentToListenTo: Component);
    public callback(cb?: (a: SelectionArea) => any): AreaInteraction;
    private dragstart();
    private drag();
    private dragend();
    public clearBox(): AreaInteraction;
    public anchor(hitBox: D3.Selection): AreaInteraction;
}
declare class ZoomCallbackGenerator {
    private xScaleMappings;
    private yScaleMappings;
    public addXScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator;
    public addYScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator;
    private updateScale(referenceScale, targetScale, pixelMin, pixelMax);
    public getCallback(): (area: SelectionArea) => void;
}
declare class Label extends Component {
    private static CSS_CLASS;
    private textElement;
    private text;
    private orientation;
    private textLength;
    private textHeight;
    constructor(text?: string, orientation?: string);
    public anchor(element: D3.Selection): Label;
    public setText(text: string): void;
    private measureAndSetTextSize();
    private truncateTextAndRemeasure(availableLength);
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Label;
}
declare class TitleLabel extends Label {
    private static CSS_CLASS;
    constructor(text?: string, orientation?: string);
}
declare class AxisLabel extends Label {
    private static CSS_CLASS;
    constructor(text?: string, orientation?: string);
}
declare class Renderer extends Component {
    private static CSS_CLASS;
    public dataset: IDataset;
    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];
    constructor(dataset?: IDataset);
    public data(dataset: IDataset): Renderer;
    public anchor(element: D3.Selection): Renderer;
}
interface IAccessor {
    (d: any): number;
}
declare class XYRenderer extends Renderer {
    private static CSS_CLASS;
    public dataSelection: D3.UpdateSelection;
    private static defaultXAccessor;
    private static defaultYAccessor;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    public xAccessor: IAccessor;
    public yAccessor: IAccessor;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): XYRenderer;
    public invertXYSelectionArea(pixelArea: SelectionArea): SelectionArea;
    public getSelectionFromArea(dataArea: SelectionArea): D3.UpdateSelection;
    public getDataIndicesFromArea(dataArea: SelectionArea): number[];
    private rescale();
}
declare class LineRenderer extends XYRenderer {
    private static CSS_CLASS;
    private path;
    private line;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    public anchor(element: D3.Selection): LineRenderer;
    public render(): LineRenderer;
}
declare class CircleRenderer extends XYRenderer {
    private static CSS_CLASS;
    public size: number;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor, size?: number);
    public render(): CircleRenderer;
}
declare class BarRenderer extends XYRenderer {
    private static CSS_CLASS;
    private static defaultX2Accessor;
    public barPaddingPx: number;
    public x2Accessor: IAccessor;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, x2Accessor?: IAccessor, yAccessor?: IAccessor);
    public render(): BarRenderer;
}
declare class Table extends Component {
    private static CSS_CLASS;
    private rowPadding;
    private colPadding;
    private rows;
    private rowMinimums;
    private colMinimums;
    private rowWeights;
    private colWeights;
    constructor(rows?: Component[][]);
    public addComponent(row: number, col: number, component: Component): Table;
    private padTableToSize(nRows, nCols);
    public anchor(element: D3.Selection): Table;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Table;
    private static calcComponentWeights(setWeights, componentGroups, fixityAccessor);
    private static calcProportionalSpace(weights, freeSpace);
    public render(): Table;
    public rowWeight(index: number, weight: number): Table;
    public colWeight(index: number, weight: number): Table;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Table;
    public colMinimum(): number;
    public colMinimum(newVal: number): Table;
    public padding(rowPadding: number, colPadding: number): Table;
    private static fixedSpace(componentGroup, fixityAccessor);
    public isFixedWidth(): boolean;
    public isFixedHeight(): boolean;
}
declare class ScaleDomainCoordinator {
    private scales;
    private rescaleInProgress;
    constructor(scales: Scale[]);
    public rescale(scale: Scale): void;
}
declare class Legend extends Component {
    private static CSS_CLASS;
    private static SUBELEMENT_CLASS;
    private static MARGIN;
    private colorScale;
    private maxWidth;
    constructor(colorScale?: ColorScale);
    public scale(scale: ColorScale): Legend;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Legend;
    private measureTextHeight();
    public render(): Legend;
}
declare class Axis extends Component {
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
    private static axisXTransform(selection, x);
    private static axisYTransform(selection, y);
    /**
    * Creates an Axis.
    * @constructor
    * @param {Scale} scale The Scale to base the Axis on.
    * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
    * @param {any} [formatter] a D3 formatter
    */
    constructor(scale: Scale, orientation: string, formatter?: any);
    public anchor(element: D3.Selection): Axis;
    private transformString(translate, scale);
    public render(): Axis;
    private rescale();
}
declare class XAxis extends Axis {
    /**
    * Creates an XAxis (a horizontal Axis).
    * @constructor
    * @param {Scale} scale The Scale to base the Axis on.
    * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
    * @param {any} [formatter] a D3 formatter
    */
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class YAxis extends Axis {
    /**
    * Creates a YAxis (a vertical Axis).
    * @constructor
    * @param {Scale} scale The Scale to base the Axis on.
    * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
    * @param {any} [formatter] a D3 formatter
    */
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class ComponentGroup extends Component {
    private components;
    constructor(components?: Component[]);
    public addComponent(c: Component): ComponentGroup;
    public anchor(element: D3.Selection): ComponentGroup;
    public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): ComponentGroup;
    public render(): ComponentGroup;
    public isFixedWidth(): boolean;
    public isFixedHeight(): boolean;
}
