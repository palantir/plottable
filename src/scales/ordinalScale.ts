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

    public _getCombinedExtent(): any [] {
      var extents = super._getCombinedExtent();
      var concatenatedExtents: string[] = [];
      extents.forEach((e) => {
        concatenatedExtents = concatenatedExtents.concat(e);
      });
      return Utils.uniq(concatenatedExtents);
    }

    public autorangeDomain() {
      super.autorangeDomain();
      var extent = this._getCombinedExtent();
      this._d3Scale(extent);
      this._d3Scale.rangePoints(this.range(), 2*this.END_PADDING);
      this._broadcast();
      return this;
    }

    public domain(): any[];
    public domain(values: any[]): OrdinalScale;
    public domain(values?: any[]): any {
      if (values == null) {
        return super.domain(values);
      } else {
        super.domain(values);
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
  }
}
