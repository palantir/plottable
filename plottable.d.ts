
declare module Plottable {
    module Util {
        module Methods {
            function inRange(x: number, a: number, b: number): boolean;
            function warn(warning: string): void;
            function addArrays(alist: number[], blist: number[]): number[];
            function intersection(set1: D3.Set, set2: D3.Set): D3.Set;
            function _accessorize(accessor: any): IAccessor;
            function union(set1: D3.Set, set2: D3.Set): D3.Set;
            function _applyAccessor(accessor: IAccessor, plot: Plottable.Abstract.Plot): (d: any, i: number) => any;
            function uniq(strings: string[]): string[];
            function uniqNumbers(a: number[]): number[];
            function createFilledArray(value: any, count: number): any[];
            function flatten<T>(a: T[][]): T[];
            function arrayEq<T>(a: T[], b: T[]): boolean;
            function objEq(a: any, b: any): boolean;
        }
    }
}


declare module Plottable {
    module Util {
        module OpenSource {
            function sortedIndex(val: number, arr: number[]): number;
            function sortedIndex(val: number, arr: any[], accessor: IAccessor): number;
        }
    }
}


declare module Plottable {
    module Util {
        class IDCounter {
            increment(id: any): number;
            decrement(id: any): number;
            get(id: any): number;
        }
    }
}


declare module Plottable {
    module Util {
        class StrictEqualityAssociativeArray {
            set(key: any, value: any): boolean;
            get(key: any): any;
            has(key: any): boolean;
            values(): any[];
            keys(): any[];
            map(cb: (key?: any, val?: any, index?: number) => any): any[];
            delete(key: any): boolean;
        }
    }
}


declare module Plottable {
    module Util {
        class Cache<T> {
            constructor(compute: (k: string) => T, canonicalKey?: string, valueEq?: (v: T, w: T) => boolean);
            get(k: string): T;
            clear(): Cache<T>;
        }
    }
}


