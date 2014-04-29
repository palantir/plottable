///<reference path="../reference.ts" />

module Plottable {
  interface ICachedExtent {
    accessor: IAccessor;
    extent: any[];
  }
  export class DataSource extends Broadcaster {
    private _data: any[];
    private _metadata: any;
    private accessor2cachedExtent: Utils.StrictEqualityAssociativeArray;
    /**
     * Creates a new DataSource.
     *
     * @constructor
     * @param {any[]} data
     * @param {any} metadata An object containing additional information.
     */
    constructor(data: any[] = [], metadata: any = {}) {
      super();
      this._data = data;
      this._metadata = metadata;
      this.accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
    }

    /**
     * Retrieves the current data from the DataSource, or sets the data.
     *
     * @param {any[]} [data] The new data.
     * @returns {any[]|DataSource} The current data, or the calling DataSource.
     */
    public data(): any[];
    public data(data: any[]): DataSource;
    public data(data?: any[]): any {
      if (data == null) {
        return this._data;
      } else {
        this._data = data;
        this.accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
        this._broadcast();
        return this;
      }
    }

    /**
     * Retrieves the current metadata from the DataSource, or sets the metadata.
     *
     * @param {any[]} [metadata] The new metadata.
     * @returns {any[]|DataSource} The current metadata, or the calling DataSource.
     */
    public metadata(): any;
    public metadata(metadata: any): DataSource;
    public metadata(metadata?: any): any {
      if (metadata == null) {
        return this._metadata;
      } else {
        this._metadata = metadata;
        this.accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
        this._broadcast();
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
      var appliedAccessor = Utils.applyAccessor(accessor, this);
      var mappedData = this._data.map(appliedAccessor);
      if (mappedData.length === 0){
        return undefined;
      } else if (typeof(mappedData[0]) === "string") {
        return Utils.uniq(mappedData);
      } else {
        return d3.extent(mappedData);
      }
    }
  }
}
