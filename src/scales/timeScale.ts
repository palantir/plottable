///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Time extends QuantitativeScale<Date> {
    /**
     * Constructs a TimeScale.
     *
     * A TimeScale maps Date objects to numbers.
     *
     * @constructor
     * @param {D3.Scale.Time} scale The D3 LinearScale backing the Scale.Time. If not supplied, uses a default scale.
     */
    constructor() {
      super();
      this._d3Scale = d3.time.scale();
    }

    /**
     * Specifies the interval between ticks
     *
     * @param {string} interval TimeInterval string specifying the interval unit measure
     * @param {number?} step? The distance between adjacent ticks (using the interval unit measure)
     *
     * @return {Date[]}
     */
    public tickInterval(interval: string, step?: number): Date[] {
      // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
      var tempScale = d3.time.scale();
      var d3Interval = Formatters.timeIntervalToD3Time(interval);
      tempScale.domain(this.domain());
      tempScale.range(this.range());
      return tempScale.ticks(d3Interval.range, step);
    }

    protected _setDomain(values: Date[]) {
      if (values[1] < values[0]) {
        throw new Error("Scale.Time domain values must be in chronological order");
      }
      return super._setDomain(values);
    }

    public _defaultExtent(): Date[] {
      var endTimeValue = new Date().valueOf();
      var startTimeValue = endTimeValue - Plottable.MILLISECONDS_IN_ONE_DAY;
      return [new Date(startTimeValue), new Date(endTimeValue)];
    }
  }
}
}