declare module Plottable {
    module Util {
        module Text {
            interface Dimensions {
                width: number;
                height: number;
            }
            interface TextMeasurer {
                (s: string): Dimensions;
            }
            function getTextMeasure(selection: D3.Selection): TextMeasurer;
            class CachingCharacterMeasurer {
                measure: TextMeasurer;
                constructor(g: D3.Selection);
                clear(): CachingCharacterMeasurer;
            }
            function getTruncatedText(text: string, availableWidth: number, measurer: TextMeasurer): string;
            function getTextHeight(selection: D3.Selection): number;
            function getTextWidth(textElement: D3.Selection, text: string): number;
            function _addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
            function writeLineHorizontally(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeLineVertically(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
                width: number;
                height: number;
            };
            function writeTextHorizontally(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeTextVertically(brokenText: string[], g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
                width: number;
                height: number;
            };
            interface IWriteTextResult {
                textFits: boolean;
                usedWidth: number;
                usedHeight: number;
            }
            interface IWriteOptions {
                g: D3.Selection;
                xAlign: string;
                yAlign: string;
            }
            function writeText(text: string, width: number, height: number, tm: TextMeasurer, horizontally?: boolean, write?: IWriteOptions): IWriteTextResult;
        }
    }
}


declare module Plottable {
    module Util {
        module WordWrap {
            interface IWrappedText {
                originalText: string;
                lines: string[];
                textFits: boolean;
            }
            function breakTextToFitRect(text: string, width: number, height: number, measureText: Text.TextMeasurer): IWrappedText;
            function canWrapWithoutBreakingWords(text: string, width: number, widthMeasure: (s: string) => number): boolean;
        }
    }
}

declare module Plottable {
    module Util {
        module DOM {
            function getBBox(element: D3.Selection): SVGRect;
            var POLYFILL_TIMEOUT_MSEC: number;
            function requestAnimationFramePolyfill(fn: () => any): void;
            function isSelectionRemovedFromSVG(selection: D3.Selection): boolean;
            function getElementWidth(elem: HTMLScriptElement): number;
            function getElementHeight(elem: HTMLScriptElement): number;
            function getSVGPixelWidth(svg: D3.Selection): number;
            function translate(s: D3.Selection, x?: number, y?: number): any;
            function boxesOverlap(boxA: ClientRect, boxB: ClientRect): boolean;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Formatter {
            constructor(precision: number);
            format(d: any): string;
            precision(): number;
            precision(value: number): Formatter;
            showOnlyUnchangedValues(): boolean;
            showOnlyUnchangedValues(showUnchanged: boolean): Formatter;
        }
    }
}


declare module Plottable {
    module Formatter {
        class Identity extends Plottable.Abstract.Formatter {
            constructor();
        }
    }
}


declare module Plottable {
    module Formatter {
        class General extends Plottable.Abstract.Formatter {
            constructor(precision?: number);
        }
    }
}


declare module Plottable {
    module Formatter {
        class Fixed extends Plottable.Abstract.Formatter {
            constructor(precision?: number);
        }
    }
}


declare module Plottable {
    module Formatter {
        class Currency extends Fixed {
            constructor(precision?: number, symbol?: string, prefix?: boolean);
            format(d: any): string;
        }
    }
}


declare module Plottable {
    module Formatter {
        class Percentage extends Fixed {
            constructor(precision?: number);
            format(d: any): string;
        }
    }
}


declare module Plottable {
    module Formatter {
        class SISuffix extends Plottable.Abstract.Formatter {
            constructor(precision?: number);
            precision(): number;
            precision(value: number): SISuffix;
        }
    }
}


declare module Plottable {
    module Formatter {
        class Custom extends Plottable.Abstract.Formatter {
            constructor(customFormatFunction: (d: any, formatter: Custom) => string, precision?: number);
        }
    }
}


declare module Plottable {
    interface FilterFormat {
        format: string;
        filter: (d: any) => any;
    }
    module Formatter {
        class Time extends Plottable.Abstract.Formatter {
            constructor();
        }
    }
}


declare module Plottable {
    var version: string;
}


declare module Plottable {
    module Abstract {
        class PlottableObject {
        }
    }
}


declare module Plottable {
    module Core {
        interface IListenable {
            broadcaster: Broadcaster;
        }
        interface IBroadcasterCallback {
            (listenable: IListenable, ...args: any[]): any;
        }
        class Broadcaster extends Plottable.Abstract.PlottableObject {
            listenable: IListenable;
            constructor(listenable: IListenable);
            registerListener(key: any, callback: IBroadcasterCallback): Broadcaster;
            broadcast(...args: any[]): Broadcaster;
            deregisterListener(key: any): Broadcaster;
            deregisterAllListeners(): void;
        }
    }
}


declare module Plottable {
    class DataSource extends Plottable.Abstract.PlottableObject implements Plottable.Core.IListenable {
        broadcaster: any;
        constructor(data?: any[], metadata?: any);
        data(): any[];
        data(data: any[]): DataSource;
        metadata(): any;
        metadata(metadata: any): DataSource;
    }
}


declare module Plottable {
    module Abstract {
        class Component extends PlottableObject {
            element: D3.Selection;
            content: D3.Selection;
            backgroundContainer: D3.Selection;
            foregroundContainer: D3.Selection;
            clipPathEnabled: boolean;
            availableWidth: number;
            availableHeight: number;
            xOrigin: number;
            yOrigin: number;
            static AUTORESIZE_BY_DEFAULT: boolean;
            renderTo(element: any): Component;
            resize(width?: number, height?: number): Component;
            autoResize(flag: boolean): Component;
            xAlign(alignment: string): Component;
            yAlign(alignment: string): Component;
            xOffset(offset: number): Component;
            yOffset(offset: number): Component;
            registerInteraction(interaction: Interaction): Component;
            classed(cssClass: string): boolean;
            classed(cssClass: string, addClass: boolean): Component;
            merge(c: Component): Plottable.Component.Group;
            detach(): Component;
            remove(): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class ComponentContainer extends Component {
            components(): Component[];
            empty(): boolean;
            detachAll(): ComponentContainer;
            remove(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Group extends Plottable.Abstract.ComponentContainer {
            constructor(components?: Plottable.Abstract.Component[]);
            merge(c: Plottable.Abstract.Component): Group;
        }
    }
}


declare module Plottable {
    module Component {
        interface IterateLayoutResult {
            colProportionalSpace: number[];
            rowProportionalSpace: number[];
            guaranteedWidths: number[];
            guaranteedHeights: number[];
            wantsWidth: boolean;
            wantsHeight: boolean;
        }
        class Table extends Plottable.Abstract.ComponentContainer {
            constructor(rows?: Plottable.Abstract.Component[][]);
            addComponent(row: number, col: number, component: Plottable.Abstract.Component): Table;
            padding(rowPadding: number, colPadding: number): Table;
            rowWeight(index: number, weight: number): Table;
            colWeight(index: number, weight: number): Table;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Scale extends PlottableObject implements Plottable.Core.IListenable {
            broadcaster: any;
            constructor(scale: D3.Scale.Scale);
            autoDomain(): Scale;
            scale(value: any): any;
            domain(): any[];
            domain(values: any[]): Scale;
            range(): any[];
            range(values: any[]): Scale;
            copy(): Scale;
            updateExtent(rendererID: number, attr: string, extent: any[]): Scale;
            removeExtent(rendererID: number, attr: string): Scale;
        }
    }
}


declare module Plottable {
    module Abstract {
        interface _IProjector {
            accessor: IAccessor;
            scale?: Scale;
        }
        interface IAttributeToProjector {
            [attrToSet: string]: IAppliedAccessor;
        }
        class Plot extends Component {
            renderArea: D3.Selection;
            element: D3.Selection;
            constructor();
            constructor(dataset: any[]);
            constructor(dataset: DataSource);
            remove(): void;
            dataSource(): DataSource;
            dataSource(source: DataSource): Plot;
            project(attrToSet: string, accessor: any, scale?: Scale): Plot;
            animate(enabled: boolean): Plot;
            detach(): Plot;
            animator(animatorKey: string): Plottable.Animator.IPlotAnimator;
            animator(animatorKey: string, animator: Plottable.Animator.IPlotAnimator): Plot;
        }
    }
}


declare module Plottable {
    module Core {
        module RenderController {
            module RenderPolicy {
                interface IRenderPolicy {
                    render(): any;
                }
                class Immediate implements IRenderPolicy {
                    render(): void;
                }
                class AnimationFrame implements IRenderPolicy {
                    render(): void;
                }
                class Timeout implements IRenderPolicy {
                    render(): void;
                }
            }
        }
    }
}


declare module Plottable {
    module Core {
        module RenderController {
            var _renderPolicy: RenderPolicy.IRenderPolicy;
            function setRenderPolicy(policy: RenderPolicy.IRenderPolicy): any;
            function registerToRender(c: Plottable.Abstract.Component): void;
            function registerToComputeLayout(c: Plottable.Abstract.Component): void;
            function flush(): void;
        }
    }
}


declare module Plottable {
    module Core {
        module ResizeBroadcaster {
            function resizing(): boolean;
            function clearResizing(): any;
            function register(c: Plottable.Abstract.Component): void;
            function deregister(c: Plottable.Abstract.Component): void;
        }
    }
}


declare module Plottable {
    module Animator {
        interface IPlotAnimator {
            animate(selection: any, attrToProjector: Plottable.Abstract.IAttributeToProjector, plot: Plottable.Abstract.Plot): any;
        }
        interface IPlotAnimatorMap {
            [animatorKey: string]: IPlotAnimator;
        }
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
    interface ISpaceRequest {
        width: number;
        height: number;
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    interface IPixelArea {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    interface IExtent {
        min: number;
        max: number;
    }
    interface Point {
        x: number;
        y: number;
    }
}


declare module Plottable {
    class Domainer {
        constructor(combineExtents?: (extents: any[][]) => any[]);
        computeDomain(extents: any[][], scale: Plottable.Abstract.QuantitativeScale): any[];
        pad(padProportion?: number): Domainer;
        addPaddingException(exception: any, key?: string): Domainer;
        removePaddingException(keyOrException: any): Domainer;
        addIncludedValue(value: any, key?: string): Domainer;
        removeIncludedValue(valueOrKey: any): Domainer;
        nice(count?: number): Domainer;
    }
}


declare module Plottable {
    module Abstract {
        class QuantitativeScale extends Scale {
            constructor(scale: D3.Scale.QuantitiveScale);
            invert(value: number): number;
            copy(): QuantitativeScale;
            domain(): any[];
            domain(values: any[]): QuantitativeScale;
            interpolate(): D3.Transition.Interpolate;
            interpolate(factory: D3.Transition.Interpolate): QuantitativeScale;
            rangeRound(values: number[]): QuantitativeScale;
            clamp(): boolean;
            clamp(clamp: boolean): QuantitativeScale;
            ticks(count?: number): any[];
            tickFormat(count: number, format?: string): (n: number) => string;
            domainer(): Domainer;
            domainer(domainer: Domainer): QuantitativeScale;
        }
    }
}


declare module Plottable {
    module Scale {
        class Linear extends Plottable.Abstract.QuantitativeScale {
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            copy(): Linear;
        }
    }
}


declare module Plottable {
    module Scale {
        class Log extends Plottable.Abstract.QuantitativeScale {
            constructor();
            constructor(scale: D3.Scale.LogScale);
            copy(): Log;
        }
    }
}


declare module Plottable {
    module Scale {
        class ModifiedLog extends Plottable.Abstract.QuantitativeScale {
            constructor(base?: number);
            scale(x: number): number;
            invert(x: number): number;
            ticks(count?: number): number[];
            copy(): ModifiedLog;
            showIntermediateTicks(): boolean;
            showIntermediateTicks(show: boolean): ModifiedLog;
        }
    }
}


declare module Plottable {
    module Scale {
        class Ordinal extends Plottable.Abstract.Scale {
            constructor(scale?: D3.Scale.OrdinalScale);
            domain(): any[];
            domain(values: any[]): Ordinal;
            range(): number[];
            range(values: number[]): Ordinal;
            rangeBand(): number;
            innerPadding(): number;
            fullBandStartAndWidth(v: any): number[];
            rangeType(): string;
            rangeType(rangeType: string, outerPadding?: number, innerPadding?: number): Ordinal;
            copy(): Ordinal;
        }
    }
}


declare module Plottable {
    module Scale {
        class Color extends Plottable.Abstract.Scale {
            constructor(scaleType?: string);
        }
    }
}


declare module Plottable {
    module Scale {
        class Time extends Plottable.Abstract.QuantitativeScale {
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            tickInterval(interval: D3.Time.Interval, step?: number): any[];
            domain(): any[];
            domain(values: any[]): Time;
            copy(): Time;
        }
    }
}


declare module Plottable {
    module Scale {
        class InterpolatedColor extends Plottable.Abstract.QuantitativeScale {
            constructor(colorRange?: any, scaleType?: string);
            colorRange(): string[];
            colorRange(colorRange: any): InterpolatedColor;
            scaleType(): string;
            scaleType(scaleType: string): InterpolatedColor;
            autoDomain(): InterpolatedColor;
        }
    }
}


declare module Plottable {
    module Util {
        class ScaleDomainCoordinator {
            constructor(scales: Plottable.Abstract.Scale[]);
            rescale(scale: Plottable.Abstract.Scale): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Axis extends Component {
            static TICK_MARK_CLASS: string;
            static TICK_LABEL_CLASS: string;
            constructor(scale: Scale, orientation: string, formatter?: any);
            remove(): void;
            width(): number;
            width(w: any): Axis;
            height(): number;
            height(h: any): Axis;
            formatter(): Formatter;
            formatter(formatter: any): Axis;
            tickLength(): number;
            tickLength(length: number): Axis;
            tickLabelPadding(): number;
            tickLabelPadding(padding: number): Axis;
            gutter(): number;
            gutter(size: number): Axis;
            orient(): string;
            orient(newOrientation: string): Axis;
            showEndTickLabels(): boolean;
            showEndTickLabels(show: boolean): Axis;
        }
    }
}


declare module Plottable {
    module Axis {
        interface ITimeInterval {
            timeUnit: D3.Time.Interval;
            step: number;
            formatString: string;
        }
        class Time extends Plottable.Abstract.Axis {
            static minorIntervals: ITimeInterval[];
            static majorIntervals: ITimeInterval[];
            constructor(scale: Plottable.Scale.Time, orientation: string);
            calculateWorstWidth(container: D3.Selection, format: string): number;
            getIntervalLength(interval: ITimeInterval): number;
            isEnoughSpace(container: D3.Selection, interval: ITimeInterval): boolean;
        }
    }
}


declare module Plottable {
    module Axis {
        class Numeric extends Plottable.Abstract.Axis {
            constructor(scale: Plottable.Abstract.QuantitativeScale, orientation: string, formatter?: any);
            tickLabelPosition(): string;
            tickLabelPosition(position: string): Numeric;
            showEndTickLabel(orientation: string): boolean;
            showEndTickLabel(orientation: string, show: boolean): Numeric;
        }
    }
}


declare module Plottable {
    module Axis {
        class Category extends Plottable.Abstract.Axis {
            constructor(scale: Plottable.Scale.Ordinal, orientation?: string, formatter?: any);
        }
    }
}


declare module Plottable {
    module Component {
        class Label extends Plottable.Abstract.Component {
            constructor(displayText?: string, orientation?: string);
            xAlign(alignment: string): Label;
            yAlign(alignment: string): Label;
            text(): string;
            text(displayText: string): Label;
        }
        class TitleLabel extends Label {
            constructor(text?: string, orientation?: string);
        }
        class AxisLabel extends Label {
            constructor(text?: string, orientation?: string);
        }
    }
}


declare module Plottable {
    module Component {
        interface ToggleCallback {
            (datum: string, newState: boolean): any;
        }
        interface HoverCallback {
            (datum?: string): any;
        }
        class Legend extends Plottable.Abstract.Component {
            static SUBELEMENT_CLASS: string;
            constructor(colorScale?: Plottable.Scale.Color);
            remove(): void;
            toggleCallback(callback: ToggleCallback): Legend;
            toggleCallback(): ToggleCallback;
            hoverCallback(callback: HoverCallback): Legend;
            hoverCallback(): HoverCallback;
            scale(scale: Plottable.Scale.Color): Legend;
            scale(): Plottable.Scale.Color;
        }
    }
}


declare module Plottable {
    module Component {
        class Gridlines extends Plottable.Abstract.Component {
            constructor(xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.QuantitativeScale);
            remove(): Gridlines;
        }
    }
}


declare module Plottable {
    module Util {
        module Axis {
            var ONE_DAY: number;
            function generateRelativeDateFormatter(baseValue: number, increment?: number, label?: string): (tickValue: any) => string;
        }
    }
}


declare module Plottable {
    module Abstract {
        class XYPlot extends Plot {
            xScale: Scale;
            yScale: Scale;
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            project(attrToSet: string, accessor: any, scale?: Scale): XYPlot;
        }
    }
}


declare module Plottable {
    module Plot {
        class Scatter extends Plottable.Abstract.XYPlot {
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Scatter;
        }
    }
}


declare module Plottable {
    module Plot {
        class Grid extends Plottable.Abstract.XYPlot {
            colorScale: Plottable.Abstract.Scale;
            xScale: Plottable.Scale.Ordinal;
            yScale: Plottable.Scale.Ordinal;
            constructor(dataset: any, xScale: Plottable.Scale.Ordinal, yScale: Plottable.Scale.Ordinal, colorScale: Plottable.Abstract.Scale);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Grid;
        }
    }
}


declare module Plottable {
    module Abstract {
        class BarPlot extends XYPlot {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            baseline(value: number): BarPlot;
            barAlignment(alignment: string): BarPlot;
            selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            deselectAll(): BarPlot;
        }
    }
}


declare module Plottable {
    module Plot {
        class VerticalBar extends Plottable.Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.QuantitativeScale);
        }
    }
}


declare module Plottable {
    module Plot {
        class HorizontalBar extends Plottable.Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.Scale);
        }
    }
}


declare module Plottable {
    module Plot {
        class Line extends Plottable.Abstract.XYPlot {
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
        }
    }
}


declare module Plottable {
    module Plot {
        class Area extends Line {
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Area;
        }
    }
}


declare module Plottable {
    module Animator {
        class Null implements IPlotAnimator {
            animate(selection: any, attrToProjector: Plottable.Abstract.IAttributeToProjector, plot: Plottable.Abstract.Plot): any;
        }
    }
}


declare module Plottable {
    module Animator {
        class Default implements IPlotAnimator {
            animate(selection: any, attrToProjector: Plottable.Abstract.IAttributeToProjector, plot: Plottable.Abstract.Plot): any;
            duration(): Number;
            duration(duration: Number): Default;
            delay(): Number;
            delay(delay: Number): Default;
            easing(): string;
            easing(easing: string): Default;
        }
    }
}


declare module Plottable {
    module Animator {
        class IterativeDelay extends Default {
            animate(selection: any, attrToProjector: Plottable.Abstract.IAttributeToProjector, plot: Plottable.Abstract.Plot): any;
        }
    }
}


declare module Plottable {
    module Core {
        interface IKeyEventListenerCallback {
            (e: D3.D3Event): any;
        }
        module KeyEventListener {
            function initialize(): void;
            function addCallback(keyCode: number, cb: IKeyEventListenerCallback): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Interaction {
            hitBox: D3.Selection;
            componentToListenTo: Component;
            constructor(componentToListenTo: Component);
            registerWithComponent(): Interaction;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Click extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component);
            callback(cb: (x: number, y: number) => any): Click;
        }
        class DoubleClick extends Click {
            constructor(componentToListenTo: Plottable.Abstract.Component);
        }
    }
}


declare module Plottable {
    module Interaction {
        class Mousemove extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component);
            mousemove(x: number, y: number): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Key extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component, keyCode: number);
            callback(cb: () => any): Key;
        }
    }
}


declare module Plottable {
    module Interaction {
        class PanZoom extends Plottable.Abstract.Interaction {
            xScale: Plottable.Abstract.QuantitativeScale;
            yScale: Plottable.Abstract.QuantitativeScale;
            constructor(componentToListenTo: Plottable.Abstract.Component, xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.QuantitativeScale);
            resetZoom(): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Drag extends Plottable.Abstract.Interaction {
            origin: number[];
            location: number[];
            callbackToCall: (dragInfo: any) => any;
            constructor(componentToListenTo: Plottable.Abstract.Component);
            callback(cb?: (a: any) => any): Drag;
            setupZoomCallback(xScale?: Plottable.Abstract.QuantitativeScale, yScale?: Plottable.Abstract.QuantitativeScale): Drag;
        }
    }
}


declare module Plottable {
    module Interaction {
        class DragBox extends Drag {
            dragBox: D3.Selection;
            boxIsDrawn: boolean;
            clearBox(): DragBox;
            setBox(x0: number, x1: number, y0: number, y1: number): DragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XDragBox extends DragBox {
            setBox(x0: number, x1: number): XDragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XYDragBox extends DragBox {
        }
    }
}


declare module Plottable {
    module Interaction {
        class YDragBox extends DragBox {
            setBox(y0: number, y1: number): YDragBox;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Dispatcher extends PlottableObject {
            constructor(target: D3.Selection);
            target(): D3.Selection;
            target(targetElement: D3.Selection): Dispatcher;
            connect(): Dispatcher;
            disconnect(): Dispatcher;
        }
    }
}


declare module Plottable {
    module Dispatcher {
        class Mouse extends Plottable.Abstract.Dispatcher {
            constructor(target: D3.Selection);
            mouseover(): (location: Point) => any;
            mouseover(callback: (location: Point) => any): Mouse;
            mousemove(): (location: Point) => any;
            mousemove(callback: (location: Point) => any): Mouse;
            mouseout(): (location: Point) => any;
            mouseout(callback: (location: Point) => any): Mouse;
        }
    }
}


declare module Plottable {
    module Template {
        class StandardChart extends Plottable.Component.Table {
            constructor();
            yAxis(y: Plottable.Abstract.Axis): StandardChart;
            yAxis(): Plottable.Abstract.Axis;
            xAxis(x: Plottable.Abstract.Axis): StandardChart;
            xAxis(): Plottable.Abstract.Axis;
            yLabel(y: Plottable.Component.AxisLabel): StandardChart;
            yLabel(y: string): StandardChart;
            yLabel(): Plottable.Component.AxisLabel;
            xLabel(x: Plottable.Component.AxisLabel): StandardChart;
            xLabel(x: string): StandardChart;
            xLabel(): Plottable.Component.AxisLabel;
            titleLabel(x: Plottable.Component.TitleLabel): StandardChart;
            titleLabel(x: string): StandardChart;
            titleLabel(): Plottable.Component.TitleLabel;
            center(c: Plottable.Abstract.Component): StandardChart;
        }
    }
}
