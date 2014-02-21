/// <reference path="../typings/d3/d3.d.ts" />
/// <reference path="../src/interfaces.d.ts" />
declare module Utils {
    function inRange(x: number, a: number, b: number): boolean;
    function getBBox(element: D3.Selection): SVGRect;
}
declare class Component {
    private static clipPathId;
    public element: D3.Selection;
    public hitBox: D3.Selection;
    private registeredInteractions;
    private boxes;
    public clipPathEnabled: boolean;
    private rowWeightVal;
    private colWeightVal;
    private rowMinimumVal;
    private colMinimumVal;
    public availableWidth: number;
    public availableHeight: number;
    public xOffset: number;
    public yOffset: number;
    private cssClasses;
    private xAlignProportion;
    private yAlignProportion;
    public anchor(element: D3.Selection): Component;
    public xAlign(alignment: string): Component;
    public yAlign(alignment: string): Component;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Component;
    public render(): Component;
    private addBox(className?, parentElement?);
    public generateClipPath(): void;
    public registerInteraction(interaction: Interaction): void;
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public rowWeight(): number;
    public rowWeight(newVal: number): Component;
    public colWeight(): number;
    public colWeight(newVal: number): Component;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
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
    public xAlignment: string;
    public yAlignment: string;
    private textElement;
    private text;
    private orientation;
    private textLength;
    private textHeight;
    constructor(text?: string, orientation?: string);
    public anchor(element: D3.Selection): Label;
    public setText(text: string): void;
    private measureAndSetTextSize();
    private truncateTextToLength(availableLength);
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
    private cols;
    private nRows;
    private nCols;
    private rowMinimums;
    private colMinimums;
    private rowWeights;
    private colWeights;
    private rowWeightSum;
    private colWeightSum;
    constructor(rows: Component[][], rowWeightVal?: number, colWeightVal?: number);
    public anchor(element: D3.Selection): Table;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Table;
    private static rowProportionalSpace(rows, freeHeight);
    private static colProportionalSpace(cols, freeWidth);
    private static calculateProportionalSpace(componentGroups, freeSpace, spaceAccessor);
    public render(): Table;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    public padding(rowPadding: number, colPadding: number): Table;
}
declare class ScaleDomainCoordinator {
    private scales;
    private rescaleInProgress;
    constructor(scales: Scale[]);
    public rescale(scale: Scale): void;
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
    constructor(components: Component[]);
    public anchor(element: D3.Selection): ComponentGroup;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): ComponentGroup;
    public render(): ComponentGroup;
}
