///<reference path="../reference.ts" />

module Plottable {
  export interface ScaleCallback<S extends Scale<any, any>> {
    (scale: S): any;
  }

  export module Scales {
    /**
     * A function that supplies Extents to a Scale.
     * An Extent is a request for a set of domain values to be included.
     *
     * @param {Scale} scale
     * @returns {D[][]} An array of extents.
     */
    export interface ExtentsProvider<D> {
      (scale: Scale<D, any>): D[];
    }
  }

  export class Scale<D, R> {
    private _callbacks: Utils.CallbackSet<ScaleCallback<Scale<D, R>>>;
    private _autoDomainAutomatically = true;
    private _domainModificationInProgress = false;
    private _includedValuesProviders: Utils.Set<Scales.ExtentsProvider<D>>;

    /**
     * A Scale is a function (in the mathematical sense) that maps values from a domain to a range.
     *
     * @constructor
     */
    constructor() {
      this._callbacks = new Utils.CallbackSet<ScaleCallback<Scale<D, R>>>();
      this._includedValuesProviders = new Utils.Set<Scales.ExtentsProvider<D>>();
    }

    /**
     * Given an array of potential domain values, computes the extent of those values.
     *
     * @param {D[]} values
     * @returns {D[]} The extent of the input values.
     */
    public extentOfValues(values: D[]): D[] {
      return []; // this should be overwritten
    }

    protected _getAllIncludedValues(): D[] {
      var providerArray: D[] = [];
      this._includedValuesProviders.forEach((provider: Scales.ExtentsProvider<D>) => {
        var extents = provider(this);
        providerArray = providerArray.concat(extents);
      });
      return providerArray
    }

    protected _getExtent(): D[] {
      return []; // this should be overwritten
    }

    /**
     * Adds a callback to be called when the Scale updates.
     *
     * @param {ScaleCallback} callback.
     * @returns {Scale} The calling Scale.
     */
    public onUpdate(callback: ScaleCallback<Scale<D, R>>) {
      this._callbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the Scale updates.
     *
     * @param {ScaleCallback} callback.
     * @returns {Scale} The calling Scale.
     */
    public offUpdate(callback: ScaleCallback<Scale<D, R>>) {
      this._callbacks.delete(callback);
      return this;
    }

    protected _dispatchUpdate() {
      this._callbacks.callCallbacks(this);
    }

    /**
     * Sets the Scale's domain so that it spans the Extents of all its ExtentsProviders.
     *
     * @returns {Scale} The calling Scale.
     */
    public autoDomain() {
      this._autoDomainAutomatically = true;
      this._setDomain(this._getExtent());
      return this;
    }

    protected _autoDomainIfAutomaticMode() {
      if (this._autoDomainAutomatically) {
        this.autoDomain();
      }
    }

    /**
     * Computes the range value corresponding to a given domain value.
     *
     * @param {D} value
     * @returns {R} The range value corresponding to the supplied domain value.
     */
    public scale(value: D): R {
      throw new Error("Subclasses should override scale");
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
     * @param {D[]} values
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
      throw new Error("Subclasses should override _getDomain");
    }

    protected _setDomain(values: D[]) {
      if (!this._domainModificationInProgress) {
        this._domainModificationInProgress = true;
        this._setBackingScaleDomain(values);
        this._dispatchUpdate();
        this._domainModificationInProgress = false;
      }
    }

    protected _setBackingScaleDomain(values: D[]) {
      throw new Error("Subclasses should override _setBackingDomain");
    }

    /**
     * Gets the range.
     *
     * @returns {R[]} The current range.
     */
    public range(): R[];
    /**
     * Sets the range.
     *
     * @param {R[]} values
     * @returns {Scale} The calling Scale.
     */
    public range(values: R[]): Scale<D, R>;
    public range(values?: R[]): any {
      if (values == null) {
        return this._getRange();
      } else {
        this._setRange(values);
        return this;
      }
    }

    protected _getRange() {
      throw new Error("Subclasses should override _getRange");
    }

    protected _setRange(values: R[]) {
      throw new Error("Subclasses should override _setRange");
    }

    /**
     * Adds an ExtentsProvider to the Scale.
     *
     * @param {Scales.ExtentsProvider} provider
     * @returns {Sclae} The calling Scale.
     */
    public addIncludedValuesProvider(provider: Scales.ExtentsProvider<D>) {
      this._includedValuesProviders.add(provider);
      this._autoDomainIfAutomaticMode();
      return this;
    }

    /**
     * Removes an ExtentsProvider from the Scale.
     *
     * @param {Scales.ExtentsProvider} provider
     * @returns {Sclae} The calling Scale.
     */
    public removeIncludedValuesProvider(provider: Scales.ExtentsProvider<D>) {
      this._includedValuesProviders.delete(provider);
      this._autoDomainIfAutomaticMode();
      return this;
    }
  }
}
