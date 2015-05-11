///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  type ColorGroups = { [key: string]: string[]; };

  /**
   * This class implements a color scale that takes quantitive input and
   * interpolates between a list of color values. It returns a hex string
   * representing the interpolated color.
   *
   * By default it generates a linear scale internally.
   */
  export class InterpolatedColor extends Scale<number, string> {
    private static _COLOR_SCALES: ColorGroups = {
      reds: [
        "#FFFFFF", // white
        "#FFF6E1",
        "#FEF4C0",
        "#FED976",
        "#FEB24C",
        "#FD8D3C",
        "#FC4E2A",
        "#E31A1C",
        "#B10026"  // red
      ],
      blues: [
        "#FFFFFF", // white
        "#CCFFFF",
        "#A5FFFD",
        "#85F7FB",
        "#6ED3EF",
        "#55A7E0",
        "#417FD0",
        "#2545D3",
        "#0B02E1"  // blue
      ],
      posneg: [
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
        "#B10026"  // red
      ]
    };

    private _colorRange: string[];
    private _colorScale: D3.Scale.QuantitativeScale;

    /**
     * Constructs an InterpolatedColorScale.
     *
     * An InterpolatedColorScale maps numbers evenly to color strings.
     *
     * @constructor
     * @param {string|string[]} colorRange the type of color scale to
     *     create. Default is "reds". @see {@link colorRange} for further
     *     options.
     * @param {string} scaleType the type of underlying scale to use
     *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
     *     for further options.
     */
    constructor(colorRange: string | string[] = "reds", colorScale: D3.Scale.QuantitativeScale = d3.scale.linear()) {
      this._colorRange = this._resolveColorValues(colorRange);
      this._colorScale = colorScale;
      super(this._getD3InterpolatedScale());
    }

    /**
     * Generates the converted QuantitativeScale.
     * 
     * @returns {D3.Scale.QuantitativeScale} The converted d3 QuantitativeScale
     */
    private _getD3InterpolatedScale(): D3.Scale.QuantitativeScale {
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
      return (ignored: any): any => {
        return (t: any): any => {
          // Clamp t parameter to [0,1]
          t = Math.max(0, Math.min(1, t));

          // Determine indices for colors
          var tScaled = t * (colors.length - 1);
          var i0      = Math.floor(tScaled);
          var i1      = Math.ceil(tScaled);
          var frac    = (tScaled - i0);

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
     * @param {string|string[]} [colorRange]. If provided and if colorRange is one of
     * (reds/blues/posneg), uses the built-in color groups. If colorRange is an
     * array of strings with at least 2 values (e.g. ["#FF00FF", "red",
     * "dodgerblue"], the resulting scale will interpolate between the color
     * values across the domain.
     * @returns {InterpolatedColor} The calling InterpolatedColor.
     */
    public colorRange(colorRange: string | string[]): InterpolatedColor;
    public colorRange(colorRange?: string | string[]): any {
      if (colorRange == null) {
        return this._colorRange;
      }
      this._colorRange = this._resolveColorValues(colorRange);
      this._resetScale();
      return this;
    }

    private _resetScale(): any {
      this._d3Scale = this._getD3InterpolatedScale();
      this._autoDomainIfAutomaticMode();
      this._dispatchUpdate();
    }

    private _resolveColorValues(colorRange: string | string[]): string[] {
      if (typeof(colorRange) === "object") {
        return <string[]> colorRange;
      } else if (InterpolatedColor._COLOR_SCALES[<string> colorRange] != null) {
        return InterpolatedColor._COLOR_SCALES[<string> colorRange];
      } else {
        return InterpolatedColor._COLOR_SCALES["reds"];
      }
    }

    public autoDomain() {
      // unlike other QuantitativeScaleScales, interpolatedColorScale ignores its domainer
      var extents = this._getAllExtents();
      if (extents.length > 0) {
        this._setDomain([Utils.Methods.min(extents, (x) => x[0], 0), Utils.Methods.max(extents, (x) => x[1], 0)]);
      }
      return this;
    }
  }
}
}
