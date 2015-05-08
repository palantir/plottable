///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Time extends QuantitativeScale<Date> {
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
    constructor(scale?: D3.Scale.LinearScale) {
      // need to cast since d3 time scales do not descend from QuantitativeScale scales
      super(scale == null ? (<any>d3.time.scale()) : scale);
    }

    public tickInterval(interval: D3.Time.Interval, step?: number): Date[] {
      // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
      var tempScale = d3.time.scale();
      tempScale.domain(this.domain());
      tempScale.range(this.range());
      return tempScale.ticks(interval.range, step);
    }

    protected _setDomain(values: Date[]) {
      if (values[1] < values[0]) {
        throw new Error("Scale.Time domain values must be in chronological order");
      }
      return super._setDomain(values);
    }

    public copy(): Time {
      return new Time(this._d3Scale.copy());
    }

    public _defaultExtent(): Date[] {
      var endTimeValue = new Date().valueOf();
      var startTimeValue = endTimeValue - Plottable.MILLISECONDS_IN_ONE_DAY;
      return [new Date(startTimeValue), new Date(endTimeValue)];
    }
  }
}
}
