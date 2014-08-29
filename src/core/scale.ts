///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Scale extends PlottableObject implements Core.IListenable {
    public _d3Scale: D3.Scale.Scale;
    private autoDomainAutomatically = true;
    public broadcaster = new Plottable.Core.Broadcaster(this);
    public _rendererAttrID2Extent: {[rendererAttrID: string]: any[]} = {};
    /**
     * Constructs a new Scale.
     *
     * A Scale is a wrapper around a D3.Scale.Scale. A Scale is really just a
     * function. Scales have a domain (input), a range (output), and a function
     * from domain to range.
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
     * Modifies the domain on the scale so that it includes the extent of all
     * perspectives it depends on. This will normally happen automatically, but
     * if you set domain explicitly with `plot.domain(x)`, you will need to
     * call this function if you want the domain to neccessarily include all
     * the data.
     *
     * Extent: The [min, max] pair for a Scale.Quantitative, all covered
     * strings for a Scale.Ordinal.
     *
     * Perspective: A combination of a DataSource and an Accessor that
     * represents a view in to the data.
     *
     * @returns {Scale} The calling Scale.
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
     * Computes the range value corresponding to a given domain value. In other
     * words, apply the function to value.
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
     * Sets the domain.
     *
     * @param {any[]} values If provided, the new value for the domain. On
     * a QuantitativeScale, this is a [min, max] pair, or a [max, min] pair to
     * make the function decreasing. On Scale.Ordinal, this is an array of all
     * input values.
     * @returs {Scale} The calling Scale.
     */
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._getDomain();
      } else {
        this.autoDomainAutomatically = false;
        this._setDomain(values);
        return this;
      }
    }

    public _getDomain() {
      return this._d3Scale.domain();
    }

    public _setDomain(values: any[]) {
      this._d3Scale.domain(values);
      this.broadcaster.broadcast();
    }

    /**
     * Gets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @returns {any[]} The current range.
     */
    public range(): any[];
    /**
     * Sets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @param {any[]} values If provided, the new values for the range.
     * @returns {Scale} The calling Scale.
     */
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
     * Constructs a copy of the Scale with the same domain and range but without
     * any registered listeners.
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
    public _updateExtent(plotProvidedKey: string, attr: string, extent: any[]) {
      this._rendererAttrID2Extent[plotProvidedKey + attr] = extent;
      this._autoDomainIfAutomaticMode();
      return this;
    }

    public _removeExtent(plotProvidedKey: string, attr: string) {
      delete this._rendererAttrID2Extent[plotProvidedKey + attr];
      this._autoDomainIfAutomaticMode();
      return this;
    }
  }
}
}
