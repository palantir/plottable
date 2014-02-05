/// <reference path="../lib/lodash.d.ts" />
/// <reference path="../lib/d3.d.ts" />
/// <reference path="../lib/chai/chai.d.ts" />
/// <reference path="../lib/chai/chai-assert.d.ts" />
/// <reference path="interfaces.d.ts" />
declare class Interaction {
    public componentToListenTo: Component;
    public hitBox: D3.Selection;
    constructor(componentToListenTo: Component);
    public anchor(hitBox: D3.Selection): void;
    public registerWithComponent(): void;
}
interface ZoomInfo {
    translate: number[];
    scale: number[];
}
declare class PanZoomInteraction extends Interaction {
    public renderers: Component[];
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    private zoom;
    constructor(componentToListenTo: Component, renderers: Component[], xScale: QuantitiveScale, yScale: QuantitiveScale);
    public anchor(hitBox: D3.Selection): void;
    private rerenderZoomed();
}
declare class AreaInteraction extends Interaction {
    private rendererComponent;
    public areaCallback: (a: FullSelectionArea) => any;
    public selectionCallback: (a: D3.Selection) => any;
    public indicesCallback: (a: number[]) => any;
    private static CLASS_DRAG_BOX;
    private dragInitialized;
    private dragBehavior;
    private origin;
    private location;
    private constrainX;
    private constrainY;
    private dragBox;
    constructor(rendererComponent: XYRenderer, areaCallback?: (a: FullSelectionArea) => any, selectionCallback?: (a: D3.Selection) => any, indicesCallback?: (a: number[]) => any);
    private dragstart();
    private drag();
    private dragend();
    public clearBox(): void;
    public anchor(hitBox: D3.Selection): void;
}
declare class BrushZoomInteraction extends AreaInteraction {
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    public indicesCallback: (a: number[]) => any;
    constructor(eventComponent: XYRenderer, xScale: QuantitiveScale, yScale: QuantitiveScale, indicesCallback?: (a: number[]) => any);
    public zoom(area: FullSelectionArea): void;
}
declare class Component {
    private static clipPathId;
    public element: D3.Selection;
    public hitBox: D3.Selection;
    public boundingBox: D3.Selection;
    private clipPathRect;
    private registeredInteractions;
    private rowWeightVal;
    private colWeightVal;
    private rowMinimumVal;
    private colMinimumVal;
    public availableWidth: number;
    public availableHeight: number;
    private xOffset;
    private yOffset;
    private cssClasses;
    public xAlignment: string;
    public yAlignment: string;
    public classed(cssClass: string): boolean;
    public classed(cssClass: string, addClass: boolean): Component;
    public anchor(element: D3.Selection): void;
    public generateClipPath(): void;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
    public registerInteraction(interaction: Interaction): void;
    public render(): void;
    public zoom(translate: any, scale: any): void;
    public rowWeight(): number;
    public rowWeight(newVal: number): Component;
    public colWeight(): number;
    public colWeight(newVal: number): Component;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
}
declare class Axis extends Component {
    public scale: Scale;
    public orientation: string;
    public formatter: any;
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
    private transformString(translate, scale);
    public rowWeight(): number;
    public rowWeight(newVal: number): Component;
    public colWeight(): number;
    public colWeight(newVal: number): Component;
    public anchor(element: D3.Selection): void;
    public render(): void;
    public rescale(): void;
    public zoom(translatePair: number[], scale: number): void;
}
declare class XAxis extends Axis {
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class YAxis extends Axis {
    constructor(scale: Scale, orientation: string, formatter?: any);
}
declare class LabelComponent extends Component {
    public CLASS_TEXT_LABEL: string;
    public xAlignment: string;
    public yAlignment: string;
    private textElement;
    private text;
    private textHeight;
    private textWidth;
    private isVertical;
    private rotationAngle;
    private orientation;
    constructor(text: string, orientation?: string);
    public rowWeight(): number;
    public rowWeight(newVal: number): Component;
    public colWeight(): number;
    public colWeight(newVal: number): Component;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    public anchor(element: D3.Selection): void;
}
declare class TitleLabel extends LabelComponent {
    public CLASS_TITLE_LABEL: string;
    constructor(text: string, orientation?: string);
}
declare class AxisLabel extends LabelComponent {
    public CLASS_AXIS_LABEL: string;
    constructor(text: string, orientation?: string);
}
declare module PerfDiagnostics {
    function toggle(measurementName: string): void;
    function logResults(): void;
}
declare module Utils {
    function readyCallback(numToTrigger: number, callbackWhenReady: () => any): () => void;
    function translate(element: D3.Selection, translatePair: number[]): D3.Selection;
    function getTranslate(element: D3.Selection): any;
    function getBBox(element: D3.Selection): SVGRect;
    function setWidthHeight(elements: D3.Selection[], width: number, height: number): void;
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
    public widenDomain(newDomain: number[]): Scale;
    public registerListener(callback: IBroadcasterCallback): Scale;
}
declare class QuantitiveScale extends Scale {
    public scale: D3.Scale.QuantitiveScale;
    constructor(scale: D3.Scale.QuantitiveScale);
    public invert(value: number): number;
    public ticks(count: number): any[];
}
declare class LinearScale extends QuantitiveScale {
    constructor();
}
declare class ScaleDomainCoordinator {
    private scales;
    private currentDomain;
    constructor(scales: Scale[]);
    public rescale(scale: Scale): void;
}
declare class Renderer extends Component {
    public CLASS_RENDERER_CONTAINER: string;
    public dataset: IDataset;
    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];
    constructor(dataset: IDataset);
    public data(dataset: IDataset): Renderer;
    public zoom(translate: any, scale: any): void;
    public anchor(element: D3.Selection): void;
}
interface IAccessor {
    (d: any): number;
}
declare class XYRenderer extends Renderer {
    public dataSelection: D3.Selection;
    private static defaultXAccessor;
    private static defaultYAccessor;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    private xAccessor;
    private yAccessor;
    public xScaledAccessor: IAccessor;
    public yScaledAccessor: IAccessor;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
    public invertXYSelectionArea(area: SelectionArea): {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    };
    public getSelectionFromArea(area: FullSelectionArea): D3.UpdateSelection;
    public getDataIndicesFromArea(area: FullSelectionArea): any[];
    public rescale(): void;
}
declare class LineRenderer extends XYRenderer {
    private line;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor);
    public anchor(element: D3.Selection): void;
    public render(): void;
}
declare class CircleRenderer extends XYRenderer {
    public size: number;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor, size?: number);
    public render(): void;
}
declare class BarRenderer extends XYRenderer {
    private BAR_START_PADDING_PX;
    private BAR_END_PADDING_PX;
    private x2Accessor;
    public x2ScaledAccessor: IAccessor;
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, x2Accessor?: IAccessor, yAccessor?: IAccessor);
    public render(): void;
}
declare class Table extends Component {
    public rowPadding: number;
    public colPadding: number;
    public xMargin: number;
    public yMargin: number;
    private rows;
    private cols;
    private nRows;
    private nCols;
    private rowMinimums;
    private colMinimums;
    private minHeight;
    private minWidth;
    private rowWeights;
    private colWeights;
    private rowWeightSum;
    private colWeightSum;
    public rowMinimum(): number;
    public rowMinimum(newVal: number): Component;
    public colMinimum(): number;
    public colMinimum(newVal: number): Component;
    constructor(rows: Component[][], rowWeightVal?: number, colWeightVal?: number);
    public anchor(element: D3.Selection): void;
    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
    private static rowProportionalSpace(rows, freeHeight);
    private static colProportionalSpace(cols, freeWidth);
    private static calculateProportionalSpace(componentGroups, freeSpace, spaceAccessor);
    public render(): void;
}
