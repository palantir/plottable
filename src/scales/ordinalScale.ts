///<reference path="../reference.ts" />

module Plottable {
  export class OrdinalScale extends Scale {
    public _d3Scale: D3.Scale.OrdinalScale;
    private _range = [0, 1];
    private _rangeType: string = "points";

    // Padding as a proportion of the spacing between domain values
    private _innerPadding: number = 0.3;
    private _outerPadding: number = 0.5;

    /**
     * Creates a new OrdinalScale. Domain and Range are set later.
     *
     * @constructor
     */
    constructor() {
      super(d3.scale.ordinal());
    }

    public _getExtent(): any[] {
      var extents = this._getAllExtents();
      var concatenatedExtents: string[] = [];
      extents.forEach((e) => {
        concatenatedExtents = concatenatedExtents.concat(e);
      });
      return Utils.uniq(concatenatedExtents);
    }

    /**
     * Retrieves the current domain, or sets the Scale's domain to the specified values.
     *
     * @param {any[]} [values] The new values for the domain. This array may contain more than 2 values.
     * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
     */
    public domain(): any[];
    public domain(values: any[]): OrdinalScale;
    public domain(values?: any[]): any {
      return super.domain(values);
    }

    public _setDomain(values: any[]) {
      super._setDomain(values);
      this.range(this.range()); // update range
    }

    /**
     * Returns the range of pixels spanned by the scale, or sets the range.
     *
     * @param {number[]} [values] The pixel range to set on the scale.
     * @returns {number[]|OrdinalScale} The pixel range, or the calling OrdinalScale.
     */
    public range(): any[];
    public range(values: number[]): OrdinalScale;
    public range(values?: number[]): any {
      if (values == null) {
        return this._range;
      } else {
        this._range = values;
        if (this._rangeType === "points") {
          this._d3Scale.rangePoints(values, 2*this._outerPadding); // d3 scale takes total padding
        } else if (this._rangeType === "bands") {
          this._d3Scale.rangeBands(values, this._innerPadding, this._outerPadding);
        }
        return this;
      }
    }

    /**
     * Returns the width of the range band. Only valid when rangeType is set to "bands".
     *
     * @returns {number} The range band width or 0 if rangeType isn't "bands".
     */
    public rangeBand() : number {
      return this._d3Scale.rangeBand();
    }

    /**
     * Returns the range type, or sets the range type.
     *
     * @param {string} [rangeType] Either "points" or "bands" indicating the
     *     d3 method used to generate range bounds.
     * @param {number} [outerPadding] The padding outside the range,
     *     proportional to the range step.
     * @param {number} [innerPadding] The padding between bands in the range,
     *     proportional to the range step. This parameter is only used in
     *     "bands" type ranges.
     * @returns {string|OrdinalScale} The current range type, or the calling
     *     OrdinalScale.
     */
    public rangeType() : string;
    public rangeType(rangeType: string, outerPadding?: number, innerPadding?: number) : OrdinalScale;
    public rangeType(rangeType?: string, outerPadding?: number, innerPadding?: number) : any {
      if (rangeType == null) {
        return this._rangeType;
      } else {
        if(!(rangeType === "points" || rangeType === "bands")) {
          throw new Error("Unsupported range type: " + rangeType);
        }
        this._rangeType = rangeType;
        if (outerPadding != null) {
          this._outerPadding = outerPadding;
        }
        if (innerPadding != null) {
          this._innerPadding = innerPadding;
        }
        return this;
      }
    }
  }
}
