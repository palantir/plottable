///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Scale extends PlottableObject implements Core.IListenable {
    public _d3Scale: D3.Scale.Scale;
    private autoDomainAutomatically = true;
    public broadcaster = new Plottable.Core.Broadcaster(this);
    public _rendererAttrID2Extent: {[rendererAttrID: string]: any[]} = {};
    /**
     * Creates a new Scale.
     *
     * @constructor
     * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
     */
    constructor(scale: D3.Scale.Scale) {
      super();
      this._d3Scale = scale;
    }

    public _getAllExtents(): any[][] {
      return d3.values(this._rendererAttrID2Extent);
    }

    public _getExtent(): any[] {
      return []; // this should be overwritten
    }

    /**
     * Modify the domain on the scale so that it includes the extent of all
     * perspectives it depends on. Extent: The (min, max) pair for a
     * QuantitiativeScale, all covered strings for an OrdinalScale.
     * Perspective: A combination of a DataSource and an Accessor that
     * represents a view in to the data.
     */
    public autoDomain() {
      this.autoDomainAutomatically = true;
      this._setDomain(this._getExtent());
      return this;
    }

    public _autoDomainIfAutomaticMode() {
      if (this.autoDomainAutomatically) {
        this.autoDomain();
      }
    }

    /**
     * Returns the range value corresponding to a given domain value.
     *
     * @param value {any} A domain value to be scaled.
     * @returns {any} The range value corresponding to the supplied domain value.
     */
    public scale(value: any) {
      return this._d3Scale(value);
    }

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
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this.autoDomainAutomatically = false;
        this._setDomain(values);
        return this;
      }
    }

    public _setDomain(values: any[]) {
      if (values[0] === Infinity || values[0] === -Infinity ||
          values[1] === Infinity || values[1] === -Infinity) {
        throw new Error("data cannot contain Infinity or -Infinity");
      }
      this._d3Scale.domain(values);
      this.broadcaster.broadcast();
    }

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
    public range(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.range();
      } else {
        this._d3Scale.range(values);
        this.broadcaster.broadcast();
        return this;
      }
    }

    /**
     * Creates a copy of the Scale with the same domain and range but without any registered listeners.
     *
     * @returns {Scale} A copy of the calling Scale.
     */
    public copy(): Scale {
      return new Scale(this._d3Scale.copy());
    }

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
    public updateExtent(rendererID: number, attr: string, extent: any[]) {
      this._rendererAttrID2Extent[rendererID + attr] = extent;
      this._autoDomainIfAutomaticMode();
      return this;
    }

    public removeExtent(rendererID: number, attr: string) {
      delete this._rendererAttrID2Extent[rendererID + attr];
      this._autoDomainIfAutomaticMode();
      return this;
    }
  }
}
}
