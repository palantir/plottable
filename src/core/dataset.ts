///<reference path="../reference.ts" />

module Plottable {

  export type DatasetCallback = (dataset: Dataset) => any;

  type CachedExtent = {
    accessor: _Accessor;
    extent: any[];
  }
  export class Dataset extends Core.PlottableObject {
    private _data: any[];
    private _metadata: any;
    private _accessor2cachedExtent: Utils.StrictEqualityAssociativeArray;
    private _callbacks: Utils.CallbackSet<DatasetCallback>;

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
      this._accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
      this._callbacks = new Utils.CallbackSet<DatasetCallback>();
    }

    public onUpdate(callback: DatasetCallback) {
      this._callbacks.add(callback);
    }

    public offUpdate(callback: DatasetCallback) {
      this._callbacks.delete(callback);
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
        this._accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
        this._callbacks.callCallbacks(this);
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
        this._accessor2cachedExtent = new Utils.StrictEqualityAssociativeArray();
        this._callbacks.callCallbacks(this);
        return this;
      }
    }
  }
}
