///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.QuantitativeScale {
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
      // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
      var tempScale = d3.time.scale();
      tempScale.domain(this.domain());
      tempScale.range(this.range());
      return tempScale.ticks(interval.range, step);
    }

    public domain(): any[];
    public domain(values: any[]): Time;
    public domain(values?: any[]): any {
      if (values == null) {
        return super.domain();
      } else {
        // attempt to parse dates
        if (typeof(values[0]) === "string") {
          values = values.map((d: any) => new Date(d));
        }
        return super.domain(values);
      }
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
