///<reference path="../reference.ts" />

module Plottable {
  export class OrdinalScale extends Scale {
    public _d3Scale: D3.Scale.OrdinalScale;
    // Padding as a proportion of the spacing between domain values
    private INNER_PADDING = 0.3;
    private OUTER_PADDING = 0.5;
    private _range = [0, 1];
    private _rangeType: string = "points";

    /**
     * Creates a new OrdinalScale. Domain and Range are set later.
     *
     * @constructor
     */
    constructor() {
      super(d3.scale.ordinal());
    }

    public domain(): any[];
    public domain(values: any[]): OrdinalScale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        super.domain(values);
        this.range(this.range()); // update range
        return this;
      }
    }

    public domainUnits(): number {
      return this._d3Scale.domain().length;
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
        if (this._rangeType === "points"){
          this._d3Scale.rangePoints(values, 2*this.OUTER_PADDING); // d3 scale takes total padding
        } else if (this._rangeType === "bands") {
          this._d3Scale.rangeBands(values, this.INNER_PADDING, this.OUTER_PADDING);
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
      if (this._rangeType === "bands") {
        return this._d3Scale.rangeBand();
      } else {
        return 0;
      }
    }

    /**
     * Returns the range type, or sets the range type.
     *
     * @param {string} [rangeType] Either "points" or "bands" indicating the d3 method used to generate range bounds.
     * @returns {string|OrdinalScale} The current range type, or the calling OrdinalScale.
     */
    public rangeType() : string;
    public rangeType(rangeType: string) : OrdinalScale;
    public rangeType(rangeType?: string) : any {
      if (rangeType == null){
        return this._rangeType;
      } else {
        if(!(rangeType === "points" || rangeType === "bands")){
          throw new Error("Unsupported range type: " + rangeType);
        }
        this._rangeType = rangeType;
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
