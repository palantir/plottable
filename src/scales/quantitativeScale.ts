module Plottable {
export class QuantitativeScale<D> extends Scale<D, number> {
  protected static _DEFAULT_NUM_TICKS = 10;
  private _tickGenerator: Scales.TickGenerators.TickGenerator<D> = (scale: Plottable.QuantitativeScale<D>) => scale.defaultTicks();
  private _padProportion = 0.05;
  private _paddingExceptionsProviders: Utils.Set<Scales.PaddingExceptionsProvider<D>>;
  private _domainMin: D;
  private _domainMax: D;
  private _snappingDomainEnabled = true;

  /**
   * A QuantitativeScale is a Scale that maps number-like values to numbers.
   * It is invertible and continuous.
   *
   * @constructor
   */
  constructor() {
    super();
    this._paddingExceptionsProviders = new Utils.Set<Scales.PaddingExceptionsProvider<D>>();
  }

  public autoDomain() {
    this._domainMin = null;
    this._domainMax = null;
    super.autoDomain();
    return this;
  }

  protected _autoDomainIfAutomaticMode() {
    if (this._domainMin != null && this._domainMax != null) {
      this._setDomain([this._domainMin, this._domainMax]);
      return;
    }

    let computedExtent = this._getExtent();

    if (this._domainMin != null) {
      let maxValue = computedExtent[1];
      if (this._domainMin >= maxValue) {
        maxValue = this._expandSingleValueDomain([this._domainMin, this._domainMin])[1];
      }
      this._setDomain([this._domainMin, maxValue]);
      return;
    }

    if (this._domainMax != null) {
      let minValue = computedExtent[0];
      if (this._domainMax <= minValue) {
        minValue = this._expandSingleValueDomain([this._domainMax, this._domainMax])[0];
      }
      this._setDomain([minValue, this._domainMax]);
      return;
    }

    super._autoDomainIfAutomaticMode();
  }

  protected _getExtent(): D[] {
    let includedValues = this._getAllIncludedValues();
    let extent = this._defaultExtent();
    if (includedValues.length !== 0) {
      let combinedExtent = [
        Utils.Math.min<D>(includedValues, extent[0]),
        Utils.Math.max<D>(includedValues, extent[1])
      ];
      extent = this._padDomain(combinedExtent);
    }

    if (this._domainMin != null) {
      extent[0] = this._domainMin;
    }
    if (this._domainMax != null) {
      extent[1] = this._domainMax;
    }
    return extent;
  }

  /**
   * Adds a padding exception provider.
   * If one end of the domain is set to an excepted value as a result of autoDomain()-ing,
   * that end of the domain will not be padded.
   *
   * @param {Scales.PaddingExceptionProvider<D>} provider The provider function.
   * @returns {QuantitativeScale} The calling QuantitativeScale.
   */
  public addPaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>) {
    this._paddingExceptionsProviders.add(provider);
    this._autoDomainIfAutomaticMode();
    return this;
  }

  /**
   * Removes the padding exception provider.
   *
   * @param {Scales.PaddingExceptionProvider<D>} provider The provider function.
   * @returns {QuantitativeScale} The calling QuantitativeScale.
   */
  public removePaddingExceptionsProvider(provider: Scales.PaddingExceptionsProvider<D>) {
    this._paddingExceptionsProviders.delete(provider);
    this._autoDomainIfAutomaticMode();
    return this;
  }

  /**
   * Gets the padding proportion.
   */
  public padProportion(): number;
  /**
   * Sets the padding porportion.
   * When autoDomain()-ing, the computed domain will be expanded by this proportion,
   * then rounded to human-readable values.
   *
   * @param {number} padProportion The padding proportion. Passing 0 disables padding.
   * @returns {QuantitativeScale} The calling QuantitativeScale.
   */
  public padProportion(padProportion: number): this;
  public padProportion(padProportion?: number): any {
    if (padProportion == null) {
      return this._padProportion;
    }
    if (padProportion < 0) {
      throw new Error("padProportion must be non-negative");
    }
    this._padProportion = padProportion;
    this._autoDomainIfAutomaticMode();
    return this;
  }

  private _padDomain(domain: D[]) {
    if (domain[0].valueOf() === domain[1].valueOf()) {
      return this._expandSingleValueDomain(domain);
    }
    if (this._padProportion === 0) {
      return domain;
    }

    let p = this._padProportion / 2;
    let min = domain[0];
    let max = domain[1];
    let minExistsInExceptions = false;
    let maxExistsInExceptions = false;
    this._paddingExceptionsProviders.forEach((provider) => {
      let values = provider(this);
      values.forEach((value) => {
        if (value.valueOf() === min.valueOf()) {
          minExistsInExceptions = true;
        }
        if (value.valueOf() === max.valueOf()) {
          maxExistsInExceptions = true;
        }
      });
    });
    const originalDomain = this._getDomain();
    this._setBackingScaleDomain(domain);
    let newMin = minExistsInExceptions ? min : this.invert(this.scale(min) - (this.scale(max) - this.scale(min)) * p);
    let newMax = maxExistsInExceptions ? max : this.invert(this.scale(max) + (this.scale(max) - this.scale(min)) * p);
    this._setBackingScaleDomain(originalDomain);

    if (this._snappingDomainEnabled) {
      return this._niceDomain([newMin, newMax]);
    }
    return ([newMin, newMax]);
  }

  /**
   * Gets whether or not the scale snaps its domain to nice values.
   */
  public snappingDomainEnabled(): boolean;
  /**
   * Sets whether or not the scale snaps its domain to nice values.
   */
  public snappingDomainEnabled(snappingDomainEnabled: boolean): this;
  public snappingDomainEnabled(snappingDomainEnabled?: boolean): any {
    if (snappingDomainEnabled == null) {
      return this._snappingDomainEnabled;
    }

    this._snappingDomainEnabled = snappingDomainEnabled;
    this._autoDomainIfAutomaticMode();
    return this;
  }

  protected _expandSingleValueDomain(singleValueDomain: D[]): D[] {
    return singleValueDomain;
  }

  /**
   * Computes the domain value corresponding to a supplied range value.
   *
   * @param {number} value: A value from the Scale's range.
   * @returns {D} The domain value corresponding to the supplied range value.
   */
  public invert(value: number): D {
    throw new Error("Subclasses should override invert");
  }

  public domain(): D[];
  public domain(values: D[]): this;
  public domain(values?: D[]): any {
    if (values != null) {
      this._domainMin = values[0];
      this._domainMax = values[1];
    }
    return super.domain(values);
  }

  /**
   * Gets the lower end of the domain.
   *
   * @return {D}
   */
  public domainMin(): D;
  /**
   * Sets the lower end of the domain.
   *
   * @return {QuantitativeScale} The calling QuantitativeScale.
   */
  public domainMin(domainMin: D): this;
  public domainMin(domainMin?: D): any {
    if (domainMin == null) {
      return this.domain()[0];
    }
    this._domainMin = domainMin;
    this._autoDomainIfAutomaticMode();
    return this;
  }

  /**
   * Gets the upper end of the domain.
   *
   * @return {D}
   */
  public domainMax(): D;
  /**
   * Sets the upper end of the domain.
   *
   * @return {QuantitativeScale} The calling QuantitativeScale.
   */
  public domainMax(domainMax: D): this;
  public domainMax(domainMax?: D): any {
    if (domainMax == null) {
      return this.domain()[1];
    }
    this._domainMax = domainMax;
    this._autoDomainIfAutomaticMode();
    return this;
  }

  public extentOfValues(values: D[]): D[] {
    // HACKHACK: TS1.4 doesn't consider numbers to be Number-like (valueOf() returning number), so D can't be typed correctly
    let extent = d3.extent(<any[]> values.filter((value) => Utils.Math.isValidNumber(+value)));
    if (extent[0] == null || extent[1] == null) {
      return [];
    } else {
      return extent;
    }
  }

  protected _setDomain(values: D[]) {
    let isNaNOrInfinity = (x: any) => Utils.Math.isNaN(x) || x === Infinity || x === -Infinity;
    if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
      Utils.Window.warn("Warning: QuantitativeScales cannot take NaN or Infinity as a domain value. Ignoring.");
      return;
    }
    super._setDomain(values);
  }

  /**
   * Gets the array of tick values generated by the default algorithm.
   */
  public defaultTicks(): D[] {
    throw new Error("Subclasses should override _getDefaultTicks");
  }

  /**
   * Gets an array of tick values spanning the domain.
   *
   * @returns {D[]}
   */
  public ticks(): D[] {
    return this._tickGenerator(this);
  }

  /**
   * Given a domain, expands its domain onto "nice" values, e.g. whole
   * numbers.
   */
  protected _niceDomain(domain: D[], count?: number): D[] {
    throw new Error("Subclasses should override _niceDomain");
  }

  protected _defaultExtent(): D[] {
    throw new Error("Subclasses should override _defaultExtent");
  }

  /**
   * Gets the TickGenerator.
   */
  public tickGenerator(): Scales.TickGenerators.TickGenerator<D>;
  /**
   * Sets the TickGenerator
   *
   * @param {TickGenerator} generator
   * @return {QuantitativeScale} The calling QuantitativeScale.
   */
  public tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): this;
  public tickGenerator(generator?: Scales.TickGenerators.TickGenerator<D>): any {
    if (generator == null) {
      return this._tickGenerator;
    } else {
      this._tickGenerator = generator;
      return this;
    }
  }
}
}
