///<reference path="../reference.ts" />

module Plottable {
  interface ICachedExtent {
    accessor: _IAccessor;
    extent: any[];
  }
  export class Dataset extends Abstract.PlottableObject implements Core.IListenable {
    private _data: any[];
    private _metadata: any;
    private accessor2cachedExtent: _Util.StrictEqualityAssociativeArray;
    public broadcaster = new Core.Broadcaster(this);

    /**
     * Constructs a new set.
     *
     * A Dataset is mostly just a wrapper around an any[], Dataset is the
     * data you're going to plot.
     *
     * @constructor
     * @param {any[]} data The data for this DataSource (default = []).
     * @param {any} metadata An object containing additional information (default = {}).
     */
    constructor(data: any[] = [], metadata: any = {}) {
      super();
      this._data = data;
      this._metadata = metadata;
      this.accessor2cachedExtent = new _Util.StrictEqualityAssociativeArray();
    }

    /**
     * Gets the data.
     *
     * @returns {DataSource|any[]} The calling DataSource, or the current data.
     */
    public data(): any[];
    /**
     * Sets the data.
     *
     * @param {any[]} data The new data.
     * @returns {Dataset} The calling Dataset.
     */
    public data(data: any[]): Dataset;
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
     * @returns {Dataset} The calling Dataset.
     */
    public metadata(metadata: any): Dataset;
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

    public _getExtent(accessor: _IAccessor, typeCoercer: (d: any) => any): any[] {
      var cachedExtent = this.accessor2cachedExtent.get(accessor);
      if (cachedExtent === undefined) {
        cachedExtent = this.computeExtent(accessor, typeCoercer);
        this.accessor2cachedExtent.set(accessor, cachedExtent);
      }
      return cachedExtent;
    }

    private computeExtent(accessor: _IAccessor, typeCoercer: (d: any) => any): any[] {
      var mappedData = this._data.map(accessor);
      if (typeCoercer) {
        mappedData = mappedData.map(typeCoercer);
      }
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
