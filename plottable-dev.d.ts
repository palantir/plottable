
declare module Plottable {
    module _Util {
        module Methods {
            function inRange(x: number, a: number, b: number): boolean;
            function warn(warning: string): void;
            function addArrays(alist: number[], blist: number[]): number[];
            function intersection<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function accessorize(accessor: any): _IAccessor;
            function union<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function populateMap<T>(keys: string[], transform: (key: string) => T): D3.Map<T>;
            function _applyAccessor(accessor: _IAccessor, plot: Plottable.Abstract.Plot): (d: any, i: number) => any;
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
    module _Util {
        module OpenSource {
            function sortedIndex(val: number, arr: number[]): number;
            function sortedIndex(val: number, arr: any[], accessor: _IAccessor): number;
        }
    }
}


declare module Plottable {
    module _Util {
        class IDCounter {
            increment(id: any): number;
            decrement(id: any): number;
            get(id: any): number;
        }
    }
}


declare module Plottable {
    module _Util {
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
    module _Util {
        class Cache<T> {
            constructor(compute: (k: string) => T, canonicalKey?: string, valueEq?: (v: T, w: T) => boolean);
            get(k: string): T;
            clear(): Cache<T>;
        }
    }
}


declare module Plottable {
    module _Util {
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
            function addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
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
    module _Util {
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
    module _Util {
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
    module Formatters {
        function currency(precision?: number, symbol?: string, prefix?: boolean, onlyShowUnchanged?: boolean): (d: any) => string;
        function fixed(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        function general(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        function identity(): (d: any) => string;
        function percentage(precision?: number, onlyShowUnchanged?: boolean): (d: any) => string;
        function siSuffix(precision?: number): (d: any) => string;
        function time(): (d: any) => string;
        function relativeDate(baseValue?: number, increment?: number, label?: string): (d: any) => string;
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
            _plottableID: number;
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
        _getExtent(accessor: _IAccessor): any[];
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
                    _timeoutMsec: number;
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
            function setRenderPolicy(policy: string): void;
            function setRenderPolicy(policy: RenderPolicy.IRenderPolicy): void;
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
            function clearResizing(): void;
            function register(c: Plottable.Abstract.Component): void;
            function deregister(c: Plottable.Abstract.Component): void;
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
    interface _IAccessor {
        (datum: any, index?: number, metadata?: any): any;
    }
    interface IAppliedAccessor {
        (datum: any, index: number): any;
    }
    interface _IProjector {
        accessor: _IAccessor;
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
    interface _ISpaceRequest {
        width: number;
        height: number;
        wantsWidth: boolean;
        wantsHeight: boolean;
    }
    interface _IPixelArea {
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
    interface DatasetDrawerKey {
        dataset: Dataset;
        drawer: Plottable.Abstract._Drawer;
        key: string;
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
        class Scale<D, R> extends PlottableObject implements Plottable.Core.IListenable {
            _d3Scale: D3.Scale.Scale;
            _autoDomainAutomatically: boolean;
            broadcaster: any;
            _rendererAttrID2Extent: {
                [x: string]: D[];
            };
            constructor(scale: D3.Scale.Scale);
            _getAllExtents(): D[][];
            _getExtent(): D[];
            autoDomain(): Scale<D, R>;
            _autoDomainIfAutomaticMode(): void;
            scale(value: D): R;
            domain(): D[];
            domain(values: D[]): Scale<D, R>;
            _getDomain(): any[];
            _setDomain(values: D[]): void;
            range(): R[];
            range(values: R[]): Scale<D, R>;
            copy(): Scale<D, R>;
            _updateExtent(plotProvidedKey: string, attr: string, extent: D[]): Scale<D, R>;
            _removeExtent(plotProvidedKey: string, attr: string): Scale<D, R>;
        }
    }
}


declare module Plottable {
    module Abstract {
        class QuantitativeScale<D> extends Scale<D, number> {
            _d3Scale: D3.Scale.QuantitativeScale;
            _lastRequestedTickCount: number;
            _PADDING_FOR_IDENTICAL_DOMAIN: number;
            _userSetDomainer: boolean;
            _domainer: Domainer;
            constructor(scale: D3.Scale.QuantitativeScale);
            _getExtent(): D[];
            invert(value: number): D;
            copy(): QuantitativeScale<D>;
            domain(): D[];
            domain(values: D[]): QuantitativeScale<D>;
            _setDomain(values: D[]): void;
            interpolate(): D3.Transition.Interpolate;
            interpolate(factory: D3.Transition.Interpolate): QuantitativeScale<D>;
            rangeRound(values: number[]): QuantitativeScale<D>;
            clamp(): boolean;
            clamp(clamp: boolean): QuantitativeScale<D>;
            ticks(count?: number): any[];
            _niceDomain(domain: any[], count?: number): any[];
            domainer(): Domainer;
            domainer(domainer: Domainer): QuantitativeScale<D>;
            _defaultExtent(): any[];
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
            _defaultExtent(): number[];
        }
    }
}


declare module Plottable {
    module Scale {
        class ModifiedLog extends Plottable.Abstract.QuantitativeScale<number> {
            constructor(base?: number);
            scale(x: number): number;
            invert(x: number): number;
            _getDomain(): number[];
            _setDomain(values: number[]): void;
            ticks(count?: number): number[];
            copy(): ModifiedLog;
            _niceDomain(domain: any[], count?: number): any[];
            showIntermediateTicks(): boolean;
            showIntermediateTicks(show: boolean): ModifiedLog;
        }
    }
}


declare module Plottable {
    module Scale {
        class Ordinal extends Plottable.Abstract.Scale<string, number> {
            _d3Scale: D3.Scale.OrdinalScale;
            constructor(scale?: D3.Scale.OrdinalScale);
            _getExtent(): string[];
            domain(): string[];
            domain(values: string[]): Ordinal;
            _setDomain(values: string[]): void;
            range(): number[];
            range(values: number[]): Ordinal;
            rangeBand(): number;
            innerPadding(): number;
            fullBandStartAndWidth(v: string): number[];
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
            _getExtent(): string[];
        }
    }
}


declare module Plottable {
    module Scale {
        class Time extends Plottable.Abstract.QuantitativeScale<any> {
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            _tickInterval(interval: D3.Time.Interval, step?: number): any[];
            domain(): any[];
            domain(values: any[]): Time;
            copy(): Time;
            _defaultExtent(): any[];
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
    module _Util {
        class ScaleDomainCoordinator<D> {
            constructor(scales: Plottable.Abstract.Scale<D, any>[]);
            rescale(scale: Plottable.Abstract.Scale<D, any>): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class _Drawer {
            _renderArea: D3.Selection;
            key: string;
            constructor(key: string);
            remove(): void;
            draw(data: any[], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Area extends Plottable.Abstract._Drawer {
            draw(data: any[], attrToProjector: IAttributeToProjector): void;
        }
    }
}


declare module Plottable {
    module _Drawer {
        class Rect extends Plottable.Abstract._Drawer {
            draw(data: any[], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Component extends PlottableObject {
            static AUTORESIZE_BY_DEFAULT: boolean;
            _element: D3.Selection;
            _content: D3.Selection;
            _backgroundContainer: D3.Selection;
            _foregroundContainer: D3.Selection;
            clipPathEnabled: boolean;
            _parent: ComponentContainer;
            _xAlignProportion: number;
            _yAlignProportion: number;
            _fixedHeightFlag: boolean;
            _fixedWidthFlag: boolean;
            _isSetup: boolean;
            _isAnchored: boolean;
            _anchor(element: D3.Selection): void;
            _setup(): void;
            _requestedSpace(availableWidth: number, availableHeight: number): _ISpaceRequest;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _render(): void;
            _scheduleComputeLayout(): void;
            _doRender(): void;
            _invalidateLayout(): void;
            renderTo(selector: String): Component;
            renderTo(element: D3.Selection): Component;
            resize(width?: number, height?: number): Component;
            autoResize(flag: boolean): Component;
            xAlign(alignment: string): Component;
            yAlign(alignment: string): Component;
            xOffset(offset: number): Component;
            yOffset(offset: number): Component;
            registerInteraction(interaction: Interaction): Component;
            classed(cssClass: string): boolean;
            classed(cssClass: string, addClass: boolean): Component;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
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
            _components: Component[];
            _anchor(element: D3.Selection): void;
            _render(): void;
            _removeComponent(c: Component): void;
            _addComponent(c: Component, prepend?: boolean): boolean;
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
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            merge(c: Plottable.Abstract.Component): Group;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Group;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Axis extends Component {
            static END_TICK_MARK_CLASS: string;
            static TICK_MARK_CLASS: string;
            static TICK_LABEL_CLASS: string;
            _tickMarkContainer: D3.Selection;
            _tickLabelContainer: D3.Selection;
            _baseline: D3.Selection;
            _scale: Scale<any, number>;
            _formatter: Formatter;
            _orientation: string;
            _userRequestedWidth: any;
            _userRequestedHeight: any;
            _computedWidth: number;
            _computedHeight: number;
            constructor(scale: Scale<any, number>, orientation: string, formatter?: (d: any) => string);
            remove(): void;
            _isHorizontal(): boolean;
            _computeWidth(): number;
            _computeHeight(): number;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _isFixedHeight(): boolean;
            _isFixedWidth(): boolean;
            _rescale(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _setup(): void;
            _getTickValues(): any[];
            _doRender(): void;
            _generateBaselineAttrHash(): {
                x1: number;
                y1: number;
                x2: number;
                y2: number;
            };
            _generateTickMarkAttrHash(isEndTickMark?: boolean): {
                x1: any;
                y1: any;
                x2: any;
                y2: any;
            };
            _invalidateLayout(): void;
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
            _maxLabelTickLength(): number;
            tickLabelPadding(): number;
            tickLabelPadding(padding: number): Axis;
            gutter(): number;
            gutter(size: number): Axis;
            orient(): string;
            orient(newOrientation: string): Axis;
            showEndTickLabels(): boolean;
            showEndTickLabels(show: boolean): Axis;
            _hideEndTickLabels(): void;
            _hideOverlappingTickLabels(): void;
        }
    }
}


declare module Plottable {
    module Axis {
        interface _ITimeInterval {
            timeUnit: D3.Time.Interval;
            step: number;
            formatString: string;
        }
        class Time extends Plottable.Abstract.Axis {
            _majorTickLabels: D3.Selection;
            _minorTickLabels: D3.Selection;
            _scale: Plottable.Scale.Time;
            static _minorIntervals: _ITimeInterval[];
            static _majorIntervals: _ITimeInterval[];
            constructor(scale: Plottable.Scale.Time, orientation: string);
            _computeHeight(): number;
            _setup(): void;
            _getTickIntervalValues(interval: _ITimeInterval): any[];
            _getTickValues(): any[];
            _measureTextHeight(container: D3.Selection): number;
            _doRender(): Time;
        }
    }
}


declare module Plottable {
    module Axis {
        class Numeric extends Plottable.Abstract.Axis {
            _scale: Plottable.Abstract.QuantitativeScale<number>;
            constructor(scale: Plottable.Abstract.QuantitativeScale<number>, orientation: string, formatter?: (d: any) => string);
            _setup(): void;
            _computeWidth(): number;
            _computeHeight(): number;
            _getTickValues(): any[];
            _rescale(): void;
            _doRender(): void;
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
            _scale: Plottable.Scale.Ordinal;
            _textOrientation: string;
            constructor(scale: Plottable.Scale.Ordinal, orientation?: string, formatter?: (d: any) => string);
            _setup(): void;
            _rescale(): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _getTickValues(): string[];
            textOrientation(): string;
            textOrientation(newOrientation: string): Category;
            _doRender(): Category;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Label extends Plottable.Abstract.Component {
            constructor(displayText?: string, orientation?: string);
            xAlign(alignment: string): Label;
            yAlign(alignment: string): Label;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _setup(): void;
            text(): string;
            text(displayText: string): Label;
            _doRender(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): Label;
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
            toggleCallback(): ToggleCallback;
            toggleCallback(callback: ToggleCallback): Legend;
            hoverCallback(): HoverCallback;
            hoverCallback(callback: HoverCallback): Legend;
            scale(): Plottable.Scale.Color;
            scale(scale: Plottable.Scale.Color): Legend;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _doRender(): void;
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
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
        class Gridlines extends Plottable.Abstract.Component {
            constructor(xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            remove(): Gridlines;
            _setup(): void;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
        interface _IterateLayoutResult {
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
            _removeComponent(component: Plottable.Abstract.Component): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            padding(rowPadding: number, colPadding: number): Table;
            rowWeight(index: number, weight: number): Table;
            colWeight(index: number, weight: number): Table;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Plot extends Component {
            _dataset: Dataset;
            _dataChanged: boolean;
            _renderArea: D3.Selection;
            _animate: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            _ANIMATION_DURATION: number;
            _projectors: {
                [x: string]: _IProjector;
            };
            constructor();
            constructor(data: any[]);
            constructor(dataset: Dataset);
            _anchor(element: D3.Selection): void;
            remove(): void;
            dataset(): Dataset;
            dataset(dataset: Dataset): Plot;
            _onDatasetUpdate(): void;
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): Plot;
            _generateAttrToProjector(): IAttributeToProjector;
            _doRender(): void;
            _paint(): void;
            _setup(): void;
            animate(enabled: boolean): Plot;
            detach(): Plot;
            _updateAllProjectors(): void;
            _updateProjector(attr: string): void;
            _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: IAttributeToProjector): any;
            animator(animatorKey: string): Plottable.Animator.IPlotAnimator;
            animator(animatorKey: string, animator: Plottable.Animator.IPlotAnimator): Plot;
        }
    }
}


declare module Plottable {
    module Abstract {
        class XYPlot<X, Y> extends Plot {
            _xScale: Scale<X, number>;
            _yScale: Scale<Y, number>;
            constructor(dataset: any, xScale: Scale<X, number>, yScale: Scale<Y, number>);
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): XYPlot<X, Y>;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _updateXDomainer(): void;
            _updateYDomainer(): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class NewStylePlot<X, Y> extends XYPlot<X, Y> {
            _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
            _datasetKeysInOrder: string[];
            constructor(xScale?: Scale<X, number>, yScale?: Scale<Y, number>);
            _setup(): void;
            remove(): void;
            addDataset(key: string, dataset: Dataset): NewStylePlot<X, Y>;
            addDataset(key: string, dataset: any[]): NewStylePlot<X, Y>;
            addDataset(dataset: Dataset): NewStylePlot<X, Y>;
            addDataset(dataset: any[]): NewStylePlot<X, Y>;
            _addDataset(key: string, dataset: Dataset): void;
            _getDrawer(key: string): _Drawer;
            _getAnimator(drawer: _Drawer, index: number): Plottable.Animator.IPlotAnimator;
            _updateProjector(attr: string): void;
            datasetOrder(): string[];
            datasetOrder(order: string[]): NewStylePlot<X, Y>;
            removeDataset(key: string): NewStylePlot<X, Y>;
            _getDatasetsInOrder(): Dataset[];
            _getDrawersInOrder(): _Drawer[];
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class Scatter<X, Y> extends Plottable.Abstract.XYPlot<X, Y> {
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<X, number>, yScale: Plottable.Abstract.Scale<Y, number>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Scatter<X, Y>;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class Grid extends Plottable.Abstract.XYPlot<string, string> {
            _colorScale: Plottable.Abstract.Scale<any, string>;
            _xScale: Plottable.Scale.Ordinal;
            _yScale: Plottable.Scale.Ordinal;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Scale.Ordinal, yScale: Plottable.Scale.Ordinal, colorScale: Plottable.Abstract.Scale<any, string>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Grid;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class BarPlot<X, Y> extends XYPlot<X, Y> {
            _bars: D3.UpdateSelection;
            _baseline: D3.Selection;
            _baselineValue: number;
            _barAlignmentFactor: number;
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            _isVertical: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Scale<X, number>, yScale: Scale<Y, number>);
            _setup(): void;
            _paint(): void;
            baseline(value: number): BarPlot<X, Y>;
            barAlignment(alignment: string): BarPlot<X, Y>;
            selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            deselectAll(): BarPlot<X, Y>;
            _updateDomainer(scale: Scale<any, number>): void;
            _updateYDomainer(): void;
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plot {
        class VerticalBar<X> extends Plottable.Abstract.BarPlot<X, number> {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<X, number>, yScale: Plottable.Abstract.QuantitativeScale<number>);
            _updateYDomainer(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class HorizontalBar<Y> extends Plottable.Abstract.BarPlot<number, Y> {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<number>, yScale: Plottable.Abstract.Scale<Y, number>);
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plot {
        class Line<X> extends Plottable.Abstract.XYPlot<X, number> {
            _yScale: Plottable.Abstract.QuantitativeScale<number>;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<X>, yScale: Plottable.Abstract.QuantitativeScale<number>);
            _setup(): void;
            _appendPath(): void;
            _getResetYFunction(): (d: any, i: number) => number;
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
            _wholeDatumAttributes(): string[];
        }
    }
}


declare module Plottable {
    module Plot {
        class Area<X> extends Line<X> {
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<X>, yScale: Plottable.Abstract.QuantitativeScale<number>);
            _appendPath(): void;
            _onDatasetUpdate(): void;
            _updateYDomainer(): void;
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Area<X>;
            _getResetYFunction(): IAppliedAccessor;
            _paint(): void;
            _wholeDatumAttributes(): string[];
        }
    }
}


declare module Plottable {
    module Abstract {
        class NewStyleBarPlot<X, Y> extends NewStylePlot<X, Y> {
            static _barAlignmentToFactor: {
                [x: string]: number;
            };
            _baseline: D3.Selection;
            _baselineValue: number;
            _barAlignmentFactor: number;
            _isVertical: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>);
            _getDrawer(key: string): Plottable._Drawer.Rect;
            _setup(): void;
            _paint(): void;
            baseline(value: number): any;
            _updateDomainer(scale: Scale<any, number>): any;
            _generateAttrToProjector(): IAttributeToProjector;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
        }
    }
}


declare module Plottable {
    module Plot {
        class ClusteredBar<X, Y> extends Plottable.Abstract.NewStyleBarPlot<X, Y> {
            constructor(xScale: Plottable.Abstract.Scale<X, number>, yScale: Plottable.Abstract.Scale<Y, number>, isVertical?: boolean);
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Stacked<X, Y> extends NewStylePlot<X, Y> {
            _isVertical: boolean;
            _onDatasetUpdate(): void;
            _updateAllProjectors(): void;
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedArea<X> extends Plottable.Abstract.Stacked<X, number> {
            _baseline: D3.Selection;
            _baselineValue: number;
            constructor(xScale: Plottable.Abstract.QuantitativeScale<X>, yScale: Plottable.Abstract.QuantitativeScale<number>);
            _getDrawer(key: string): Plottable._Drawer.Area;
            _setup(): void;
            _paint(): void;
            _updateYDomainer(): void;
            _onDatasetUpdate(): void;
            _generateAttrToProjector(): IAttributeToProjector;
        }
    }
}


declare module Plottable {
    module Plot {
        class StackedBar<X, Y> extends Plottable.Abstract.Stacked<X, Y> {
            _baselineValue: number;
            _baseline: D3.Selection;
            _barAlignmentFactor: number;
            constructor(xScale?: Plottable.Abstract.Scale<X, number>, yScale?: Plottable.Abstract.Scale<Y, number>, isVertical?: boolean);
            _getAnimator(drawer: Plottable.Abstract._Drawer, index: number): Plottable.Animator.Rect;
            _getDrawer(key: string): any;
            _generateAttrToProjector(): any;
            baseline(value: number): any;
            _updateDomainer(scale: Plottable.Abstract.Scale<any, number>): any;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
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
    module Animator {
        class Null implements IPlotAnimator {
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animator {
        class Base implements IPlotAnimator {
            static DEFAULT_DURATION_MILLISECONDS: number;
            static DEFAULT_DELAY_MILLISECONDS: number;
            static DEFAULT_EASING: string;
            constructor();
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
            duration(): number;
            duration(duration: number): Base;
            delay(): number;
            delay(delay: number): Base;
            easing(): string;
            easing(easing: string): Base;
        }
    }
}


declare module Plottable {
    module Animator {
        class IterativeDelay extends Base {
            static DEFAULT_ITERATIVE_DELAY_MILLISECONDS: number;
            constructor();
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
            iterativeDelay(): number;
            iterativeDelay(iterDelay: number): IterativeDelay;
        }
    }
}


declare module Plottable {
    module Animator {
        class Rect extends Base {
            static ANIMATED_ATTRIBUTES: string[];
            isVertical: boolean;
            isReverse: boolean;
            constructor(isVertical?: boolean, isReverse?: boolean);
            animate(selection: any, attrToProjector: IAttributeToProjector): any;
            _startMovingProjector(attrToProjector: IAttributeToProjector): IAppliedAccessor;
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
        class Interaction extends PlottableObject {
            _hitBox: D3.Selection;
            _componentToListenTo: Component;
            _anchor(component: Component, hitBox: D3.Selection): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Click extends Plottable.Abstract.Interaction {
            _anchor(component: Plottable.Abstract.Component, hitBox: D3.Selection): void;
            _listenTo(): string;
            callback(cb: (p: Point) => any): Click;
        }
        class DoubleClick extends Click {
            _listenTo(): string;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Key extends Plottable.Abstract.Interaction {
            constructor(keyCode: number);
            _anchor(component: Plottable.Abstract.Component, hitBox: D3.Selection): void;
            callback(cb: () => any): Key;
        }
    }
}


declare module Plottable {
    module Interaction {
        class PanZoom extends Plottable.Abstract.Interaction {
            _xScale: Plottable.Abstract.QuantitativeScale<any>;
            _yScale: Plottable.Abstract.QuantitativeScale<any>;
            constructor(xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>);
            resetZoom(): void;
            _anchor(component: Plottable.Abstract.Component, hitBox: D3.Selection): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class BarHover extends Plottable.Abstract.Interaction {
            _componentToListenTo: Plottable.Abstract.BarPlot<any, any>;
            _anchor(barPlot: Plottable.Abstract.BarPlot<any, any>, hitBox: D3.Selection): void;
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
            _origin: number[];
            _location: number[];
            constructor();
            dragstart(): (startLocation: Point) => void;
            dragstart(cb: (startLocation: Point) => any): Drag;
            drag(): (startLocation: Point, endLocation: Point) => void;
            drag(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            dragend(): (startLocation: Point, endLocation: Point) => void;
            dragend(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            _dragstart(): void;
            _doDragstart(): void;
            _drag(): void;
            _doDrag(): void;
            _dragend(): void;
            _doDragend(): void;
            _anchor(component: Plottable.Abstract.Component, hitBox: D3.Selection): Drag;
            setupZoomCallback(xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>): Drag;
        }
    }
}


declare module Plottable {
    module Interaction {
        class DragBox extends Drag {
            dragBox: D3.Selection;
            boxIsDrawn: boolean;
            _dragstart(): void;
            clearBox(): DragBox;
            setBox(x0: number, x1: number, y0: number, y1: number): DragBox;
            _anchor(component: Plottable.Abstract.Component, hitBox: D3.Selection): DragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XDragBox extends DragBox {
            _drag(): void;
            setBox(x0: number, x1: number): XDragBox;
        }
    }
}


declare module Plottable {
    module Interaction {
        class XYDragBox extends DragBox {
            _drag(): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class YDragBox extends DragBox {
            _drag(): void;
            setBox(y0: number, y1: number): YDragBox;
        }
    }
}


declare module Plottable {
    module Abstract {
        class Dispatcher extends PlottableObject {
            _target: D3.Selection;
            _event2Callback: {
                [x: string]: () => any;
            };
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
