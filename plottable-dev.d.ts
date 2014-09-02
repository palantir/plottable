
declare module Plottable {
    module Util {
        module Methods {
            function inRange(x: number, a: number, b: number): boolean;
            function warn(warning: string): void;
            function addArrays(alist: number[], blist: number[]): number[];
            function intersection<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function _accessorize(accessor: any): IAccessor;
            function union<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string>;
            function populateMap<T>(keys: string[], transform: (key: string) => T): D3.Map<T>;
            function _applyAccessor(accessor: IAccessor, plot: Plottable.Abstract.Plot): (d: any, i: number) => any;
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
            function _addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string;
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Remove comments from built files.
            registerListener(key: any, callback: IBroadcasterCallback): Broadcaster;
            broadcast(...args: any[]): Broadcaster;
            deregisterListener(key: any): Broadcaster;
            deregisterAllListeners(): void;
<<<<<<< HEAD
=======
            /**
            * Registers a callback to be called when the broadcast method is called. Also takes a key which
            * is used to support deregistering the same callback later, by passing in the same key.
            * If there is already a callback associated with that key, then the callback will be replaced.
            *
            * @param key The key associated with the callback. Key uniqueness is determined by deep equality.
            * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
            * @returns {Broadcaster} this object
            */
            public registerListener(key: any, callback: IBroadcasterCallback): Broadcaster;
            /**
            * Call all listening callbacks, optionally with arguments passed through.
            *
            * @param ...args A variable number of optional arguments
            * @returns {Broadcaster} this object
            */
            public broadcast(...args: any[]): Broadcaster;
            /**
            * Deregisters the callback associated with a key.
            *
            * @param key The key to deregister.
            * @returns {Broadcaster} this object
            */
            public deregisterListener(key: any): Broadcaster;
            /**
            * Deregisters all listeners and callbacks associated with the broadcaster.
            *
            * @returns {Broadcaster} this object
            */
            public deregisterAllListeners(): void;
>>>>>>> Release version 0.27.0
=======
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
<<<<<<< HEAD
<<<<<<< HEAD
    class Dataset extends Plottable.Abstract.PlottableObject implements Plottable.Core.IListenable {
        broadcaster: any;
        constructor(data?: any[], metadata?: any);
        data(): any[];
        data(data: any[]): Dataset;
        metadata(): any;
        metadata(metadata: any): Dataset;
        _getExtent(accessor: IAccessor): any[];
=======
    class DataSource extends Abstract.PlottableObject implements Core.IListenable {
        public broadcaster: Core.Broadcaster;
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        constructor(data?: any[], metadata?: any);
        /**
        * Gets the data.
        *
        * @returns {any[]} The current data.
        */
        public data(): any[];
        /**
        * Sets new data.
        *
        * @param {any[]} data The new data.
        * @returns {DataSource} The calling DataSource.
        */
        public data(data: any[]): DataSource;
        /**
        * Gets the metadata.
        *
        * @returns {any} The current metadata.
        */
        public metadata(): any;
        /**
        * Sets the metadata.
        *
        * @param {any} metadata The new metadata.
        * @returns {DataSource} The calling DataSource.
        */
        public metadata(metadata: any): DataSource;
        public _getExtent(accessor: IAccessor): any[];
>>>>>>> Release version 0.27.0
=======
    class DataSource extends Plottable.Abstract.PlottableObject implements Plottable.Core.IListenable {
        broadcaster: any;
        constructor(data?: any[], metadata?: any);
        data(): any[];
        data(data: any[]): DataSource;
        metadata(): any;
        metadata(metadata: any): DataSource;
        _getExtent(accessor: IAccessor): any[];
>>>>>>> Remove comments from built files.
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
            _parent: ComponentContainer;
            _xAlignProportion: number;
            _yAlignProportion: number;
            _fixedHeightFlag: boolean;
            _fixedWidthFlag: boolean;
            _isSetup: boolean;
            _isAnchored: boolean;
            _anchor(element: D3.Selection): void;
            _setup(): void;
            _requestedSpace(availableWidth: number, availableHeight: number): ISpaceRequest;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _render(): void;
            _scheduleComputeLayout(): void;
            _doRender(): void;
            _invalidateLayout(): void;
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
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            merge(c: Plottable.Abstract.Component): Group;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): Group;
            _isFixedWidth(): boolean;
            _isFixedHeight(): boolean;
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
            _removeComponent(component: Plottable.Abstract.Component): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
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
<<<<<<< HEAD
<<<<<<< HEAD
        class Scale<D, R> extends PlottableObject implements Plottable.Core.IListenable {
            _d3Scale: D3.Scale.Scale;
            _autoDomainAutomatically: boolean;
            broadcaster: any;
            _rendererAttrID2Extent: {
                [x: string]: D[];
=======
        class Scale extends PlottableObject implements Core.IListenable {
            public _d3Scale: D3.Scale.Scale;
            public broadcaster: Core.Broadcaster;
            public _rendererAttrID2Extent: {
                [rendererAttrID: string]: any[];
>>>>>>> Release version 0.27.0
=======
        class Scale extends PlottableObject implements Plottable.Core.IListenable {
            _d3Scale: D3.Scale.Scale;
            broadcaster: any;
            _rendererAttrID2Extent: {
                [x: string]: any[];
>>>>>>> Remove comments from built files.
            };
            constructor(scale: D3.Scale.Scale);
<<<<<<< HEAD
<<<<<<< HEAD
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
            updateExtent(plotProvidedKey: string, attr: string, extent: D[]): Scale<D, R>;
            removeExtent(plotProvidedKey: string, attr: string): Scale<D, R>;
=======
            public _getAllExtents(): any[][];
            public _getExtent(): any[];
            /**
            * Modify the domain on the scale so that it includes the extent of all
            * perspectives it depends on. Extent: The (min, max) pair for a
            * QuantitiativeScale, all covered strings for an OrdinalScale.
            * Perspective: A combination of a DataSource and an Accessor that
            * represents a view in to the data.
            */
            public autoDomain(): Scale;
            public _autoDomainIfAutomaticMode(): void;
            /**
            * Returns the range value corresponding to a given domain value.
            *
            * @param value {any} A domain value to be scaled.
            * @returns {any} The range value corresponding to the supplied domain value.
            */
            public scale(value: any): any;
            /**
            * Gets the domain.
            *
            * @returns {any[]} The current domain.
            */
            public domain(): any[];
            /**
            * Sets the Scale's domain to the specified values.
            *
            * @param {any[]} values The new value for the domain. This array may
            *     contain more than 2 values if the scale type allows it (e.g.
            *     ordinal scales). Other scales such as quantitative scales accept
            *     only a 2-value extent array.
            * @returns {Scale} The calling Scale.
            */
            public domain(values: any[]): Scale;
            public _getDomain(): any[];
            public _setDomain(values: any[]): void;
            /**
            * Gets the range.
            *
            * @returns {any[]} The current range.
            */
            public range(): any[];
            /**
            * Sets the Scale's range to the specified values.
            *
            * @param {any[]} values The new values for the range.
            * @returns {Scale} The calling Scale.
            */
            public range(values: any[]): Scale;
            /**
            * Creates a copy of the Scale with the same domain and range but without any registered listeners.
            *
            * @returns {Scale} A copy of the calling Scale.
            */
            public copy(): Scale;
            /**
            * When a renderer determines that the extent of a projector has changed,
            * it will call this function. This function should ensure that
            * the scale has a domain at least large enough to include extent.
            *
            * @param {number} rendererID A unique indentifier of the renderer sending
            *                 the new extent.
            * @param {string} attr The attribute being projected, e.g. "x", "y0", "r"
            * @param {any[]} extent The new extent to be included in the scale.
            */
            public updateExtent(plotProvidedKey: string, attr: string, extent: any[]): Scale;
            public removeExtent(plotProvidedKey: string, attr: string): Scale;
>>>>>>> Release version 0.27.0
=======
            _getAllExtents(): any[][];
            _getExtent(): any[];
            autoDomain(): Scale;
            _autoDomainIfAutomaticMode(): void;
            scale(value: any): any;
            domain(): any[];
            domain(values: any[]): Scale;
            _getDomain(): any[];
            _setDomain(values: any[]): void;
            range(): any[];
            range(values: any[]): Scale;
            copy(): Scale;
            updateExtent(plotProvidedKey: string, attr: string, extent: any[]): Scale;
            removeExtent(plotProvidedKey: string, attr: string): Scale;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class Plot extends Component {
<<<<<<< HEAD
<<<<<<< HEAD
            _dataset: Dataset;
=======
            _dataSource: DataSource;
>>>>>>> Remove comments from built files.
            _dataChanged: boolean;
            renderArea: D3.Selection;
            element: D3.Selection;
            _animate: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            _ANIMATION_DURATION: number;
            _projectors: {
                [x: string]: _IProjector;
<<<<<<< HEAD
=======
            public _dataSource: DataSource;
            public _dataChanged: boolean;
            public renderArea: D3.Selection;
            public element: D3.Selection;
            public _animate: boolean;
            public _animators: Animator.IPlotAnimatorMap;
            public _ANIMATION_DURATION: number;
            public _projectors: {
                [attrToSet: string]: _IProjector;
>>>>>>> Release version 0.27.0
=======
>>>>>>> Remove comments from built files.
            };
            constructor();
<<<<<<< HEAD
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
=======
            constructor(dataset: any[]);
            constructor(dataset: DataSource);
<<<<<<< HEAD
            public _anchor(element: D3.Selection): void;
            public remove(): void;
            /**
            * Gets the Plot's DataSource.
            *
            * @return {DataSource} The current DataSource.
            */
            public dataSource(): DataSource;
            /**
            * Sets the Plot's DataSource.
            *
            * @param {DataSource} source The DataSource the Plot should use.
            * @return {Plot} The calling Plot.
            */
            public dataSource(source: DataSource): Plot;
            public _onDataSourceUpdate(): void;
            public project(attrToSet: string, accessor: any, scale?: Scale): Plot;
            public _generateAttrToProjector(): IAttributeToProjector;
            public _doRender(): void;
            public _paint(): void;
            public _setup(): void;
            /**
            * Enables or disables animation.
            *
            * @param {boolean} enabled Whether or not to animate.
            */
            public animate(enabled: boolean): Plot;
            public detach(): Plot;
            /**
            * This function makes sure that all of the scales in this._projectors
            * have an extent that includes all the data that is projected onto them.
            */
            public _updateAllProjectors(): void;
            public _updateProjector(attr: string): void;
            /**
            * Apply attributes to the selection.
            *
            * If animation is enabled and a valid animator's key is specified, the
            * attributes are applied with the animator. Otherwise, they are applied
            * immediately to the selection.
            *
            * The animation will not animate during auto-resize renders.
            *
            * @param {D3.Selection} selection The selection of elements to update.
            * @param {string} animatorKey The key for the animator.
            * @param {IAttributeToProjector} attrToProjector The set of attributes to set on the selection.
            * @return {D3.Selection} The resulting selection (potentially after the transition)
            */
            public _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: IAttributeToProjector): any;
            /**
            * Gets the animator associated with the specified Animator key.
            *
            * @param {string} animatorKey The key for the Animator.
            * @return {Animator.IPlotAnimator} The Animator for the specified key.
            */
            public animator(animatorKey: string): Animator.IPlotAnimator;
            /**
            * Sets the animator associated with the specified Animator key.
            *
            * @param {string} animatorKey The key for the Animator.
            * @param {Animator.IPlotAnimator} animator An Animator to be assigned to
            *                                          the specified key.
            * @return {Plot} The calling Plot.
            */
            public animator(animatorKey: string, animator: Animator.IPlotAnimator): Plot;
>>>>>>> Release version 0.27.0
=======
            _anchor(element: D3.Selection): void;
            remove(): void;
            dataSource(): DataSource;
            dataSource(source: DataSource): Plot;
            _onDataSourceUpdate(): void;
            project(attrToSet: string, accessor: any, scale?: Scale): Plot;
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
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class XYPlot extends Plot {
<<<<<<< HEAD
<<<<<<< HEAD
            xScale: Scale<any, number>;
            yScale: Scale<any, number>;
            constructor(dataset: any, xScale: Scale<any, number>, yScale: Scale<any, number>);
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): XYPlot;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _updateXDomainer(): void;
            _updateYDomainer(): void;
=======
            public xScale: Scale;
            public yScale: Scale;
            /**
            * Creates an XYPlot.
            *
            * @constructor
            * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            public project(attrToSet: string, accessor: any, scale?: Scale): XYPlot;
            public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            public _updateXDomainer(): void;
            public _updateYDomainer(): void;
>>>>>>> Release version 0.27.0
=======
            xScale: Scale;
            yScale: Scale;
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            project(attrToSet: string, accessor: any, scale?: Scale): XYPlot;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _updateXDomainer(): void;
            _updateYDomainer(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    interface DatasetDrawerKey {
<<<<<<< HEAD
        dataset: Dataset;
        drawer: Plottable.Abstract._Drawer;
=======
        dataset: DataSource;
<<<<<<< HEAD
        drawer: Abstract._Drawer;
>>>>>>> Release version 0.27.0
=======
        drawer: Plottable.Abstract._Drawer;
>>>>>>> Remove comments from built files.
        key: string;
    }
    module Abstract {
        class NewStylePlot extends XYPlot {
<<<<<<< HEAD
<<<<<<< HEAD
            _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
            _datasetKeysInOrder: string[];
            constructor(xScale?: Scale<any, number>, yScale?: Scale<any, number>);
            _setup(): void;
            remove(): void;
            addDataset(key: string, dataset: Dataset): NewStylePlot;
            addDataset(key: string, dataset: any[]): NewStylePlot;
            addDataset(dataset: Dataset): NewStylePlot;
            addDataset(dataset: any[]): NewStylePlot;
            _addDataset(key: string, dataset: Dataset): void;
            _getDrawer(key: string): _Drawer;
            _updateProjector(attr: string): void;
            datasetOrder(): string[];
            datasetOrder(order: string[]): NewStylePlot;
            removeDataset(key: string): NewStylePlot;
            _getDatasetsInOrder(): Dataset[];
            _getDrawersInOrder(): _Drawer[];
            _paint(): void;
            _draw(attrToProjector: IAttributeToProjector): void;
=======
            public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
            public _datasetKeysInOrder: string[];
            /**
            * Creates a NewStylePlot.
            *
            * @constructor
            * @param [Scale] xScale The x scale to use
            * @param [Scale] yScale The y scale to use
            */
            constructor(xScale?: Scale, yScale?: Scale);
            public _setup(): void;
            public remove(): void;
            /**
            * Adds a dataset to this plot. Identify this dataset with a key.
            *
            * A key is automatically generated if not supplied.
            *
            * @param {string} [key] The key of the dataset.
            * @param {any[]|DataSource} dataset dataset to add.
            * @return {NewStylePlot} The calling NewStylePlot.
            */
            public addDataset(key: string, dataset: DataSource): NewStylePlot;
            public addDataset(key: string, dataset: any[]): NewStylePlot;
            public addDataset(dataset: DataSource): NewStylePlot;
            public addDataset(dataset: any[]): NewStylePlot;
            public _addDataset(key: string, dataset: DataSource): void;
            public _getDrawer(key: string): _Drawer;
            public _updateProjector(attr: string): void;
            /**
            * Gets the dataset order by key
            *
            * @return {string[]} a string array of the keys in order
            */
            public datasetOrder(): string[];
            /**
            * Sets the dataset order by key
            *
            * @param {string[]} order A string array which represents the order of the keys. This must be a permutation of existing keys.
            */
            public datasetOrder(order: string[]): NewStylePlot;
            /**
            * Removes a dataset
            *
            * @param {string} key The key of the dataset
            * @return {NewStylePlot} The calling NewStylePlot.
            */
            public removeDataset(key: string): NewStylePlot;
            public _getDatasetsInOrder(): DataSource[];
            public _getDrawersInOrder(): _Drawer[];
>>>>>>> Release version 0.27.0
=======
            _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
            _datasetKeysInOrder: string[];
            constructor(xScale?: Scale, yScale?: Scale);
            _setup(): void;
            remove(): void;
            addDataset(key: string, dataset: DataSource): NewStylePlot;
            addDataset(key: string, dataset: any[]): NewStylePlot;
            addDataset(dataset: DataSource): NewStylePlot;
            addDataset(dataset: any[]): NewStylePlot;
            _addDataset(key: string, dataset: DataSource): void;
            _getDrawer(key: string): _Drawer;
            _updateProjector(attr: string): void;
            datasetOrder(): string[];
            datasetOrder(order: string[]): NewStylePlot;
            removeDataset(key: string): NewStylePlot;
            _getDatasetsInOrder(): DataSource[];
            _getDrawersInOrder(): _Drawer[];
>>>>>>> Remove comments from built files.
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
<<<<<<< HEAD
<<<<<<< HEAD
        scale?: Plottable.Abstract.Scale<any, any>;
=======
        scale?: Abstract.Scale;
>>>>>>> Release version 0.27.0
=======
        scale?: Plottable.Abstract.Scale;
>>>>>>> Remove comments from built files.
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
<<<<<<< HEAD
<<<<<<< HEAD
        computeDomain(extents: any[][], scale: Plottable.Abstract.QuantitativeScale<any>): any[];
=======
        computeDomain(extents: any[][], scale: Plottable.Abstract.QuantitativeScale): any[];
>>>>>>> Remove comments from built files.
        pad(padProportion?: number): Domainer;
        addPaddingException(exception: any, key?: string): Domainer;
        removePaddingException(keyOrException: any): Domainer;
        addIncludedValue(value: any, key?: string): Domainer;
        removeIncludedValue(valueOrKey: any): Domainer;
        nice(count?: number): Domainer;
<<<<<<< HEAD
=======
        /**
        * @param {any[][]} extents The list of extents to be reduced to a single
        *        extent.
        * @param {Abstract.QuantitativeScale} scale
        *        Since nice() must do different things depending on Linear, Log,
        *        or Time scale, the scale must be passed in for nice() to work.
        * @return {any[]} The domain, as a merging of all exents, as a [min, max]
        *                 pair.
        */
        public computeDomain(extents: any[][], scale: Abstract.QuantitativeScale): any[];
        /**
        * Sets the Domainer to pad by a given ratio.
        *
        * @param {number} [padProportion] Proportionally how much bigger the
        *         new domain should be (0.05 = 5% larger).
        *
        *         A domainer will pad equal visual amounts on each side.
        *         On a linear scale, this means both sides are padded the same
        *         amount: [10, 20] will be padded to [5, 25].
        *         On a log scale, the top will be padded more than the bottom, so
        *         [10, 100] will be padded to [1, 1000].
        *
        * @return {Domainer} The calling Domainer.
        */
        public pad(padProportion?: number): Domainer;
        /**
        * Add a padding exception, a value that will not be padded at either end of the domain.
        *
        * Eg, if a padding exception is added at x=0, then [0, 100] will pad to [0, 105] instead of [-2.5, 102.5].
        * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
        * If a key is not provided, it will be added with set semantics (Can be removed by value)
        *
        * @param {any} exception The padding exception to add.
        * @param string [key] The key to register the exception under.
        * @return Domainer The calling domainer
        */
        public addPaddingException(exception: any, key?: string): Domainer;
        /**
        * Remove a padding exception, allowing the domain to pad out that value again.
        *
        * If a string is provided, it is assumed to be a key and the exception associated with that key is removed.
        * If a non-string is provdied, it is assumed to be an unkeyed exception and that exception is removed.
        *
        * @param {any} keyOrException The key for the value to remove, or the value to remove
        * @return Domainer The calling domainer
        */
        public removePaddingException(keyOrException: any): Domainer;
        /**
        * Add an included value, a value that must be included inside the domain.
        *
        * Eg, if a value exception is added at x=0, then [50, 100] will expand to [0, 100] rather than [50, 100].
        * If a key is provided, it will be registered under that key with standard map semantics. (Overwrite / remove by key)
        * If a key is not provided, it will be added with set semantics (Can be removed by value)
        *
        * @param {any} value The included value to add.
        * @param string [key] The key to register the value under.
        * @return Domainer The calling domainer
        */
        public addIncludedValue(value: any, key?: string): Domainer;
        /**
        * Remove an included value, allowing the domain to not include that value gain again.
        *
        * If a string is provided, it is assumed to be a key and the value associated with that key is removed.
        * If a non-string is provdied, it is assumed to be an unkeyed value and that value is removed.
        *
        * @param {any} keyOrException The key for the value to remove, or the value to remove
        * @return Domainer The calling domainer
        */
        public removeIncludedValue(valueOrKey: any): Domainer;
        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        * @return {Domainer} The calling Domainer.
        */
        public nice(count?: number): Domainer;
>>>>>>> Release version 0.27.0
=======
>>>>>>> Remove comments from built files.
    }
}


declare module Plottable {
    module Abstract {
<<<<<<< HEAD
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
            tickFormat(count: number, format?: string): (n: number) => string;
            _niceDomain(domain: any[], count?: number): any[];
            domainer(): Domainer;
            domainer(domainer: Domainer): QuantitativeScale<D>;
            _defaultExtent(): any[];
=======
        class QuantitativeScale extends Scale {
            _d3Scale: D3.Scale.QuantitativeScale;
            _lastRequestedTickCount: number;
            _PADDING_FOR_IDENTICAL_DOMAIN: number;
            _userSetDomainer: boolean;
            constructor(scale: D3.Scale.QuantitativeScale);
<<<<<<< HEAD
            public _getExtent(): any[];
            /**
            * Retrieves the domain value corresponding to a supplied range value.
            *
            * @param {number} value: A value from the Scale's range.
            * @returns {number} The domain value corresponding to the supplied range value.
            */
            public invert(value: number): number;
            /**
            * Creates a copy of the QuantitativeScale with the same domain and range but without any registered listeners.
            *
            * @returns {QuantitativeScale} A copy of the calling QuantitativeScale.
            */
            public copy(): QuantitativeScale;
            public domain(): any[];
            public domain(values: any[]): QuantitativeScale;
            public _setDomain(values: any[]): void;
            /**
            * Sets or gets the QuantitativeScale's output interpolator
            *
            * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
            * @returns {D3.Transition.Interpolate|QuantitativeScale} The current output interpolator, or the calling QuantitativeScale.
            */
            public interpolate(): D3.Transition.Interpolate;
            public interpolate(factory: D3.Transition.Interpolate): QuantitativeScale;
            /**
            * Sets the range of the QuantitativeScale and sets the interpolator to d3.interpolateRound.
            *
            * @param {number[]} values The new range value for the range.
            */
            public rangeRound(values: number[]): QuantitativeScale;
            /**
            * Gets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
            *
            * @returns {boolean} The current clamp status.
            */
            public clamp(): boolean;
            /**
            * Sets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
            *
            * @param {boolean} clamp Whether or not to clamp the QuantitativeScale.
            * @returns {QuantitativeScale} The calling QuantitativeScale.
            */
            public clamp(clamp: boolean): QuantitativeScale;
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
            * Given a domain, expands its domain onto "nice" values, e.g. whole
            * numbers.
            */
            public _niceDomain(domain: any[], count?: number): any[];
            /**
            * Retrieve a Domainer of a scale. A Domainer is responsible for combining
            * multiple extents into a single domain.
            *
            * @return {QuantitativeScale} The scale's current domainer.
            */
            public domainer(): Domainer;
            /**
            * Sets a Domainer of a scale. A Domainer is responsible for combining
            * multiple extents into a single domain.
            *
            * When you set domainer, we assume that you know what you want the domain
            * to look like better that we do. Ensuring that the domain is padded,
            * includes 0, etc., will be the responsability of the new domainer.
            *
            * @param {Domainer} domainer The domainer to be set.
            * @return {QuantitativeScale} The calling scale.
            */
            public domainer(domainer: Domainer): QuantitativeScale;
            public _defaultExtent(): any[];
>>>>>>> Release version 0.27.0
=======
            _getExtent(): any[];
            invert(value: number): number;
            copy(): QuantitativeScale;
            domain(): any[];
            domain(values: any[]): QuantitativeScale;
            _setDomain(values: any[]): void;
            interpolate(): D3.Transition.Interpolate;
            interpolate(factory: D3.Transition.Interpolate): QuantitativeScale;
            rangeRound(values: number[]): QuantitativeScale;
            clamp(): boolean;
            clamp(clamp: boolean): QuantitativeScale;
            ticks(count?: number): any[];
            tickFormat(count: number, format?: string): (n: number) => string;
            _niceDomain(domain: any[], count?: number): any[];
            domainer(): Domainer;
            domainer(domainer: Domainer): QuantitativeScale;
            _defaultExtent(): any[];
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Scale {
<<<<<<< HEAD
<<<<<<< HEAD
        class Linear extends Plottable.Abstract.QuantitativeScale<number> {
=======
        class Linear extends Abstract.QuantitativeScale {
            /**
            * Creates a new LinearScale.
            *
            * @constructor
            * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
            */
>>>>>>> Release version 0.27.0
=======
        class Linear extends Plottable.Abstract.QuantitativeScale {
>>>>>>> Remove comments from built files.
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            copy(): Linear;
        }
    }
}


declare module Plottable {
    module Scale {
<<<<<<< HEAD
<<<<<<< HEAD
        class Log extends Plottable.Abstract.QuantitativeScale<number> {
=======
        class Log extends Abstract.QuantitativeScale {
            /**
            * Creates a new Scale.Log.
            *
            * Warning: Log is deprecated; if possible, use ModifiedLog. Log scales are
            * very unstable due to the fact that they can't handle 0 or negative
            * numbers. The only time when you would want to use a Log scale over a
            * ModifiedLog scale is if you're plotting very small data, such as all
            * data < 1.
            *
            * @constructor
            * @param {D3.Scale.LogScale} [scale] The D3 Scale.Log backing the Scale.Log. If not supplied, uses a default scale.
            */
>>>>>>> Release version 0.27.0
=======
        class Log extends Plottable.Abstract.QuantitativeScale {
>>>>>>> Remove comments from built files.
            constructor();
            constructor(scale: D3.Scale.LogScale);
            copy(): Log;
            _defaultExtent(): number[];
        }
    }
}


declare module Plottable {
    module Scale {
<<<<<<< HEAD
<<<<<<< HEAD
        class ModifiedLog extends Plottable.Abstract.QuantitativeScale<number> {
=======
        class ModifiedLog extends Abstract.QuantitativeScale {
            /**
            * Creates a new Scale.ModifiedLog.
            *
            * A ModifiedLog scale acts as a regular log scale for large numbers.
            * As it approaches 0, it gradually becomes linear. This means that the
            * scale won't freak out if you give it 0 or a negative number, where an
            * ordinary Log scale would.
            *
            * However, it does mean that scale will be effectively linear as values
            * approach 0. If you want very small values on a log scale, you should use
            * an ordinary Scale.Log instead.
            *
            * @constructor
            * @param {number} [base]
            *        The base of the log. Defaults to 10, and must be > 1.
            *
            *        For base <= x, scale(x) = log(x).
            *
            *        For 0 < x < base, scale(x) will become more and more
            *        linear as it approaches 0.
            *
            *        At x == 0, scale(x) == 0.
            *
            *        For negative values, scale(-x) = -scale(x).
            */
>>>>>>> Release version 0.27.0
=======
        class ModifiedLog extends Plottable.Abstract.QuantitativeScale {
>>>>>>> Remove comments from built files.
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
<<<<<<< HEAD
<<<<<<< HEAD
        class Ordinal extends Plottable.Abstract.Scale<string, number> {
            _d3Scale: D3.Scale.OrdinalScale;
=======
        class Ordinal extends Abstract.Scale {
            public _d3Scale: D3.Scale.OrdinalScale;
            /**
            * Creates a new OrdinalScale. Domain and Range are set later.
            *
            * @constructor
            */
>>>>>>> Release version 0.27.0
=======
        class Ordinal extends Plottable.Abstract.Scale {
            _d3Scale: D3.Scale.OrdinalScale;
>>>>>>> Remove comments from built files.
            constructor(scale?: D3.Scale.OrdinalScale);
            _getExtent(): any[];
            domain(): any[];
            domain(values: any[]): Ordinal;
            _setDomain(values: any[]): void;
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
<<<<<<< HEAD
<<<<<<< HEAD
        class Color extends Plottable.Abstract.Scale<string, string> {
            constructor(scaleType?: string);
            _getExtent(): string[];
=======
        class Color extends Abstract.Scale {
            /**
            * Creates a ColorScale.
            *
            * @constructor
            * @param {string} [scaleType] the type of color scale to create
            *     (Category10/Category20/Category20b/Category20c).
            * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
            */
            constructor(scaleType?: string);
            public _getExtent(): any[];
>>>>>>> Release version 0.27.0
=======
        class Color extends Plottable.Abstract.Scale {
            constructor(scaleType?: string);
            _getExtent(): any[];
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Scale {
<<<<<<< HEAD
<<<<<<< HEAD
        class Time extends Plottable.Abstract.QuantitativeScale<any> {
=======
        class Time extends Abstract.QuantitativeScale {
            /**
            * Creates a new Time Scale.
            *
            * @constructor
            * @param {D3.Scale.Time} [scale] The D3 LinearScale backing the TimeScale. If not supplied, uses a default scale.
            */
>>>>>>> Release version 0.27.0
=======
        class Time extends Plottable.Abstract.QuantitativeScale {
>>>>>>> Remove comments from built files.
            constructor();
            constructor(scale: D3.Scale.LinearScale);
            tickInterval(interval: D3.Time.Interval, step?: number): any[];
            domain(): any[];
            domain(values: any[]): Time;
            copy(): Time;
            _defaultExtent(): any[];
        }
    }
}


declare module Plottable {
    module Scale {
<<<<<<< HEAD
<<<<<<< HEAD
        class InterpolatedColor extends Plottable.Abstract.Scale<number, string> {
=======
        /**
        * This class implements a color scale that takes quantitive input and
        * interpolates between a list of color values. It returns a hex string
        * representing the interpolated color.
        *
        * By default it generates a linear scale internally.
        */
        class InterpolatedColor extends Abstract.QuantitativeScale {
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
>>>>>>> Release version 0.27.0
=======
        class InterpolatedColor extends Plottable.Abstract.QuantitativeScale {
>>>>>>> Remove comments from built files.
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
<<<<<<< HEAD
        class ScaleDomainCoordinator<D> {
            constructor(scales: Plottable.Abstract.Scale<D, any>[]);
            rescale(scale: Plottable.Abstract.Scale<D, any>): void;
=======
        class ScaleDomainCoordinator {
<<<<<<< HEAD
            /**
            * Creates a ScaleDomainCoordinator.
            *
            * @constructor
            * @param {Scale[]} scales A list of scales whose domains should be linked.
            */
            constructor(scales: Abstract.Scale[]);
            public rescale(scale: Abstract.Scale): void;
>>>>>>> Release version 0.27.0
=======
            constructor(scales: Plottable.Abstract.Scale[]);
            rescale(scale: Plottable.Abstract.Scale): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class _Drawer {
            renderArea: D3.Selection;
            key: string;
            constructor(key: string);
<<<<<<< HEAD
<<<<<<< HEAD
            remove(): void;
            draw(data: any[], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
=======
            /**
            * Removes the Drawer and its renderArea
            */
            public remove(): void;
            /**
            * Draws the data into the renderArea using the attrHash for attributes
            *
            * @param{any[][]} data The data to be drawn
            * @param{attrHash} IAttributeToProjector The list of attributes to set on the data
            */
            public draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Animator.Null): void;
>>>>>>> Release version 0.27.0
=======
            remove(): void;
            draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module _Drawer {
<<<<<<< HEAD
<<<<<<< HEAD
        class Area extends Plottable.Abstract._Drawer {
            draw(data: any[], attrToProjector: IAttributeToProjector): void;
=======
        class Area extends Abstract._Drawer {
            public draw(data: any[][], attrToProjector: IAttributeToProjector): void;
>>>>>>> Release version 0.27.0
=======
        class Area extends Plottable.Abstract._Drawer {
            draw(data: any[][], attrToProjector: IAttributeToProjector): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module _Drawer {
<<<<<<< HEAD
<<<<<<< HEAD
        class Rect extends Plottable.Abstract._Drawer {
            draw(data: any[], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
=======
        class Rect extends Abstract._Drawer {
            public draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Animator.Null): void;
>>>>>>> Release version 0.27.0
=======
        class Rect extends Plottable.Abstract._Drawer {
            draw(data: any[][], attrToProjector: IAttributeToProjector, animator?: Plottable.Animator.Null): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class Axis extends Component {
            static END_TICK_MARK_CLASS: string;
            static TICK_MARK_CLASS: string;
            static TICK_LABEL_CLASS: string;
<<<<<<< HEAD
<<<<<<< HEAD
            _tickMarkContainer: D3.Selection;
            _tickLabelContainer: D3.Selection;
            _baseline: D3.Selection;
            _scale: Scale<any, number>;
=======
            _tickMarkContainer: D3.Selection;
            _tickLabelContainer: D3.Selection;
            _baseline: D3.Selection;
            _scale: Scale;
>>>>>>> Remove comments from built files.
            _formatter: Formatter;
            _orientation: string;
            _userRequestedWidth: any;
            _userRequestedHeight: any;
            _computedWidth: number;
            _computedHeight: number;
<<<<<<< HEAD
            constructor(scale: Scale<any, number>, orientation: string, formatter?: (d: any) => string);
            remove(): void;
            _isHorizontal(): boolean;
            _computeWidth(): number;
            _computeHeight(): number;
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            _isFixedHeight(): boolean;
            _isFixedWidth(): boolean;
            _rescale(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _setup(): void;
            _getTickValues(): any[];
            _doRender(): void;
            _generateBaselineAttrHash(): {
=======
            public _tickMarkContainer: D3.Selection;
            public _tickLabelContainer: D3.Selection;
            public _baseline: D3.Selection;
            public _scale: Scale;
            public _formatter: Formatter;
            public _orientation: string;
            public _userRequestedWidth: any;
            public _userRequestedHeight: any;
            public _computedWidth: number;
            public _computedHeight: number;
            constructor(scale: Scale, orientation: string, formatter?: (d: any) => string);
            public remove(): void;
            public _isHorizontal(): boolean;
            public _computeWidth(): number;
            public _computeHeight(): number;
            public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            public _isFixedHeight(): boolean;
            public _isFixedWidth(): boolean;
            public _rescale(): void;
            public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            public _setup(): void;
            public _getTickValues(): any[];
            public _doRender(): void;
            public _generateBaselineAttrHash(): {
>>>>>>> Release version 0.27.0
=======
            constructor(scale: Scale, orientation: string, formatter?: (d: any) => string);
            remove(): void;
            _isHorizontal(): boolean;
            _computeWidth(): number;
            _computeHeight(): number;
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            _isFixedHeight(): boolean;
            _isFixedWidth(): boolean;
            _rescale(): void;
            _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number): void;
            _setup(): void;
            _getTickValues(): any[];
            _doRender(): void;
            _generateBaselineAttrHash(): {
>>>>>>> Remove comments from built files.
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
        interface ITimeInterval {
            timeUnit: D3.Time.Interval;
            step: number;
            formatString: string;
        }
        class Time extends Plottable.Abstract.Axis {
            _majorTickLabels: D3.Selection;
            _minorTickLabels: D3.Selection;
            _scale: Plottable.Scale.Time;
            static minorIntervals: ITimeInterval[];
            static majorIntervals: ITimeInterval[];
            constructor(scale: Plottable.Scale.Time, orientation: string);
            _computeHeight(): number;
            _setup(): void;
            _getTickIntervalValues(interval: ITimeInterval): any[];
            _getTickValues(): any[];
            _measureTextHeight(container: D3.Selection): number;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Axis {
<<<<<<< HEAD
<<<<<<< HEAD
        class Numeric extends Plottable.Abstract.Axis {
            _scale: Plottable.Abstract.QuantitativeScale<number>;
            constructor(scale: Plottable.Abstract.QuantitativeScale<number>, orientation: string, formatter?: (d: any) => string);
=======
        class Numeric extends Plottable.Abstract.Axis {
            _scale: Plottable.Abstract.QuantitativeScale;
            constructor(scale: Plottable.Abstract.QuantitativeScale, orientation: string, formatter?: (d: any) => string);
>>>>>>> Remove comments from built files.
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
<<<<<<< HEAD
=======
        class Numeric extends Abstract.Axis {
            public _scale: Abstract.QuantitativeScale;
            /**
            * Creates a NumericAxis.
            *
            * @constructor
            * @param {QuantitativeScale} scale The QuantitativeScale to base the NumericAxis on.
            * @param {string} orientation The orientation of the QuantitativeScale (top/bottom/left/right)
            * @param {Formatter} [formatter] A function to format tick labels (default Formatters.general(3, false)).
            */
            constructor(scale: Abstract.QuantitativeScale, orientation: string, formatter?: (d: any) => string);
            public _setup(): void;
            public _computeWidth(): number;
            public _computeHeight(): number;
            public _getTickValues(): any[];
            public _rescale(): void;
            public _doRender(): void;
            /**
            * Gets the tick label position relative to the tick marks.
            *
            * @returns {string} The current tick label position.
            */
            public tickLabelPosition(): string;
            /**
            * Sets the tick label position relative to the tick marks.
            *
            * @param {string} position The relative position of the tick label.
            *                          [top/center/bottom] for a vertical NumericAxis,
            *                          [left/center/right] for a horizontal NumericAxis.
            * @returns {NumericAxis} The calling NumericAxis.
            */
            public tickLabelPosition(position: string): Numeric;
            /**
            * Return whether or not the tick labels at the end of the graph are
            * displayed when partially cut off.
            *
            * @param {string} orientation Where on the scale to change tick labels.
            *                 On a "top" or "bottom" axis, this can be "left" or
            *                 "right". On a "left" or "right" axis, this can be "top"
            *                 or "bottom".
            * @returns {boolean} The current setting.
            */
            public showEndTickLabel(orientation: string): boolean;
            /**
            * Control whether or not the tick labels at the end of the graph are
            * displayed when partially cut off.
            *
            * @param {string} orientation Where on the scale to change tick labels.
            *                 On a "top" or "bottom" axis, this can be "left" or
            *                 "right". On a "left" or "right" axis, this can be "top"
            *                 or "bottom".
            * @param {boolean} show Whether or not the given tick should be displayed.
            * @returns {Numeric} The calling Numeric.
            */
            public showEndTickLabel(orientation: string, show: boolean): Numeric;
>>>>>>> Release version 0.27.0
=======
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Axis {
        class Category extends Plottable.Abstract.Axis {
            _scale: Plottable.Scale.Ordinal;
            constructor(scale: Plottable.Scale.Ordinal, orientation?: string, formatter?: (d: any) => string);
            _setup(): void;
            _rescale(): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            _getTickValues(): string[];
            _doRender(): void;
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
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
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
            toggleCallback(callback: ToggleCallback): Legend;
            toggleCallback(): ToggleCallback;
            hoverCallback(callback: HoverCallback): Legend;
            hoverCallback(): HoverCallback;
            scale(scale: Plottable.Scale.Color): Legend;
            scale(): Plottable.Scale.Color;
            _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number): void;
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
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
            _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
            _doRender(): void;
        }
    }
}


declare module Plottable {
    module Component {
<<<<<<< HEAD
<<<<<<< HEAD
        class Gridlines extends Plottable.Abstract.Component {
            constructor(xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            remove(): Gridlines;
            _setup(): void;
            _doRender(): void;
=======
        class Gridlines extends Abstract.Component {
            /**
            * Creates a set of Gridlines.
            * @constructor
            *
            * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
            * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
            */
            constructor(xScale: Abstract.QuantitativeScale, yScale: Abstract.QuantitativeScale);
            public remove(): Gridlines;
            public _setup(): void;
            public _doRender(): void;
>>>>>>> Release version 0.27.0
=======
        class Gridlines extends Plottable.Abstract.Component {
            constructor(xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.QuantitativeScale);
            remove(): Gridlines;
            _setup(): void;
            _doRender(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
<<<<<<< HEAD
<<<<<<< HEAD
        class Scatter extends Plottable.Abstract.XYPlot {
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.Scale<any, number>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Scatter;
            _paint(): void;
=======
        class Scatter extends Abstract.XYPlot {
            public _animators: Animator.IPlotAnimatorMap;
            /**
            * Creates a ScatterPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Scatter;
            public _paint(): void;
>>>>>>> Release version 0.27.0
=======
        class Scatter extends Plottable.Abstract.XYPlot {
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Scatter;
            _paint(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
<<<<<<< HEAD
<<<<<<< HEAD
        class Grid extends Plottable.Abstract.XYPlot {
            colorScale: Plottable.Abstract.Scale<any, string>;
            xScale: Plottable.Scale.Ordinal;
            yScale: Plottable.Scale.Ordinal;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Scale.Ordinal, yScale: Plottable.Scale.Ordinal, colorScale: Plottable.Abstract.Scale<any, string>);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Grid;
            _paint(): void;
=======
        class Grid extends Abstract.XYPlot {
            public colorScale: Abstract.Scale;
            public xScale: Scale.Ordinal;
            public yScale: Scale.Ordinal;
            public _animators: Animator.IPlotAnimatorMap;
            /**
            * Creates a GridPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {OrdinalScale} xScale The x scale to use.
            * @param {OrdinalScale} yScale The y scale to use.
            * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
            *     cell.
            */
            constructor(dataset: any, xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Abstract.Scale);
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Grid;
            public _paint(): void;
>>>>>>> Release version 0.27.0
=======
        class Grid extends Plottable.Abstract.XYPlot {
            colorScale: Plottable.Abstract.Scale;
            xScale: Plottable.Scale.Ordinal;
            yScale: Plottable.Scale.Ordinal;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Scale.Ordinal, yScale: Plottable.Scale.Ordinal, colorScale: Plottable.Abstract.Scale);
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Grid;
            _paint(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class BarPlot extends XYPlot {
            _bars: D3.UpdateSelection;
            _baseline: D3.Selection;
            _baselineValue: number;
            _barAlignmentFactor: number;
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
<<<<<<< HEAD
<<<<<<< HEAD
            _isVertical: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Scale<any, number>, yScale: Scale<any, number>);
            _setup(): void;
            _paint(): void;
            baseline(value: number): BarPlot;
            barAlignment(alignment: string): BarPlot;
            selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            deselectAll(): BarPlot;
            _updateDomainer(scale: Scale<any, number>): void;
            _updateYDomainer(): void;
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
=======
            public _isVertical: boolean;
            public _animators: Animator.IPlotAnimatorMap;
            /**
            * Creates an AbstractBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            public _setup(): void;
            public _paint(): void;
            /**
            * Sets the baseline for the bars to the specified value.
            *
            * @param {number} value The value to position the baseline at.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public baseline(value: number): BarPlot;
            /**
            * Sets the bar alignment relative to the independent axis.
            * VerticalBarPlot supports "left", "center", "right"
            * HorizontalBarPlot supports "top", "center", "bottom"
            *
            * @param {string} alignment The desired alignment.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public barAlignment(alignment: string): BarPlot;
            /**
            * Selects the bar under the given pixel position (if [xValOrExtent]
            * and [yValOrExtent] are {number}s), under a given line (if only one
            * of [xValOrExtent] or [yValOrExtent] are {IExtent}s) or are under a
            * 2D area (if [xValOrExtent] and [yValOrExtent] are both {IExtent}s).
            *
            * @param {any} xValOrExtent The pixel x position, or range of x values.
            * @param {any} yValOrExtent The pixel y position, or range of y values.
            * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
            * @return {D3.Selection} The selected bar, or null if no bar was selected.
            */
            public selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            public selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            /**
            * Deselects all bars.
            * @return {AbstractBarPlot} The calling AbstractBarPlot.
            */
            public deselectAll(): BarPlot;
            public _updateDomainer(scale: Scale): void;
            public _updateYDomainer(): void;
            public _updateXDomainer(): void;
            public _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Release version 0.27.0
=======
            _isVertical: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Scale, yScale: Scale);
            _setup(): void;
            _paint(): void;
            baseline(value: number): BarPlot;
            barAlignment(alignment: string): BarPlot;
            selectBar(xValOrExtent: IExtent, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: IExtent, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: IExtent, yValOrExtent: number, select?: boolean): D3.Selection;
            selectBar(xValOrExtent: number, yValOrExtent: number, select?: boolean): D3.Selection;
            deselectAll(): BarPlot;
            _updateDomainer(scale: Scale): void;
            _updateYDomainer(): void;
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
        class VerticalBar extends Plottable.Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
<<<<<<< HEAD
<<<<<<< HEAD
            _isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.QuantitativeScale<number>);
            _updateYDomainer(): void;
=======
            public _isVertical: boolean;
            /**
            * Creates a VerticalBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {QuantitativeScale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitativeScale);
            public _updateYDomainer(): void;
>>>>>>> Release version 0.27.0
=======
            _isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.QuantitativeScale);
            _updateYDomainer(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
        class HorizontalBar extends Plottable.Abstract.BarPlot {
            static _BarAlignmentToFactor: {
                [x: string]: number;
            };
<<<<<<< HEAD
<<<<<<< HEAD
            isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<number>, yScale: Plottable.Abstract.Scale<any, number>);
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
=======
            public isVertical: boolean;
            /**
            * Creates a HorizontalBarPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {QuantitativeScale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.QuantitativeScale, yScale: Abstract.Scale);
            public _updateXDomainer(): void;
            public _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Release version 0.27.0
=======
            isVertical: boolean;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.Scale);
            _updateXDomainer(): void;
            _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
<<<<<<< HEAD
<<<<<<< HEAD
        class Line extends Plottable.Abstract.XYPlot {
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            _setup(): void;
            _appendPath(): void;
            _getResetYFunction(): (d: any, i: number) => number;
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
            _wholeDatumAttributes(): string[];
=======
        class Line extends Abstract.XYPlot {
            public _animators: Animator.IPlotAnimatorMap;
            /**
            * Creates a LinePlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
            public _setup(): void;
            public _appendPath(): void;
            public _getResetYFunction(): (d: any, i: number) => any;
            public _generateAttrToProjector(): IAttributeToProjector;
            public _paint(): void;
            public _wholeDatumAttributes(): string[];
>>>>>>> Release version 0.27.0
=======
        class Line extends Plottable.Abstract.XYPlot {
            _animators: Plottable.Animator.IPlotAnimatorMap;
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
            _setup(): void;
            _appendPath(): void;
            _getResetYFunction(): (d: any, i: number) => any;
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
            _wholeDatumAttributes(): string[];
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
        class Area extends Line {
<<<<<<< HEAD
<<<<<<< HEAD
            constructor(dataset: any, xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
            _appendPath(): void;
            _onDatasetUpdate(): void;
            _updateYDomainer(): void;
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): Area;
            _getResetYFunction(): IAppliedAccessor;
            _paint(): void;
            _wholeDatumAttributes(): string[];
=======
            /**
            * Creates an AreaPlot.
            *
            * @constructor
            * @param {IDataset} dataset The dataset to render.
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale);
            public _appendPath(): void;
            public _onDataSourceUpdate(): void;
            public _updateYDomainer(): void;
            public project(attrToSet: string, accessor: any, scale?: Abstract.Scale): Area;
            public _getResetYFunction(): IAppliedAccessor;
            public _paint(): void;
            public _wholeDatumAttributes(): string[];
>>>>>>> Release version 0.27.0
=======
            constructor(dataset: any, xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale);
            _appendPath(): void;
            _onDataSourceUpdate(): void;
            _updateYDomainer(): void;
            project(attrToSet: string, accessor: any, scale?: Plottable.Abstract.Scale): Area;
            _getResetYFunction(): IAppliedAccessor;
            _paint(): void;
            _wholeDatumAttributes(): string[];
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class NewStyleBarPlot extends NewStylePlot {
            static _barAlignmentToFactor: {
                [x: string]: number;
            };
            static DEFAULT_WIDTH: number;
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Remove comments from built files.
            _baseline: D3.Selection;
            _baselineValue: number;
            _barAlignmentFactor: number;
            _isVertical: boolean;
            _animators: Plottable.Animator.IPlotAnimatorMap;
<<<<<<< HEAD
            constructor(xScale: Scale<any, number>, yScale: Scale<any, number>);
            _getDrawer(key: string): Plottable._Drawer.Rect;
            _setup(): void;
            _paint(): void;
            baseline(value: number): any;
            _updateDomainer(scale: Scale<any, number>): any;
            _generateAttrToProjector(): IAttributeToProjector;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
=======
            public _baseline: D3.Selection;
            public _baselineValue: number;
            public _barAlignmentFactor: number;
            public _isVertical: boolean;
            public _animators: Animator.IPlotAnimatorMap;
            /**
            * Creates an NewStyleBarPlot.
            *
            * @constructor
            * @param {Scale} xScale The x scale to use.
            * @param {Scale} yScale The y scale to use.
            */
            constructor(xScale: Scale, yScale: Scale);
            public _getDrawer(key: string): _Drawer.Rect;
            public _setup(): void;
            public _paint(): void;
            /**
            * Sets the baseline for the bars to the specified value.
            *
            * @param {number} value The value to position the baseline at.
            * @return {NewStyleBarPlot} The calling NewStyleBarPlot.
            */
            public baseline(value: number): any;
            public _updateDomainer(scale: Scale): any;
            public _generateAttrToProjector(): IAttributeToProjector;
            public _updateXDomainer(): any;
            public _updateYDomainer(): any;
>>>>>>> Release version 0.27.0
=======
            constructor(xScale: Scale, yScale: Scale);
            _getDrawer(key: string): Plottable._Drawer.Rect;
            _setup(): void;
            _paint(): void;
            baseline(value: number): any;
            _updateDomainer(scale: Scale): any;
            _generateAttrToProjector(): IAttributeToProjector;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
        class ClusteredBar extends Plottable.Abstract.NewStyleBarPlot {
            static DEFAULT_WIDTH: number;
<<<<<<< HEAD
<<<<<<< HEAD
            constructor(xScale: Plottable.Abstract.Scale<any, number>, yScale: Plottable.Abstract.Scale<any, number>, isVertical?: boolean);
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
=======
            constructor(xScale: Abstract.Scale, yScale: Abstract.Scale, isVertical?: boolean);
            public _generateAttrToProjector(): IAttributeToProjector;
            public _paint(): void;
>>>>>>> Release version 0.27.0
=======
            constructor(xScale: Plottable.Abstract.Scale, yScale: Plottable.Abstract.Scale, isVertical?: boolean);
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Abstract {
        class Stacked extends NewStylePlot {
<<<<<<< HEAD
<<<<<<< HEAD
            _isVertical: boolean;
            _onDatasetUpdate(): void;
            project(attrToSet: string, accessor: any, scale?: Scale<any, any>): Stacked;
            _updateAllProjectors(): void;
=======
            public _onDataSourceUpdate(): void;
            public _updateAllProjectors(): void;
>>>>>>> Release version 0.27.0
=======
            _onDataSourceUpdate(): void;
            _updateAllProjectors(): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
<<<<<<< HEAD
<<<<<<< HEAD
        class StackedArea extends Plottable.Abstract.Stacked {
            _baseline: D3.Selection;
            _baselineValue: number;
            constructor(xScale: Plottable.Abstract.QuantitativeScale<any>, yScale: Plottable.Abstract.QuantitativeScale<any>);
=======
        class StackedArea extends Plottable.Abstract.Stacked {
            _baseline: D3.Selection;
            _baselineValue: number;
            constructor(xScale: Plottable.Abstract.QuantitativeScale, yScale: Plottable.Abstract.QuantitativeScale);
>>>>>>> Remove comments from built files.
            _getDrawer(key: string): Plottable._Drawer.Area;
            _setup(): void;
            _paint(): void;
            _updateYDomainer(): void;
<<<<<<< HEAD
            _onDatasetUpdate(): void;
            _generateAttrToProjector(): IAttributeToProjector;
=======
        class StackedArea extends Abstract.Stacked {
            public _baseline: D3.Selection;
            public _baselineValue: number;
            /**
            * Constructs a StackedArea plot.
            *
            * @constructor
            * @param {QuantitativeScale} xScale The x scale to use.
            * @param {QuantitativeScale} yScale The y scale to use.
            */
            constructor(xScale: Abstract.QuantitativeScale, yScale: Abstract.QuantitativeScale);
            public _getDrawer(key: string): _Drawer.Area;
            public _setup(): void;
            public _paint(): void;
            public _updateYDomainer(): void;
            public _onDataSourceUpdate(): void;
            public _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Release version 0.27.0
=======
            _onDataSourceUpdate(): void;
            _generateAttrToProjector(): IAttributeToProjector;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Plot {
<<<<<<< HEAD
<<<<<<< HEAD
        class StackedBar extends Plottable.Abstract.Stacked {
            _baselineValue: number;
            _baseline: D3.Selection;
            constructor(xScale?: Plottable.Abstract.Scale<any, number>, yScale?: Plottable.Abstract.Scale<any, number>, isVertical?: boolean);
            _getDrawer(key: string): any;
            _generateAttrToProjector(): any;
            baseline(value: number): any;
            _updateDomainer(scale: Plottable.Abstract.Scale<any, number>): any;
            _updateXDomainer(): any;
            _updateYDomainer(): any;
=======
        class StackedBar extends Abstract.NewStyleBarPlot {
            public stackedData: any[][];
            public _yAccessor: IAccessor;
            public _baselineValue: number;
            public _baseline: D3.Selection;
            /**
            * Constructs a StackedBar plot.
            *
            * @constructor
            * @param {Scale} xScale the x scale of the plot
            * @param {Scale} yScale the y scale of the plot
            * @param {boolean} isVertical if the plot if vertical
            */
            constructor(xScale?: Abstract.Scale, yScale?: Abstract.Scale, isVertical?: boolean);
            public _addDataset(key: string, dataset: any): void;
            public _updateAllProjectors(): void;
            public _generateAttrToProjector(): IAttributeToProjector;
            public _paint(): void;
>>>>>>> Release version 0.27.0
=======
        class StackedBar extends Plottable.Abstract.NewStyleBarPlot {
            stackedData: any[][];
            _yAccessor: IAccessor;
            _baselineValue: number;
            _baseline: D3.Selection;
            constructor(xScale?: Plottable.Abstract.Scale, yScale?: Plottable.Abstract.Scale, isVertical?: boolean);
            _addDataset(key: string, dataset: any): void;
            _updateAllProjectors(): void;
            _generateAttrToProjector(): IAttributeToProjector;
            _paint(): void;
>>>>>>> Remove comments from built files.
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
            _durationMsec: number;
            _delayMsec: number;
            _easing: string;
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
            _delayMsec: number;
            animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection;
        }
    }
}


declare module Plottable {
    module Animator {
        class Rect extends Default {
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
        class Interaction {
            hitBox: D3.Selection;
            componentToListenTo: Component;
            constructor(componentToListenTo: Component);
            _anchor(hitBox: D3.Selection): void;
            registerWithComponent(): Interaction;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Click extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component);
            _anchor(hitBox: D3.Selection): void;
            _listenTo(): string;
            callback(cb: (x: number, y: number) => any): Click;
        }
        class DoubleClick extends Click {
            constructor(componentToListenTo: Plottable.Abstract.Component);
            _listenTo(): string;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Mousemove extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component);
            _anchor(hitBox: D3.Selection): void;
            mousemove(x: number, y: number): void;
        }
    }
}


declare module Plottable {
    module Interaction {
        class Key extends Plottable.Abstract.Interaction {
            constructor(componentToListenTo: Plottable.Abstract.Component, keyCode: number);
            _anchor(hitBox: D3.Selection): void;
            callback(cb: () => any): Key;
        }
    }
}


declare module Plottable {
    module Interaction {
<<<<<<< HEAD
<<<<<<< HEAD
        class PanZoom extends Plottable.Abstract.Interaction {
            xScale: Plottable.Abstract.QuantitativeScale<any>;
            yScale: Plottable.Abstract.QuantitativeScale<any>;
            constructor(componentToListenTo: Plottable.Abstract.Component, xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>);
            resetZoom(): void;
            _anchor(hitBox: D3.Selection): void;
=======
        class PanZoom extends Abstract.Interaction {
            public xScale: Abstract.QuantitativeScale;
            public yScale: Abstract.QuantitativeScale;
            /**
            * Creates a PanZoomInteraction.
            *
            * @constructor
            * @param {Component} componentToListenTo The component to listen for interactions on.
            * @param {QuantitativeScale} [xScale] The X scale to update on panning/zooming.
            * @param {QuantitativeScale} [yScale] The Y scale to update on panning/zooming.
            */
            constructor(componentToListenTo: Abstract.Component, xScale?: Abstract.QuantitativeScale, yScale?: Abstract.QuantitativeScale);
            public resetZoom(): void;
            public _anchor(hitBox: D3.Selection): void;
>>>>>>> Release version 0.27.0
=======
        class PanZoom extends Plottable.Abstract.Interaction {
            xScale: Plottable.Abstract.QuantitativeScale;
            yScale: Plottable.Abstract.QuantitativeScale;
            constructor(componentToListenTo: Plottable.Abstract.Component, xScale?: Plottable.Abstract.QuantitativeScale, yScale?: Plottable.Abstract.QuantitativeScale);
            resetZoom(): void;
            _anchor(hitBox: D3.Selection): void;
>>>>>>> Remove comments from built files.
        }
    }
}


declare module Plottable {
    module Interaction {
        class BarHover extends Plottable.Abstract.Interaction {
            componentToListenTo: Plottable.Abstract.BarPlot;
            constructor(barPlot: Plottable.Abstract.BarPlot);
            _anchor(hitBox: D3.Selection): void;
            hoverMode(): string;
            hoverMode(mode: string): BarHover;
            onHover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
            onUnhover(callback: (datum: any, bar: D3.Selection) => any): BarHover;
        }
    }
}


declare module Plottable {
    module Interaction {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Remove comments from built files.
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
            _dragstart(): void;
            _doDragstart(): void;
            _drag(): void;
            _doDrag(): void;
            _dragend(): void;
            _doDragend(): void;
            _anchor(hitBox: D3.Selection): Drag;
<<<<<<< HEAD
            setupZoomCallback(xScale?: Plottable.Abstract.QuantitativeScale<any>, yScale?: Plottable.Abstract.QuantitativeScale<any>): Drag;
=======
        class Drag extends Abstract.Interaction {
            public origin: number[];
            public location: number[];
            /**
            * Creates a Drag.
            *
            * @param {Component} componentToListenTo The component to listen for interactions on.
            */
            constructor(componentToListenTo: Abstract.Component);
            /**
            * Gets the callback that is called when dragging starts.
            *
            * @returns {(startLocation: Point) => void}
            */
            public dragstart(): (startLocation: Point) => void;
            /**
            * Sets the callback to be called when dragging starts.
            *
            * @param {(startLocation: Point) => any} cb The function to be called.
            * @returns {Drag}
            */
            public dragstart(cb: (startLocation: Point) => any): Drag;
            /**
            * Gets the callback that is called during dragging.
            *
            * @returns {(startLocation: Point, endLocation: Point) => void}
            */
            public drag(): (startLocation: Point, endLocation: Point) => void;
            /**
            * Adds a callback to be called during dragging.
            *
            * @param {(startLocation: Point, endLocation: Point) => any} cb The function to be called.
            * @returns {Drag}
            */
            public drag(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            /**
            * Gets the callback that is called when dragging ends.
            *
            * @returns {(startLocation: Point, endLocation: Point) => void}
            */
            public dragend(): (startLocation: Point, endLocation: Point) => void;
            /**
            * Adds a callback to be called when the dragging ends.
            *
            * @param {(startLocation: Point, endLocation: Point) => any} cb The function to be called. Takes in a SelectionArea in pixels.
            * @returns {Drag} The calling Drag.
            */
            public dragend(cb: (startLocation: Point, endLocation: Point) => any): Drag;
            public _dragstart(): void;
            public _doDragstart(): void;
            public _drag(): void;
            public _doDrag(): void;
            public _dragend(): void;
            public _doDragend(): void;
            public _anchor(hitBox: D3.Selection): Drag;
            public setupZoomCallback(xScale?: Abstract.QuantitativeScale, yScale?: Abstract.QuantitativeScale): Drag;
>>>>>>> Release version 0.27.0
=======
            setupZoomCallback(xScale?: Plottable.Abstract.QuantitativeScale, yScale?: Plottable.Abstract.QuantitativeScale): Drag;
>>>>>>> Remove comments from built files.
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
            _anchor(hitBox: D3.Selection): DragBox;
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
