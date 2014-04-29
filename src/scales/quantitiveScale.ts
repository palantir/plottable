///<reference path="../reference.ts" />

module Plottable {
  export class QuantitiveScale extends Scale {
    public _d3Scale: D3.Scale.QuantitiveScale;
    private lastRequestedTickCount = 10;

    /**
     * Creates a new QuantitiveScale.
     *
     * @constructor
     * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
     */
    constructor(scale: D3.Scale.QuantitiveScale) {
      super(scale);
    }

    public _getExtent(): any[] {
      var extents = this._getAllExtents();
      var starts: number[] = extents.map((e) => e[0]);
      var ends: number[] = extents.map((e) => e[1]);
      if (starts.length > 0) {
        return [d3.min(starts), d3.max(ends)];
      } else {
        return [0, 1];
      }
    }

    public autoDomain() {
      super.autoDomain();
      if (this._autoPad) {
        this.padDomain();
      }
      if (this._autoNice) {
        this.nice();
      }
      return this;
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     *
     * @param {number} value: A value from the Scale's range.
     * @returns {number} The domain value corresponding to the supplied range value.
     */
    public invert(value: number) {
      return this._d3Scale.invert(value);
    }

    /**
     * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
     *
     * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
     */
    public copy(): QuantitiveScale {
      return new QuantitiveScale(this._d3Scale.copy());
    }

    public domain(): any[];
    public domain(values: any[]): QuantitiveScale;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    /**
     * Sets or gets the QuantitiveScale's output interpolator
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|QuantitiveScale} The current output interpolator, or the calling QuantitiveScale.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): QuantitiveScale;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this._d3Scale.interpolate();
      }
      this._d3Scale.interpolate(factory);
      return this;
    }

    /**
     * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets or sets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
     *
     * @param {boolean} [clamp] Whether or not to clamp the QuantitiveScale.
     * @returns {boolean|QuantitiveScale} The current clamp status, or the calling QuantitiveScale.
     */
    public clamp(): boolean;
    public clamp(clamp: boolean): QuantitiveScale;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this._d3Scale.clamp();
      }
      this._d3Scale.clamp(clamp);
      return this;
    }

    /**
     * Extends the scale's domain so it starts and ends with "nice" values.
     *
     * @param {number} [count] The number of ticks that should fit inside the new domain.
     */
    public nice(count?: number) {
      this._d3Scale.nice(count);
      this._setDomain(this._d3Scale.domain()); // nice() can change the domain, so update all listeners
      return this;
    }

    /**
     * Generates tick values.
     *
     * @param {number} [count] The number of ticks to generate.
     * @returns {any[]} The generated ticks.
     */
    public ticks(count?: number) {
      if (count != null) {
        this.lastRequestedTickCount = count;
      }
      return this._d3Scale.ticks(this.lastRequestedTickCount);
    }

    /**
     * Gets a tick formatting function for displaying tick values.
     *
     * @param {number} count The number of ticks to be displayed
     * @param {string} [format] A format specifier string.
     * @returns {(n: number) => string} A formatting function.
     */
    public tickFormat(count: number, format?: string): (n: number) => string {
      return this._d3Scale.tickFormat(count, format);
    }

    /**
     * Pads out the domain of the scale by a specified ratio.
     *
     * @param {number} [padProportion] Proportionally how much bigger the new domain should be (0.05 = 5% larger)
     * @returns {QuantitiveScale} The calling QuantitiveScale.
     */
    public padDomain(padProportion = 0.05): QuantitiveScale {
      var currentDomain = this.domain();
      var extent = currentDomain[1]-currentDomain[0];
      var newDomain = [currentDomain[0] - padProportion/2 * extent, currentDomain[1] + padProportion/2 * extent];
      if (currentDomain[0] === 0) {
        newDomain[0] = 0;
      }
      if (currentDomain[1] === 0) {
        newDomain[1] = 0;
      }
      this._setDomain(newDomain);
      return this;
    }
  }
}
