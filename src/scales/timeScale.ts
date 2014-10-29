///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends AbstractQuantitative<any> {
    public _typeCoercer = (d: any) => d && d._isAMomentObject || d instanceof Date ? d : new Date(d);

    /**
     * Constructs a TimeScale.
     *
     * A TimeScale maps Date objects to numbers.
     *
     * @constructor
     * @param {D3.Scale.Time} scale The D3 LinearScale backing the Scale.Time. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    constructor(scale?: any) {
      // need to cast since d3 time scales do not descend from Quantitative scales
      super(scale == null ? (<any>d3.time.scale()) : scale);
    }

    public _tickInterval(interval: D3.Time.Interval, step?: number): any[] {
      return this._d3Scale.ticks(interval.range, step);
    }

    public _setDomain(values: any[]) {
      // attempt to parse dates
      values = values.map(this._typeCoercer);
      return super._setDomain(values);
    }

    public copy(): Time {
      return new Time(this._d3Scale.copy());
    }

    public _defaultExtent(): any[] {
      var endTime = new Date().valueOf();
      var startTime = endTime - Plottable.MILLISECONDS_IN_ONE_DAY;
      return [startTime, endTime];
    }
  }
}
}
