/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";
import * as Scales from "./";

export type TransformableScale<D, R> = Scale<D, R> & Scales.ITransformableScale;

export interface IScaleCallback<S extends Scale<any, any>> {
  (scale: S): any;
}

export class Scale<D, R> {
  private _callbacks: Utils.CallbackSet<IScaleCallback<this>>;
  private _autoDomainAutomatically = true;
  private _domainModificationInProgress = false;
  private _includedValuesProviders: Utils.Set<Scales.IIncludedValuesProvider<D>>;
  private _updateId = 0;

  /**
   * A Scale is a function (in the mathematical sense) that maps values from a domain to a range.
   *
   * @constructor
   */
  constructor() {
    this._callbacks = new Utils.CallbackSet<IScaleCallback<this>>();
    this._includedValuesProviders = new Utils.Set<Scales.IIncludedValuesProvider<D>>();
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

  protected _getAllIncludedValues(ignoreAttachState = false): D[] {
    let providerArray: D[] = [];
    this._includedValuesProviders.forEach((provider: Scales.IIncludedValuesProvider<D>) => {
      const extents = provider(this, ignoreAttachState);
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
  public onUpdate(callback: IScaleCallback<this>) {
    this._callbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the Scale updates.
   *
   * @param {ScaleCallback} callback.
   * @returns {Scale} The calling Scale.
   */
  public offUpdate(callback: IScaleCallback<this>) {
    this._callbacks.delete(callback);
    return this;
  }

  protected _dispatchUpdate() {
    this._updateId++;
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

  /**
   * Triggers `.autoDomain()` if the domain is not explicitly set.
   */
  public autoDomainIfAutomaticMode() {
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
   * Gets an array of tick values spanning the domain.
   *
   * @returns {D[]}
   */
  public ticks(): D[] {
    return this.domain();
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
  public addIncludedValuesProvider(provider: Scales.IIncludedValuesProvider<D>) {
    this._includedValuesProviders.add(provider);
    this.autoDomainIfAutomaticMode();
    return this;
  }

  /**
   * Removes the IncludedValuesProvider from the Scale.
   *
   * @param {Scales.IncludedValuesProvider} provider
   * @returns {Scale} The calling Scale.
   */
  public removeIncludedValuesProvider(provider: Scales.IIncludedValuesProvider<D>) {
    this._includedValuesProviders.delete(provider);
    this.autoDomainIfAutomaticMode();
    return this;
  }

  public updateId() {
    return this._updateId;
  }
}
