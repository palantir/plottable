///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Ordinal extends Abstract.Scale {
    public _d3Scale: D3.Scale.OrdinalScale;
    private _range = [0, 1];
    private _rangeType: string = "bands";

    // Padding as a proportion of the spacing between domain values
    private _innerPadding: number = 0.3;
    private _outerPadding: number = 0.5;

    /**
     * Creates a new OrdinalScale. Domain and Range are set later.
     *
     * @constructor
     */
    constructor(scale?: D3.Scale.OrdinalScale) {
      super(scale == null ? d3.scale.ordinal() : scale);
      if (this._innerPadding > this._outerPadding) {
        throw new Error("outerPadding must be >= innerPadding so cat axis bands work out reasonably");
      }
    }

    public _getExtent(): any[] {
      var extents: any[][] = this._getAllExtents();
      return Util.Methods.uniq(Util.Methods.flatten(extents));
    }

    /**
     * Gets the domain.
     *
     * @returns {any[]} The current domain.
     */
    public domain(): any[];
    /**
     * Sets the domain.
     *
     * @param {any[]} values The new values for the domain. This array may contain more than 2 values.
     * @returns {Ordinal} The calling Ordinal Scale.
     */
    public domain(values: any[]): Ordinal;
    public domain(values?: any[]): any {
      return super.domain(values);
    }

    public _setDomain(values: any[]) {
      super._setDomain(values);
      this.range(this.range()); // update range
    }

    /**
     * Gets the range of pixels spanned by the Ordinal Scale.
     *
     * @returns {number[]} The pixel range.
     */
    public range(): number[];
    /**
     * Sets the range of pixels spanned by the Ordinal Scale.
     *
     * @param {number[]} values The pixel range to to be spanend by the scale.
     * @returns {Ordinal} The calling Ordinal Scale.
     */
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

    public fullBandStartAndWidth(v: any) {
      var start = this.scale(v) - this.innerPadding() / 2;
      var width = this.rangeBand() + this.innerPadding();
      return [start, width];
    }

    /**
     * Gets the range type.
     *
     * @returns {string} The current range type.
     */
    public rangeType() : string;
    /**
     * Sets the range type.
     *
     * @param {string} rangeType Either "points" or "bands" indicating the
     *     d3 method used to generate range bounds.
     * @param {number} [outerPadding] The padding outside the range,
     *     proportional to the range step.
     * @param {number} [innerPadding] The padding between bands in the range,
     *     proportional to the range step. This parameter is only used in
     *     "bands" type ranges.
     * @returns {Ordinal} The calling Ordinal Scale.
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
        this.broadcaster.broadcast();
        return this;
      }
    }

    /**
     * Creates a copy of the Scale with the same domain and range but without any registered listeners.
     *
     * @returns {Ordinal} A copy of the calling Scale.
     */
    public copy(): Ordinal {
      return new Ordinal(this._d3Scale.copy());
    }
  }
}
}
