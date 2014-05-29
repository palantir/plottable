/// <reference path="../reference.d.ts" />
declare module Plottable {
    interface _IProjector {
        accessor: IAccessor;
        scale?: Scale;
    }
    class Renderer extends Component {
        public _dataSource: DataSource;
        public _dataChanged: boolean;
        public dataSelection: D3.UpdateSelection;
        public renderArea: D3.Selection;
        public element: D3.Selection;
        public scales: Scale[];
        public _colorAccessor: IAccessor;
        public _animate: boolean;
        public _ANIMATION_DURATION: number;
        public _hasRendered: boolean;
        private static DEFAULT_COLOR_ACCESSOR;
        public _projectors: {
            [attrToSet: string]: _IProjector;
        };
        public _rerenderUpdateSelection: boolean;
        public _requireRerender: boolean;
        /**
        * Creates a Renderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        */
        constructor();
        constructor(dataset: any[]);
        constructor(dataset: DataSource);
        public _anchor(element: D3.Selection): Renderer;
        /**
        * Retrieves the current DataSource, or sets a DataSource if the Renderer doesn't yet have one.
        *
        * @param {DataSource} [source] The DataSource the Renderer should use, if it doesn't yet have one.
        * @return {DataSource|Renderer} The current DataSource or the calling Renderer.
        */
        public dataSource(): DataSource;
        public dataSource(source: DataSource): Renderer;
        public project(attrToSet: string, accessor: any, scale?: Scale): Renderer;
        public _generateAttrToProjector(): {
            [attrToSet: string]: IAppliedAccessor;
        };
        public _doRender(): Renderer;
        public _paint(): void;
        public _setup(): Renderer;
        /**
        * Enables or disables animation.
        *
        * @param {boolean} enabled Whether or not to animate.
        */
        public animate(enabled: boolean): Renderer;
    }
}
