///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.Scale {
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1000 * 60 * 60 * 24;
    private lastRequestedTickCount = 10;
    public _d3Scale: D3.Scale.TimeScale;


    /**
     * Creates a new Time.
     *
     * @constructor
     */
    constructor(scale?: D3.Scale.TimeScale) {
      super(<any> d3.time.scale());
    }

    public _setDomain(values: any[]) {
      super._setDomain(values.map((d: any) => new Date(d)));
    }

    public _getExtent(): number[] {
      var extents = this._getAllExtents();
      if (extents.length > 0) {
        return [d3.min(extents, (e) => e[0]), d3.max(extents, (e) => e[1])];
      } else {
        return [0, 1];
      }
    }

    public autoDomain() {
      super.autoDomain();
      if (this._autoPad) {
        this.padDomain();
      }
      return this;
    }

    /**
     * Sets the range of the Time and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets or sets the clamp status of the Time (whether to cut off values outside the ouput range).
     *
     * @param {boolean} [clamp] Whether or not to clamp the Time.
     * @returns {boolean|Time} The current clamp status, or the calling Time.
     */
    public clamp(): boolean;
    public clamp(clamp: boolean): Time;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this._d3Scale.clamp();
      }
      this._d3Scale.clamp(clamp);
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

    public domain(): any[];
    public domain(values: any[]): Time;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    /**
     * Pads out the domain of the scale by a specified ratio.
     *
     * @param {number} [padProportion] Proportionally how much bigger the new domain should be (0.05 = 5% larger)
     * @returns {Time} The calling Time.
     */
    public padDomain(padProportion = 0.05): Time {
      var currentDomain = this.domain();
      if (currentDomain[0] === currentDomain[1]) {
        var d = currentDomain[0].valueOf(); // valueOf accounts for dates properly
        this._setDomain([d - this._PADDING_FOR_IDENTICAL_DOMAIN, d + this._PADDING_FOR_IDENTICAL_DOMAIN]);
        return this;
      }

      var extent = currentDomain[1] - currentDomain[0];
      // currentDomain[1].valueOf() converts date to miliseconds, leaves numbers unchanged. else + attemps string concat.
      var newDomain = [currentDomain[0] - padProportion/2 * extent, currentDomain[1].valueOf() + padProportion/2 * extent];
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
}
