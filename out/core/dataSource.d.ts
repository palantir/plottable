/// <reference path="../reference.d.ts" />
declare module Plottable {
    class DataSource extends Broadcaster {
        private _data;
        private _metadata;
        private accessor2cachedExtent;
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        constructor(data?: any[], metadata?: any);
        /**
        * Retrieves the current data from the DataSource, or sets the data.
        *
        * @param {any[]} [data] The new data.
        * @returns {any[]|DataSource} The current data, or the calling DataSource.
        */
        public data(): any[];
        public data(data: any[]): DataSource;
        /**
        * Retrieves the current metadata from the DataSource, or sets the metadata.
        *
        * @param {any[]} [metadata] The new metadata.
        * @returns {any[]|DataSource} The current metadata, or the calling DataSource.
        */
        public metadata(): any;
        public metadata(metadata: any): DataSource;
        public _getExtent(accessor: IAccessor): any[];
        private computeExtent(accessor);
    }
}
