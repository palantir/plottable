///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Ordinal extends AbstractScale<string, number> {
    protected _d3Scale: D3.Scale.OrdinalScale;
    private _range = [0, 1];
    private _rangeType: string = "bands";

    // Padding as a proportion of the spacing between domain values
    private _innerPadding: number = 0.3;
    private _outerPadding: number = 0.5;
    public _typeCoercer: (d: any) => any = (d: any) => d != null && d.toString ? d.toString() : d;

    /**
     * Creates an OrdinalScale.
     *
     * An OrdinalScale maps strings to numbers. A common use is to map the
     * labels of a bar plot (strings) to their pixel locations (numbers).
     *
     * @constructor
     */
    constructor(scale?: D3.Scale.OrdinalScale) {
      super(scale == null ? d3.scale.ordinal() : scale);
      if (this._innerPadding > this._outerPadding) {
        throw new Error("outerPadding must be >= innerPadding so cat axis bands work out reasonably");
      }
    }

    protected _getExtent(): string[] {
      var extents: string[][] = this._getAllExtents();
      return _Util.Methods.uniq(_Util.Methods.flatten(extents));
    }

    public domain(): string[];
    public domain(values: string[]): Ordinal;
    public domain(values?: string[]): any {
      return super.domain(values);
    }

    protected _setDomain(values: string[]) {
      super._setDomain(values);
      this.range(this.range()); // update range
    }

    public range(): number[];
    public range(values: number[]): Ordinal;
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

    public innerPadding(): number {
      var d = this.domain();
      if (d.length < 2) {
        return 0;
      }
      var step = Math.abs(this.scale(d[1]) - this.scale(d[0]));
      return step - this.rangeBand();
    }

    public fullBandStartAndWidth(v: string) {
      var start = this.scale(v) - this.innerPadding() / 2;
      var width = this.rangeBand() + this.innerPadding();
      return [start, width];
    }

    /**
     * Get the range type.
     *
     * @returns {string} The current range type.
     */
    public rangeType() : string;
    /**
     * Set the range type.
     *
     * @param {string} rangeType If provided, either "points" or "bands" indicating the
     *     d3 method used to generate range bounds.
     * @param {number} [outerPadding] If provided, the padding outside the range,
     *     proportional to the range step.
     * @param {number} [innerPadding] If provided, the padding between bands in the range,
     *     proportional to the range step. This parameter is only used in
     *     "bands" type ranges.
     * @returns {Ordinal} The calling Ordinal.
     */
    public rangeType(rangeType: string, outerPadding?: number, innerPadding?: number) : Ordinal;
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
        this.range(this.range());
        this.broadcaster.broadcast();
        return this;
      }
    }

    public copy(): Ordinal {
      return new Ordinal(this._d3Scale.copy());
    }
  }
}
}
