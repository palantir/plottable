namespace Plottable.Scales {

  /**
   * A function that supplies domain values to be included into a Scale.
   *
   * @param {Scale} scale
   * @returns {D[]} An array of values that should be included in the Scale.
   */
  export interface IncludedValuesProvider<D> {
    (scale: Scale<D, any>): D[];
  }

  /**
   * A function that supplies padding exception values for the Scale.
   * If one end of the domain is set to an excepted value as a result of autoDomain()-ing,
   * that end of the domain will not be padded.
   *
   * @param {QuantitativeScale} scale
   * @returns {D[]} An array of values that should not be padded.
   */
  export interface PaddingExceptionsProvider<D> {
    (scale: QuantitativeScale<D>): D[];
  }

  /**
   * This interface abstracts the necessary API for implementing pan/zoom on
   * various types of scales.
   *
   * Due to some limitations of d3, for example category scales can't invert
   * screen space coordinates, we nevertheless allow the scale types to support
   * pan/zoom if they implement this interface. See `Category`'s
   * `_d3TransformationScale` for more info.
   */
  export interface TransformableScale {
    /**
     * Apply the magnification with the floating point `magnifyAmount` centered
     * at the `centerValue` coordinate.
     *
     * @param {number} [magnifyAmount] The floating point zoom amount. `1.0` is
     * no zoom change.
     * @param {number} [centerValue] The coordinate of the mouse in screen
     * space.
     */
    zoom(magnifyAmount: number, centerValue: number): void;

    /**
     * Translates the scale by a number of pixels.
     *
     * @param {number} [translateAmount] The translation amount in screen space
     */
    pan(translateAmount: number): void;

    /**
     * Returns value in *screen space* for the given domain value.
     */
    scaleTransformation(value: number): number;

    /**
     * Returns the current transformed domain of the scale. This must be a
     * numerical range in the same coordinate space used for
     * `scaleTransformation`.
     */
    getTransformationDomain(): [number, number];

    /**
     * Returns value in *Transformation Space* for the provided *screen space*.
     */
    invertedTransformation(value: number): number;
  }

  /**
   * Type guarded function to check if the scale implements the
   * `TransformableScale` interface. Unfortunately, there is no way to do
   * runtime interface typechecking, so we have to explicitly list all classes
   * that implement the interface.
   */
  export function isTransformable(scale: any): scale is TransformableScale {
    return (scale instanceof Plottable.QuantitativeScale ||
      scale instanceof Plottable.Scales.Category);
  }
}

namespace Plottable {

export type TransformableScale<D, R> = Scale<D, R> & Plottable.Scales.TransformableScale;

export interface ScaleCallback<S extends Scale<any, any>> {
  (scale: S): any;
}

export class Scale<D, R> {
  private _callbacks: Utils.CallbackSet<ScaleCallback<this>>;
  private _autoDomainAutomatically = true;
  private _domainModificationInProgress = false;
  private _includedValuesProviders: Utils.Set<Scales.IncludedValuesProvider<D>>;

  /**
   * A Scale is a function (in the mathematical sense) that maps values from a domain to a range.
   *
   * @constructor
   */
  constructor() {
    this._callbacks = new Utils.CallbackSet<ScaleCallback<this>>();
    this._includedValuesProviders = new Utils.Set<Scales.IncludedValuesProvider<D>>();
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
    let providerArray: D[] = [];
    this._includedValuesProviders.forEach((provider: Scales.IncludedValuesProvider<D>) => {
      let extents = provider(this);
      providerArray = providerArray.concat(extents);
    });
    return providerArray;
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
  public onUpdate(callback: ScaleCallback<this>) {
    this._callbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the Scale updates.
   *
   * @param {ScaleCallback} callback.
   * @returns {Scale} The calling Scale.
   */
  public offUpdate(callback: ScaleCallback<this>) {
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
  public domain(values: D[]): this;
  public domain(values?: D[]): any {
    if (values == null) {
      return this._getDomain();
    } else {
      this._autoDomainAutomatically = false;
      this._setDomain(values);
      return this;
    }
  }

  protected _getDomain(): D[] {
    throw new Error("Subclasses should override _getDomain");
  }

  protected _setDomain(values: D[]) {
    if (!this._domainModificationInProgress) {
      this._domainModificationInProgress = true;
      this._backingScaleDomain(values);
      this._dispatchUpdate();
      this._domainModificationInProgress = false;
    }
  }

  protected _backingScaleDomain(): D[]
  protected _backingScaleDomain(values: D[]): this
  protected _backingScaleDomain(values?: D[]): any {
    throw new Error("Subclasses should override _backingDomain");
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
  public range(values: R[]): this;
  public range(values?: R[]): any {
    if (values == null) {
      return this._getRange();
    } else {
      this._setRange(values);
      return this;
    }
  }

  protected _getRange(): R[] {
    throw new Error("Subclasses should override _getRange");
  }

  protected _setRange(values: R[]) {
    throw new Error("Subclasses should override _setRange");
  }

  /**
   * Adds an IncludedValuesProvider to the Scale.
   *
   * @param {Scales.IncludedValuesProvider} provider
   * @returns {Scale} The calling Scale.
   */
  public addIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>) {
    this._includedValuesProviders.add(provider);
    this._autoDomainIfAutomaticMode();
    return this;
  }

  /**
   * Removes the IncludedValuesProvider from the Scale.
   *
   * @param {Scales.IncludedValuesProvider} provider
   * @returns {Scale} The calling Scale.
   */
  public removeIncludedValuesProvider(provider: Scales.IncludedValuesProvider<D>) {
    this._includedValuesProviders.delete(provider);
    this._autoDomainIfAutomaticMode();
    return this;
  }
}
}
