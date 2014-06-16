///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Scale extends Broadcaster {
    public _d3Scale: D3.Scale.Scale;
    public _autoDomainAutomatically = true;
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
      this._setDomain(this._getExtent());
      return this;
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
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this._autoDomainAutomatically = false;
        this._setDomain(values);
        return this;
      }
    }

    public _setDomain(values: any[]) {
      this._d3Scale.domain(values);
      this._broadcast();
    }

    /**
     * Retrieves the current range, or sets the Scale's range to the specified values.
     *
     * @param {any[]} [values] The new value for the range.
     * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
     */
    public range(): any[];
    public range(values: any[]): Scale;
    public range(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.range();
      } else {
        this._d3Scale.range(values);
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
      if (extent[0] === Infinity || extent[0] === -Infinity ||
          extent[1] === Infinity || extent[1] === -Infinity) {
        throw new Error("data cannot contain Infinity or -Infinity");
      }
      this._rendererAttrID2Extent[rendererID + attr] = extent;
      if (this._autoDomainAutomatically) {
        this.autoDomain();
      }
      return this;
    }

    public removeExtent(rendererID: number, attr: string) {
      delete this._rendererAttrID2Extent[rendererID + attr];
      if (this._autoDomainAutomatically) {
        this.autoDomain();
      }
      return this;
    }
  }
}
}
