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
    public anchor(element: D3.Selection): Component;
    public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Component;
    public render(): Component;
    public renderTo(element: D3.Selection): Component;
    public xAlign(alignment: string): Component;
    public yAlign(alignment: string): Component;
    public xOffset(offset: number): Component;
    public yOffset(offset: number): Component;
    private addBox(className?, parentElement?);
    public generateClipPath(): void;
    public registerInteraction(interaction: Interaction): void;
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    public isFixedWidth(): boolean;
    public isFixedHeight(): boolean;
}
declare class Scale implements IBroadcaster {
    public scale: D3.Scale.Scale;
    private broadcasterCallbacks;
    constructor(scale: D3.Scale.Scale);
    public public(value: any): any;
    public domain(): any[];
    public domain(values: any[]): Scale;
    public range(): any[];
    public range(values: any[]): Scale;
    public copy(): Scale;
    public registerListener(callback: IBroadcasterCallback): Scale;
}
declare class QuantitiveScale extends Scale {
    public scale: D3.Scale.QuantitiveScale;
    constructor(scale: D3.Scale.QuantitiveScale);
    public invert(value: number): number;
    public ticks(count: number): any[];
    public copy(): QuantitiveScale;
    public widenDomain(newDomain: number[]): QuantitiveScale;
}
declare class LinearScale extends QuantitiveScale {
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    public copy(): LinearScale;
}
declare class ColorScale extends Scale {
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
    public scale: Scale;
    public orientation: string;
    public formatter: any;
    private static CSS_CLASS;
    static yWidth: number;
    static xHeight: number;
    public axisElement: D3.Selection;
    public d3axis: D3.Svg.Axis;
    private cachedScale;
    private cachedTranslate;
    private isXAligned;
    private static axisXTransform(selection, x);
    private static axisYTransform(selection, y);
    constructor(scale: Scale, orientation: string, formatter: any);
    public anchor(element: D3.Selection): Axis;
    private transformString(translate, scale);
    public render(): Axis;
    public rescale(): Axis;
    public zoom(translatePair: number[], scale: number): Axis;
}
declare class XAxis extends Axis {
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class YAxis extends Axis {
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class ComponentGroup extends Component {
    private components;
    constructor(components?: Component[]);
    public addComponent(c: Component): ComponentGroup;
    public anchor(element: D3.Selection): ComponentGroup;
    public computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): ComponentGroup;
    public render(): ComponentGroup;
}
