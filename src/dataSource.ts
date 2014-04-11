///<reference path="reference.ts" />

module Plottable {
  export class DataSource implements IBroadcaster {
    public _broadcasterCallbacks: IBroadcasterCallback[] = [];
    private _data: any[];
    private _metadata: any;

    /**
     * Creates a new DataSource.
     *
     * @constructor
     * @param {any[]} data
     * @param {any} metadata An object containing additional information.
     */
    constructor(data: any[] = [], metadata: any = {}) {
      this._data = data;
      this._metadata = metadata;
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
        this._broadcasterCallbacks.forEach((b) => b(this));
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
        this._broadcasterCallbacks.forEach((b) => b(this));
        return this;
      }
    }

    /**
     * Registers a callback to be called when the scale's domain is changed.
     *
     * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
     * @returns {Scale} The Calling Scale.
     */
    public registerListener(callback: IBroadcasterCallback) {
      this._broadcasterCallbacks.push(callback);
      return this;
    }
  }
}
