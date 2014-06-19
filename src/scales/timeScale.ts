///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.Scale {
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1000 * 60 * 60 * 24;
    private lastRequestedTickCount = 10;
    public _d3Scale: D3.Scale.TimeScale;
    public _userSetDomainer: boolean = false;
    private _domainer: Domainer = new Domainer();

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

    public tickInterval(interval: D3.Time.Interval, step?: number) {
      return this._d3Scale.ticks(interval, step);
    }

    public domain(): any[];
    public domain(values: any[]): Time;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    /**
     * Sets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @param {Domainer} domainer The domainer to be set.
     * @return {Time} The calling scale.
     */
    public domainer(): Domainer;
    public domainer(domainer: Domainer): Time;
    public domainer(domainer?: Domainer): any {
      if (domainer == null) {
        return this._domainer;
      } else {
        this._domainer = domainer;
        this._userSetDomainer = true;
        if (this._autoDomainAutomatically) {
          this.autoDomain();
        }
        return this;
      }
    }
  }
}
}
