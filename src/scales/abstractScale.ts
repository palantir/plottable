///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class AbstractScale<D,R> extends Core.PlottableObject implements Core.Listenable {
    protected _d3Scale: D3.Scale.Scale;
    private _autoDomainAutomatically = true;
    public broadcaster: Core.Broadcaster;
    private _rendererAttrID2Extent: {[rendererAttrID: string]: D[]} = {};
    public _typeCoercer: (d: any) => any = (d: any) => d;
    private _domainModificationInProgress: boolean = false;
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
      this.broadcaster = new Core.Broadcaster(this);
    }

    protected _getAllExtents(): D[][] {
      return d3.values(this._rendererAttrID2Extent);
    }

    protected _getExtent(): D[] {
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
     * Perspective: A combination of a Dataset and an Accessor that
     * represents a view in to the data.
     *
     * @returns {Scale} The calling Scale.
     */
    public autoDomain() {
      this._autoDomainAutomatically = true;
      this._setDomain(this._getExtent());
      return this;
    }

    public _autoDomainIfAutomaticMode() {
      if (this._autoDomainAutomatically) {
        this.autoDomain();
      }
    }

    /**
     * Computes the range value corresponding to a given domain value. In other
     * words, apply the function to value.
     *
     * @param {R} value A domain value to be scaled.
     * @returns {R} The range value corresponding to the supplied domain value.
     */
    public scale(value: D): R {
      return this._d3Scale(value);
    }

    /**
     * Gets the domain.
     *
     * @returns {D[]} The current domain.
     */
    public domain(): D[];
    /**
     * Sets the domain.
     *
     * @param {D[]} values If provided, the new value for the domain. On
     * a QuantitativeScale, this is a [min, max] pair, or a [max, min] pair to
     * make the function decreasing. On Scale.Ordinal, this is an array of all
     * input values.
     * @returns {Scale} The calling Scale.
     */
    public domain(values: D[]): AbstractScale<D,R>;
    public domain(values?: D[]): any {
      if (values == null) {
        return this._getDomain();
      } else {
        this._autoDomainAutomatically = false;
        this._setDomain(values);
        return this;
      }
    }

    protected _getDomain() {
      return this._d3Scale.domain();
    }

    protected _setDomain(values: D[]) {
      if(!this._domainModificationInProgress) {
        this._domainModificationInProgress = true;
        this._d3Scale.domain(values);
        this.broadcaster.broadcast();
        this._domainModificationInProgress = false;
      }
    }

    /**
     * Gets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @returns {R[]} The current range.
     */
    public range(): R[];
    /**
     * Sets the range.
     *
     * In the case of having a numeric range, it will be a [min, max] pair. In
     * the case of string range (e.g. Scale.InterpolatedColor), it will be a
     * list of all possible outputs.
     *
     * @param {R[]} values If provided, the new values for the range.
     * @returns {Scale} The calling Scale.
     */
    public range(values: R[]): AbstractScale<D,R>;
    public range(values?: R[]): any {
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
    public copy(): AbstractScale<D,R> {
      return new AbstractScale<D,R>(this._d3Scale.copy());
    }

    /**
     * When a renderer determines that the extent of a projector has changed,
     * it will call this function. This function should ensure that
     * the scale has a domain at least large enough to include extent.
     *
     * @param {number} rendererID A unique indentifier of the renderer sending
     *                 the new extent.
     * @param {string} attr The attribute being projected, e.g. "x", "y0", "r"
     * @param {D[]} extent The new extent to be included in the scale.
     */
    public _updateExtent(plotProvidedKey: string, attr: string, extent: D[]) {
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
