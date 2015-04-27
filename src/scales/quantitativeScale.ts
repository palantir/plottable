///<reference path="../reference.ts" />

module Plottable {
  export class QuantitativeScale<D> extends Scale<D, number> {
    public setByUser: boolean = false;
    public typeCoercer = (d: any) => +d;

    protected d3Scale: D3.Scale.QuantitativeScale;

    private static PADDING_FOR_IDENTICAL_DOMAIN = 1;
    private _domainer: Domainer = new Domainer();
    private _numTicks = 10;
    private _tickGenerator: Scales.TickGenerators.TickGenerator<D> = (scale: Plottable.QuantitativeScale<D>) => scale.getDefaultTicks();

    /**
     * Constructs a new QuantitativeScaleScale.
     *
     * A QuantitativeScaleScale is a Scale that maps anys to numbers. It
     * is invertible and continuous.
     *
     * @constructor
     * @param {D3.Scale.QuantitativeScaleScale} scale The D3 QuantitativeScaleScale
     * backing the QuantitativeScaleScale.
     */
    constructor(scale: D3.Scale.QuantitativeScale) {
      super(scale);
    }

    /**
     * Gets the clamp status of the QuantitativeScaleScale (whether to cut off values outside the ouput range).
     *
     * @returns {boolean} The current clamp status.
     */
    public clamp(): boolean;
    /**
     * Sets the clamp status of the QuantitativeScaleScale (whether to cut off values outside the ouput range).
     *
     * @param {boolean} clamp Whether or not to clamp the QuantitativeScaleScale.
     * @returns {QuantitativeScale} The calling QuantitativeScaleScale.
     */
    public clamp(clamp: boolean): QuantitativeScale<D>;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this.d3Scale.clamp();
      }
      this.d3Scale.clamp(clamp);
      return this;
    }

    /**
     * Creates a copy of the QuantitativeScaleScale with the same domain and range but without any registered list.
     *
     * @returns {QuantitativeScale} A copy of the calling QuantitativeScaleScale.
     */
    public copy(): QuantitativeScale<D> {
      return new QuantitativeScale<D>(this.d3Scale.copy());
    }

    public defaultExtent(): any[] {
      return [0, 1];
    }

    public domain(): D[];
    public domain(values: D[]): QuantitativeScale<D>;
    public domain(values?: D[]): any {
      return super.domain(values); // need to override type sig to enable method chaining:/
    }

    /**
     * Gets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {Domainer} The scale's current domainer.
     */
    public domainer(): Domainer;
    /**
     * Sets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * When you set domainer, we assume that you know what you want the domain
     * to look like better that we do. Ensuring that the domain is padded,
     * includes 0, etc., will be the responsability of the new domainer.
     *
     * @param {Domainer} domainer If provided, the new domainer.
     * @return {QuantitativeScale} The calling QuantitativeScaleScale.
     */
    public domainer(domainer: Domainer): QuantitativeScale<D>;
    public domainer(domainer?: Domainer): any {
      if (domainer == null) {
        return this._domainer;
      } else {
        this._domainer = domainer;
        this.setByUser = true;
        this.autoDomainIfAutomaticMode();
        return this;
      }
    }

    /**
     * Gets ticks generated by the default algorithm.
     */
    public getDefaultTicks(): D[] {
        return this.d3Scale.ticks(this.numTicks());
    }

    /**
     * Sets or gets the QuantitativeScaleScale's output interpolator
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|QuantitativeScale} The current output interpolator, or the calling QuantitativeScaleScale.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): QuantitativeScale<D>;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this.d3Scale.interpolate();
      }
      this.d3Scale.interpolate(factory);
      return this;
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     *
     * @param {number} value: A value from the Scale's range.
     * @returns {D} The domain value corresponding to the supplied range value.
     */
    public invert(value: number): D {
      return <any> this.d3Scale.invert(value);
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public niceDomain(domain: any[], count?: number): any[] {
      return this.d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Gets the default number of ticks.
     *
     * @returns {number} The default number of ticks.
     */
    public numTicks(): number;
    /**
     * Sets the default number of ticks to generate.
     *
     * @param {number} count The new default number of ticks.
     * @returns {QuantitativeScale} The calling QuantitativeScaleScale.
     */
    public numTicks(count: number): QuantitativeScale<D>;
    public numTicks(count?: number): any {
      if (count == null) {
        return this._numTicks;
      }
      this._numTicks = count;
      return this;
    }

    /**
     * Sets the range of the QuantitativeScaleScale and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this.d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets a set of tick values spanning the domain.
     *
     * @returns {any[]} The generated ticks.
     */
    public ticks(): any[] {
      return this._tickGenerator(this);
    }

    /**
     * Gets the tick generator of the QuantitativeScale.
     *
     * @returns {TickGenerator} The current tick generator.
     */
    public tickGenerator(): Scales.TickGenerators.TickGenerator<D>;
    /**
     * Sets a tick generator
     *
     * @param {TickGenerator} generator, the new tick generator.
     * @return {QuantitativeScale} The calling QuantitativeScale.
     */
    public tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): QuantitativeScale<D>;
    public tickGenerator(generator?: Scales.TickGenerators.TickGenerator<D>): any {
      if (generator == null) {
        return this._tickGenerator;
      } else {
        this._tickGenerator = generator;
        return this;
      }
    }

    protected getExtent(): D[] {
      return this._domainer.computeDomain(this.getAllExtents(), this);
    }

    protected setDomain(values: D[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            Utils.Methods.warn("Warning: QuantitativeScaleScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super.setDomain(values);
    }
  }
}
