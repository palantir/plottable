
declare module Plottable {
    module Util {
        module Methods {
            function inRange(x: number, a: number, b: number): boolean;
            function warn(warning: string): void;
            function addArrays(alist: number[], blist: number[]): number[];
            function intersection<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function union<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function populateMap<T>(keys: string[], transform: (key: string) => T): D3.Map<T>;
            function uniq<T>(arr: T[]): T[];
            function createFilledArray<T>(value: T, count: number): T[];
            function createFilledArray<T>(func: (index?: number) => T, count: number): T[];
            function flatten<T>(a: T[][]): T[];
            function arrayEq<T>(a: T[], b: T[]): boolean;
            function objEq(a: any, b: any): boolean;
            function max(arr: number[], default_val?: number): number;
            function max<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
            function min(arr: number[], default_val?: number): number;
            function min<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
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
            var HEIGHT_TEXT: string;
            interface Dimensions {
                width: number;
                height: number;
            }
            interface TextMeasurer {
                (s: string): Dimensions;
            }
            function getTextMeasurer(selection: D3.Selection): TextMeasurer;
            class CachingCharacterMeasurer {
                measure: TextMeasurer;
                constructor(textSelection: D3.Selection);
                clear(): CachingCharacterMeasurer;
            }
            function getTruncatedText(text: string, availableWidth: number, measurer: TextMeasurer): string;
            function writeLineHorizontally(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string): {
                width: number;
                height: number;
            };
            function writeLineVertically(line: string, g: D3.Selection, width: number, height: number, xAlign?: string, yAlign?: string, rotation?: string): {
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
    interface Formatter {
        (d: any): string;
    }
    var MILLISECONDS_IN_ONE_DAY: number;
    class Formatters {
        static currency(precision?: number, symbol?: string, prefix?: boolean, onlyShowUnchanged?: boolean): (d: any) => string;
        static fixed(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        static general(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        static identity(): (d: any) => string;
        static percentage(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        static siSuffix(precision?: number): (d: any) => string;
        static time(): (d: any) => string;
        static relativeDate(baseValue?: number, increment?: number, label?: string): (d: any) => string;
    }
}


declare module Plottable {
    var version: string;
}


declare module Plottable {
    module Core {
        class Colors {
            static CORAL_RED: string;
            static INDIGO: string;
            static ROBINS_EGG_BLUE: string;
            static FERN: string;
            static BURNING_ORANGE: string;
            static ROYAL_HEATH: string;
            static CONIFER: string;
            static CERISE_RED: string;
            static BRIGHT_SUN: string;
            static JACARTA: string;
            static PLOTTABLE_COLORS: string[];
        }
    }
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
    class Dataset extends Plottable.Abstract.PlottableObject implements Plottable.Core.IListenable {
        broadcaster: any;
        constructor(data?: any[], metadata?: any);
        data(): any[];
        data(data: any[]): Dataset;
        metadata(): any;
        metadata(metadata: any): Dataset;
    }
}


declare module Plottable {
    module Abstract {
        class Component extends PlottableObject {
            static AUTORESIZE_BY_DEFAULT: boolean;
            element: D3.Selection;
            content: D3.Selection;
            backgroundContainer: D3.Selection;
            foregroundContainer: D3.Selection;
            clipPathEnabled: boolean;
            xOrigin: number;
            yOrigin: number;
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
            width(): number;
            height(): number;
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
        class Scale<D, R> extends PlottableObject implements Plottable.Core.IListenable {
            broadcaster: any;
            constructor(scale: D3.Scale.Scale);
            autoDomain(): Scale<D, R>;
            scale(value: D): R;
            domain(): D[];
            domain(values: D[]): Scale<D, R>;
            range(): R[];
            range(values: R[]): Scale<D, R>;
            copy(): Scale<D, R>;
            updateExtent(plotProvidedKey: string, attr: string, extent: D[]): Scale<D, R>;
            removeExtent(plotProvidedKey: string, attr: string): Scale<D, R>;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Plot extends Component {
            renderArea: D3.Selection;
            element: D3.Selection;
            constructor();
            constructor(data: any[]);
            constructor(dataset: Dataset);
            remove(): void;
            dataset(): Dataset;
            dataset(dataset: Dataset): Plot;
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): Plot;
            animate(enabled: boolean): Plot;
            detach(): Plot;
            animator(animatorKey: string): Plottable.Animator.IPlotAnimator;
            animator(animatorKey: string, animator: Plottable.Animator.IPlotAnimator): Plot;
        }
    }
}


declare module Plottable {
    module Abstract {
        class XYPlot extends Plot {
            xScale: Scale<any, number>;
            yScale: Scale<any, number>;
            constructor(dataset: any, xScale: Scale<any, number>, yScale: Scale<any, number>);
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): XYPlot;
        }
    }
}


declare module Plottable {
    interface DatasetDrawerKey {
        dataset: Dataset;
        drawer: Plottable.Abstract._Drawer;
        key: string;
    }
    module Abstract {
        class NewStylePlot extends XYPlot {
            constructor(xScale?: Scale<any, number>, yScale?: Scale<any, number>);
            remove(): void;
            addDataset(key: string, dataset: Dataset): NewStylePlot;
            addDataset(key: string, dataset: any[]): NewStylePlot;
            addDataset(dataset: Dataset): NewStylePlot;
            addDataset(dataset: any[]): NewStylePlot;
            datasetOrder(): string[];
            datasetOrder(order: string[]): NewStylePlot;
            removeDataset(key: string): NewStylePlot;
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
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
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
    interface _IProjector {
        accessor: IAccessor;
        scale?: Plottable.Abstract.Scale<any, any>;
        attribute: string;
    }
    interface IAttributeToProjector {
        [attrToSet: string]: IAppliedAccessor;
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
        computeDomain(extents: any[][], scale: Plottable.Abstract.QuantitativeScale<any>): any[];
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
        class QuantitativeScale<D> extends Scale<D, number> {
            constructor(scale: D3.Scale.QuantitativeScale);
            invert(value: number): D;
            copy(): QuantitativeScale<D>;
            domain(): D[];
            domain(values: D[]): QuantitativeScale<D>;
            interpolate(): D3.Transition.Interpolate;
            interpolate(factory: D3.Transition.Interpolate): QuantitativeScale<D>;
            rangeRound(values: number[]): QuantitativeScale<D>;
            clamp(): boolean;
            clamp(clamp: boolean): QuantitativeScale<D>;
            ticks(count?: number): any[];
            tickFormat(count: number, format?: string): (n: number) => string;
            domainer(): Domainer;
            domainer(domainer: Domainer): QuantitativeScale<D>;
        }
    }
}


declare module Plottable {
    module Scale {
        class Linear extends Plottable.Abstract.QuantitativeScale<number> {
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            copy(): Linear;
        }
    }
}


declare module Plottable {
    module Scale {
        class Log extends Plottable.Abstract.QuantitativeScale<number> {
            constructor();
            constructor(scale: D3.Scale.LogScale);
            copy(): Log;
        }
    }
}


declare module Plottable {
    module Scale {
        class ModifiedLog extends Plottable.Abstract.QuantitativeScale<number> {
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
        class Ordinal extends Plottable.Abstract.Scale<string, number> {
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
        class Color extends Plottable.Abstract.Scale<string, string> {
            constructor(scaleType?: string);
        }
    }
}


declare module Plottable {
    module Scale {
        class Time extends Plottable.Abstract.QuantitativeScale<any> {
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
        class InterpolatedColor extends Plottable.Abstract.Scale<number, string> {
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
        class ScaleDomainCoordinator<D> {
            constructor(scales: Plottable.Abstract.Scale<D, any>[]);
            rescale(scale: Plottable.Abstract.Scale<D, any>): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class _Drawer {
            renderArea: D3.Selection;
            key: string;
            constructor(key: string);
            remove(): void;
            draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Area extends Plottable.Abstract._Drawer {
            draw(data: any[][], attrToProjector: IAttributeToProjector): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Rect extends Plottable.Abstract._Drawer {
            draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Axis extends Component {
            static END_TICK_MARK_CLASS: string;
            static TICK_MARK_CLASS: string;
            static TICK_LABEL_CLASS: string;
            constructor(scale: Scale<any, number>, orientation: string, formatter?: (d: any) => string);
            remove(): void;
            width(): number;
            width(w: any): Axis;
            height(): number;
            height(h: any): Axis;
            formatter(): Formatter;
            formatter(formatter: Formatter): Axis;
            tickLength(): number;
            tickLength(length: number): Axis;
            endTickLength(): number;
            endTickLength(length: number): Axis;
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
        }
    }
}


declare module Plottable {
    module Axis {
        class Numeric extends Plottable.Abstract.Axis {
            constructor(scale: Plottable.Abstract.QuantitativeScale<number>, orientation: string, formatter?: (d: any) => string);
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
            constructor(scale: Plottable.Scale.Ordinal, orientation?: string, formatter?: (d: any) => string);
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
        class HorizontalLegend extends Plottable.Abstract.Component {
            static LEGEND_ROW_CLASS: string;
            static LEGEND_ENTRY_CLASS: string;
            constructor(colorScale: Plottable.Scale.Color);
            remove(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Gridlines extends Plottable.Abstract.Component {
            constructor(xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            remove(): Gridlines;
        }
    }
}


declare module Plottable {
    module Plot {
        class Scatter extends Plottable.Abstract.XYPlot {
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.Scale<any, number>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Scatter;
        }
    }
}


declare module Plottable {
    module Plot {
        class Grid extends Plottable.Abstract.XYPlot {
            colorScale: Plottable.Abstract.Scale<any, string>;
            xScale: Plottable.Scale.Ordinal;
            yScale: Plottable.Scale.Ordinal;
            constructor(dataset: any, xScale: Plottable.Scale.Ordinal, yScale: Plottable.Scale.Ordinal, colorScale: Plottable.Abstract.Scale<any, string>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Grid;
        }
    }
}


declare module Plottable {
    module Abstract {
        class BarPlot extends XYPlot {
            constructor(dataset: any, xScale: Scale<any, number>, yScale: Scale<any, number>);
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
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.QuantitativeScale<number>);
        }
    }
}


declare module Plottable {
    module Plot {
        class HorizontalBar extends Plottable.Abstract.BarPlot {
            isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<number>, yScale: Plottable.Abstract.Scale<any, number>);
        }
    }
}


declare module Plottable {
    module Plot {
        class Line extends Plottable.Abstract.XYPlot {
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
        }
    }
}


declare module Plottable {
    module Plot {
        class Area extends Line {
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Area;
        }
    }
}


declare module Plottable {
    module Abstract {
        class NewStyleBarPlot extends NewStylePlot {
            static DEFAULT_WIDTH: number;
            constructor(xScale: Scale<any, number>, yScale: Scale<any, number>);
            baseline(value: number): any;
        }
    }
}


declare module Plottable {
    module Plot {
        class ClusteredBar extends Plottable.Abstract.NewStyleBarPlot {
            static DEFAULT_WIDTH: number;
            constructor(xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.Scale<any, number>, isVertical?: boolean);
        }
    }
}


declare module Plottable {
    module Abstract {
        class Stacked extends NewStylePlot {
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedArea extends Plottable.Abstract.Stacked {
            constructor(xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedBar extends Plottable.Abstract.Stacked {
            constructor(xScale?: Plottable.Abstract.Scale<any, number>, yScale?: Plottable.Abstract.Scale<any, number>, isVertical?: boolean);
            baseline(value: number): any;
        }
    }
}


declare module Plottable {
    module Animator {
        class Null implements IPlotAnimator {
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animator {
        class Default implements IPlotAnimator {
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
            duration(): number;
            duration(duration: number): Default;
            delay(): number;
            delay(delay: number): Default;
            easing(): string;
            easing(easing: string): Default;
        }
    }
}


declare module Plottable {
    module Animator {
        class IterativeDelay extends Default {
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animator {
        class Rect extends Default {
            isVertical: boolean;
            isReverse: boolean;
            constructor(isVertical?: boolean, isReverse?: boolean);
            animate(selection: any, attrToProjector: IAttributeToProjector): any;
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
            xScale: Plottable.Abstract.QuantitativeScale<any>;
            yScale: Plottable.Abstract.QuantitativeScale<any>;
            constructor(componentToListenTo: Plottable.Abstract.Component, xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>);
            resetZoom(): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class BarHover extends Plottable.Abstract.Interaction {
            componentToListenTo: Plottable.Abstract.BarPlot;
            constructor(barPlot: Plottable.Abstract.BarPlot);
            hoverMode(): string;
            hoverMode(mode: string): BarHover;
            onHover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
            onUnhover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Drag extends Plottable.Abstract.Interaction {
            origin: number[];
            location: number[];
            constructor(componentToListenTo: Plottable.Abstract.Component);
            dragstart(): (startLocation: Point) => void;
            dragstart(cb: (startLocation: Point) => any): Drag;
            drag(): (startLocation: Point, endLocation: Point) => void;
            drag(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            dragend(): (startLocation: Point, endLocation: Point) => void;
            dragend(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            setupZoomCallback(xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>): Drag;
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
