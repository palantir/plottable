///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Ordinal extends AbstractScale<string, number> {
    protected _d3Scale: D3.Scale.OrdinalScale;
    private _range = [0, 1];

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
        this._d3Scale.rangeBands(values, this._innerPadding, this._outerPadding);
        return this;
      }
    }

    /**
     * Returns the width of the range band.
     *
     * @returns {number} The range band width
     */
    public rangeBand() : number {
      return this._d3Scale.rangeBand();
    }

    /**
     * Returns the inner padding of the scale.
     *
     * TODO: Come up with a proper explanation of innerPadding
     *
     * @returns {number} The inner padding of the scale
     */
    public innerPadding(): number;
    /**
     * Sets the inner padding of the scale.
     *
     * TODO:
     *
     * @returns {Ordinal} The calling Scale.Ordinal
     */
    public innerPadding(innerPadding: number): Ordinal;
    public innerPadding(innerPadding?: number): any {
      if (innerPadding == null) {
        var d = this.domain();
        if (d.length < 2) {
          return 0;
        }
        var step = Math.abs(this.scale(d[1]) - this.scale(d[0]));
        return step - this.rangeBand();
      }
      this._innerPadding = innerPadding;
      this.range(this.range());
      this.broadcaster.broadcast();
      return this;
    }

    /**
     * Returns the outer padding of the scale.
     *
     * TODO: Come up with a proper explanation of outerPadding
     *
     * @returns {number} The outer padding of the scale
     */
    public outerPadding(): number;
    /**
     * Sets the outer padding of the scale.
     *
     * TODO:
     *
     * @returns {Ordinal} The calling Scale.Ordinal
     */
    public outerPadding(outerPadding: number): Ordinal;
    public outerPadding(outerPadding?: number): any {
      if (outerPadding == null) {
        return this._outerPadding;
      }
      this._outerPadding = outerPadding;
      this.range(this.range());
      this.broadcaster.broadcast();
      return this;
    }

    public copy(): Ordinal {
      return new Ordinal(this._d3Scale.copy());
    }

    public scale(value: string): number {
      //scale it to the middle
      return super.scale(value) + this.rangeBand() / 2;
    }
  }
}
}
