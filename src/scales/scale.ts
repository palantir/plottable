///<reference path="../reference.ts" />

module Plottable {

  export interface ScaleCallback<S extends Scale<any, any>> {
    (scale: S): any;
  }

  export module Scales {
    export interface ExtentProvider<D> {
      (scale: Scale<D, any>): D[][];
    }
  }

  export class Scale<D, R> {
    protected _d3Scale: D3.Scale.Scale;

    private _callbacks: Utils.CallbackSet<ScaleCallback<Scale<D, R>>>;
    private _autoDomainAutomatically = true;
    private _domainModificationInProgress = false;
    private _extentProviders: Utils.Set<Scales.ExtentProvider<D>>;

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
      this._d3Scale = scale;
      this._callbacks = new Utils.CallbackSet<ScaleCallback<Scale<D, R>>>();
      this._extentProviders = new Utils.Set<Scales.ExtentProvider<D>>();
    }

    protected _getAllExtents(): D[][] {
      return d3.merge(this._extentProviders.values().map((provider) => provider(this)));
    }

    protected _getExtent(): D[] {
      return []; // this should be overwritten
    }

    public onUpdate(callback: ScaleCallback<Scale<D, R>>) {
      this._callbacks.add(callback);
    }

    public offUpdate(callback: ScaleCallback<Scale<D, R>>) {
      this._callbacks.delete(callback);
    }

    protected _dispatchUpdate() {
      this._callbacks.callCallbacks(this);
    }

    /**
     * Modifies the domain on the scale so that it includes the extent of all
     * perspectives it depends on. This will normally happen automatically, but
     * if you set domain explicitly with `plot.domain(x)`, you will need to
     * call this function if you want the domain to neccessarily include all
     * the data.
     *
     * Extent: The [min, max] pair for a Scale.QuantitativeScale, all covered
     * strings for a Scale.Category.
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
     * a QuantitativeScaleScale, this is a [min, max] pair, or a [max, min] pair to
     * make the function decreasing. On Scale.Ordinal, this is an array of all
     * input values.
     * @returns {Scale} The calling Scale.
     */
    public domain(values: D[]): Scale<D, R>;
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
      if (!this._domainModificationInProgress) {
        this._domainModificationInProgress = true;
        this._d3Scale.domain(values);
        this._dispatchUpdate();
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
    public range(values: R[]): Scale<D, R>;
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
    public copy(): Scale<D, R> {
      return new Scale<D, R>(this._d3Scale.copy());
    }

    public addExtentProvider(provider: Scales.ExtentProvider<D>) {
      this._extentProviders.add(provider);
    }

    public removeExtentProvider(provider: Scales.ExtentProvider<D>) {
      this._extentProviders.delete(provider);
    }
  }
}
