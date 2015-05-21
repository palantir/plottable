///<reference path="../reference.ts" />

module Plottable {
export module Scales {

  /**
   * This class implements a color scale that takes quantitive input and
   * interpolates between a list of color values. It returns a hex string
   * representing the interpolated color.
   *
   * By default it generates a linear scale internally.
   */
  export class InterpolatedColor extends Scale<number, string> {
    public static REDS = [
      "#FFFFFF", // white
      "#FFF6E1",
      "#FEF4C0",
      "#FED976",
      "#FEB24C",
      "#FD8D3C",
      "#FC4E2A",
      "#E31A1C",
      "#B10026" // red
    ];
    public static BLUES = [
      "#FFFFFF", // white
      "#CCFFFF",
      "#A5FFFD",
      "#85F7FB",
      "#6ED3EF",
      "#55A7E0",
      "#417FD0",
      "#2545D3",
      "#0B02E1" // blue
    ];
    public static POSNEG = [
      "#0B02E1", // blue
      "#2545D3",
      "#417FD0",
      "#55A7E0",
      "#6ED3EF",
      "#85F7FB",
      "#A5FFFD",
      "#CCFFFF",
      "#FFFFFF", // white
      "#FFF6E1",
      "#FEF4C0",
      "#FED976",
      "#FEB24C",
      "#FD8D3C",
      "#FC4E2A",
      "#E31A1C",
      "#B10026" // red
    ];
    private _colorRange: string[];
    private _colorScale: D3.Scale.QuantitativeScale<number>;
    private _d3Scale: D3.Scale.QuantitativeScale<number>;

    /**
     * An InterpolatedColorScale maps numbers to color strings.
     *
     * @param {string[]} colors an array of strings representing color values in hex
     *     ("#FFFFFF") or keywords ("white"). Defaults to InterpolatedColor.REDS
     * @param {string} scaleType a string representing the underlying scale
     *     type ("linear"/"log"/"sqrt"/"pow"). Defaults to "linear"
     * @returns {D3.Scale.QuantitativeScale} The converted QuantitativeScale d3 scale.
     */
    constructor(colorRange = InterpolatedColor.REDS, scaleType = "linear") {
      super();
      this._colorRange = colorRange;
      switch (scaleType) {
        case "linear":
          this._colorScale = d3.scale.linear();
          break;
        case "log":
          this._colorScale = d3.scale.log();
          break;
        case "sqrt":
          this._colorScale = d3.scale.sqrt();
          break;
        case "pow":
          this._colorScale = d3.scale.pow();
          break;
      }
      if (this._colorScale == null) {
        throw new Error("unknown QuantitativeScale scale type " + scaleType);
      }
      this._d3Scale = this._D3InterpolatedScale();
    }

    /**
     * Generates the converted QuantitativeScale.
     *
     * @returns {D3.Scale.QuantitativeScale} The converted d3 QuantitativeScale
     */
    private _D3InterpolatedScale(): D3.Scale.QuantitativeScale<number> {
      return this._colorScale.range([0, 1]).interpolate(this._interpolateColors());
    }

    /**
     * Generates the d3 interpolator for colors.
     *
     * @return {D3.Transition.Interpolate} The d3 interpolator for colors.
     */
    private _interpolateColors(): D3.Transition.Interpolate {
      var colors = this._colorRange;
      if (colors.length < 2) {
        throw new Error("Color scale arrays must have at least two elements.");
      };
      return (ignored: any) => {
        return (t: number) => {
          // Clamp t parameter to [0,1]
          t = Math.max(0, Math.min(1, t));

          // Determine indices for colors
          var tScaled = t * (colors.length - 1);
          var i0 = Math.floor(tScaled);
          var i1 = Math.ceil(tScaled);
          var frac = (tScaled - i0);

          // Interpolate in the L*a*b color space
          return d3.interpolateLab(colors[i0], colors[i1])(frac);
        };
      };
    }

    /**
     * Gets the color range.
     *
     * @returns {string[]} the current color values for the range as strings.
     */
    public colorRange(): string[];
    /**
     * Sets the color range.
     *
     * @param {string[]} [colorRange]. If provided and if colorRange is one of
     * (reds/blues/posneg), uses the built-in color groups. If colorRange is an
     * array of strings with at least 2 values (e.g. ["#FF00FF", "red",
     * "dodgerblue"], the resulting scale will interpolate between the color
     * values across the domain.
     * @returns {InterpolatedColor} The calling InterpolatedColor.
     */
    public colorRange(colorRange: string[]): InterpolatedColor;
    public colorRange(colorRange?: string[]): any {
      if (colorRange == null) {
        return this._colorRange;
      }
      this._colorRange = colorRange;
      this._resetScale();
      return this;
    }

    private _resetScale(): any {
      this._d3Scale = this._D3InterpolatedScale();
      this._autoDomainIfAutomaticMode();
      this._dispatchUpdate();
    }

    public autoDomain() {
      // InterpolatedColorScales do not pad
      var extents = this._getAllExtents();
      if (extents.length > 0) {
        this._setDomain([Utils.Methods.min(extents, (x) => x[0], 0), Utils.Methods.max(extents, (x) => x[1], 0)]);
      }
      return this;
    }

    public scale(value: number) {
      // HACKHACK D3 Quantitative Scales should return their interpolator return type
      return <string> <any> this._d3Scale(value);
    }

    protected _getDomain() {
      return this._d3Scale.domain();
    }

    protected _setBackingScaleDomain(values: number[]) {
      this._d3Scale.domain(values);
    }

    protected _getRange() {
      return this.colorRange();
    }

    protected _setRange(values: string[]) {
      this.colorRange(values);
    }
  }
}
}
