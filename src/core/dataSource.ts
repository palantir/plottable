///<reference path="../reference.ts" />

module Plottable {
  interface ICachedExtent {
    accessor: IAccessor;
    extent: any[];
  }

  export interface DataSet {
    data: any[];
    metadata?: any;
  }

  export class DataSource extends Abstract.PlottableObject implements Core.IListenable {
    private _data: any[];
    private _metadata: any;
    private accessor2cachedExtent: Util.StrictEqualityAssociativeArray;
    public broadcaster = new Core.Broadcaster(this);
    /**
     * Creates a new DataSource.
     *
     * @constructor
     * @param {any[]} data
     * @param {any} metadata An object containing additional information.
     */
    constructor();
    constructor(data: DataSet);
    constructor(data: any[], metadata?: any);
    constructor(data?: any, metadata?: any) {
      super();
      if (data && data.data) {
        this._data = data.data;
        this._metadata = data.metadata || {};
      } else {
        this._data = data || [];
        this._metadata = metadata || {};
      }
      this.accessor2cachedExtent = new Util.StrictEqualityAssociativeArray();
    }

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
    public data(data?: any[]): any {
      if (data == null) {
        return this._data;
      } else {
        this._data = data;
        this.accessor2cachedExtent = new Util.StrictEqualityAssociativeArray();
        this.broadcaster.broadcast();
        return this;
      }
    }

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
    public metadata(metadata?: any): any {
      if (metadata == null) {
        return this._metadata;
      } else {
        this._metadata = metadata;
        this.accessor2cachedExtent = new Util.StrictEqualityAssociativeArray();
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
      var appliedAccessor = Util.Methods.applyAccessor(accessor, this);
      var mappedData = this._data.map(appliedAccessor);
      if (mappedData.length === 0){
        return [];
      } else if (typeof(mappedData[0]) === "string") {
        return Util.Methods.uniq(mappedData);
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
