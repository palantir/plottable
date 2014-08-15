///<reference path="../reference.ts" />

module Plottable {
  interface ICachedExtent {
    accessor: IAccessor;
    extent: any[];
  }
  export class DataSource extends Abstract.PlottableObject implements Core.IListenable {
    private _data: any[];
    private _metadata: any;
    private accessor2cachedExtent: _Util.StrictEqualityAssociativeArray;
    public broadcaster = new Core.Broadcaster(this);

    /**
     * Creates a new DataSource.
     *
     * A DataSource is mostly just a wrapper around an any[], DataSource is the
     * data you're going to plot.
     *
     * @constructor
     * @param {any[]} data
     * @param {any} metadata An object containing additional information.
     */
    constructor(data: any[] = [], metadata: any = {}) {
      super();
      this._data = data;
      this._metadata = metadata;
      this.accessor2cachedExtent = new _Util.StrictEqualityAssociativeArray();
    }

    /**
     * Get the data.
     *
     * @returns {DataSource|any[]} The calling DataSource, or the current data.
     */
    public data(): any[];
    /**
     * Set the data.
     *
     * @param {any[]} data The new data.
     * @returns {DataSource} The calling DataSource.
     */
    public data(data: any[]): DataSource;
    public data(data?: any[]): any {
      if (data == null) {
        return this._data;
      } else {
        this._data = data;
        this.accessor2cachedExtent = new _Util.StrictEqualityAssociativeArray();
        this.broadcaster.broadcast();
        return this;
      }
    }

    /**
     * Get the metadata.
     *
     * @returns {any} the current
     * metadata.
     */
    public metadata(): any;
    /**
     * Set the metadata.
     *
     * @param {any} metadata The new metadata.
     * @returns {DataSource} The calling DataSource.
     */
    public metadata(metadata: any): DataSource;
    public metadata(metadata?: any): any {
      if (metadata == null) {
        return this._metadata;
      } else {
        this._metadata = metadata;
        this.accessor2cachedExtent = new _Util.StrictEqualityAssociativeArray();
        this.broadcaster.broadcast();
        return this;
      }
    }

    public _getExtent(accessor: IAccessor): any[] {
      var cachedExtent = this.accessor2cachedExtent.get(accessor);
      if (cachedExtent === undefined) {
        cachedExtent = this.computeExtent(accessor);
        this.accessor2cachedExtent.set(accessor, cachedExtent);
      }
      return cachedExtent;
    }

    private computeExtent(accessor: IAccessor): any[] {
      var mappedData = this._data.map(accessor);
      if (mappedData.length === 0){
        return [];
      } else if (typeof(mappedData[0]) === "string") {
        return _Util.Methods.uniq(mappedData);
      } else {
        var extent = d3.extent(mappedData);
        if (extent[0] == null || extent[1] == null) {
          return [];
        } else {
          return extent;
        }
      }
    }
  }
}
