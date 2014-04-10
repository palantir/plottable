///<reference path="../reference.ts" />

module Plottable {
  export class OrdinalScale extends Scale {
    public _d3Scale: D3.Scale.OrdinalScale;
    private END_PADDING = 0.5; // as a proportion of the spacing between domain values
    private _range = [0, 1];

    /**
     * Creates a new OrdinalScale. Domain and Range are set later.
     *
     * @constructor
     */
    constructor() {
      super(d3.scale.ordinal());
    }

    public domain(): any[];
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this._d3Scale.domain(values);
        this._broadcasterCallbacks.forEach((b) => b(this));
        this._d3Scale.rangePoints(this.range(), 2*this.END_PADDING); // d3 scale takes total padding
        return this;
      }
    }

    /**
     * Returns the range of pixels spanned by the scale, or sets the range.
     *
     * @param {number[]} [values] The pixel range to set on the scale.
     * @returns {number[]|OrdinalScale} The pixel range, or the calling OrdinalScale.
     */
    public range(): any[];
    public range(values: number[]): Scale;
    public range(values?: number[]): any {
      if (values == null) {
        return this._range;
      } else {
        this._range = values;
        this._d3Scale.rangePoints(values, 2*this.END_PADDING); // d3 scale takes total padding
        return this;
      }
    }

    public widenDomainOnData(data: any[], accessor?: IAccessor): OrdinalScale {
      var changed = false;
      var newDomain = this.domain();
      var a: (d: any, i: number) => any;
      if (accessor == null) {
        a = (d, i) => d;
      } else if (typeof(accessor) === "string") {
        a = (d, i) => d[accessor];
      } else if (typeof(accessor) === "function") {
        a = accessor;
      } else {
        a = (d, i) => accessor;
      }
      data.map(a).forEach((d) => {
        if (newDomain.indexOf(d) === -1) {
          newDomain.push(d);
          changed = true;
        }
      });
      if (changed) {
        this.domain(newDomain);
      }
      return this;
    }
  }
}
