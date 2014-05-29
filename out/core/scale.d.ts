/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Scale extends Broadcaster {
        public _d3Scale: D3.Scale.Scale;
        public _autoDomain: boolean;
        private rendererID2Perspective;
        private dataSourceReferenceCounter;
        public _autoNice: boolean;
        public _autoPad: boolean;
        /**
        * Creates a new Scale.
        *
        * @constructor
        * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
        */
        constructor(scale: D3.Scale.Scale);
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
        public _addPerspective(rendererIDAttr: string, dataSource: DataSource, accessor: any): Scale;
        public _removePerspective(rendererIDAttr: string): Scale;
        /**
        * Returns the range value corresponding to a given domain value.
        *
        * @param value {any} A domain value to be scaled.
        * @returns {any} The range value corresponding to the supplied domain value.
        */
        public scale(value: any): any;
        /**
        * Retrieves the current domain, or sets the Scale's domain to the specified values.
        *
        * @param {any[]} [values] The new value for the domain. This array may
        *     contain more than 2 values if the scale type allows it (e.g.
        *     ordinal scales). Other scales such as quantitative scales accept
        *     only a 2-value extent array.
        * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
        */
        public domain(): any[];
        public domain(values: any[]): Scale;
        public _setDomain(values: any[]): void;
        /**
        * Retrieves the current range, or sets the Scale's range to the specified values.
        *
        * @param {any[]} [values] The new value for the range.
        * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
        */
        public range(): any[];
        public range(values: any[]): Scale;
        /**
        * Creates a copy of the Scale with the same domain and range but without any registered listeners.
        *
        * @returns {Scale} A copy of the calling Scale.
        */
        public copy(): Scale;
    }
}
