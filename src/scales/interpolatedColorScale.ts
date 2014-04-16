///<reference path="../reference.ts" />

module Plottable {
  export class InterpolatedColorScale extends LinearScale {
    private static COLOR_SCALES = {
      reds : [
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
      blues : [
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
      posneg : [
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

    /**
     * Converts the string array into a linear d3 scale.
     *
     * d3 doesn't accept more than 2 range values unless we use a ordinal
     * scale. So, in order to interpolate smoothly between the full color
     * range, we must override the interpolator and compute the color values
     * manually.
     *
     * @param {string[]} [colors] an array of strings representing color
     *     values in hex ("#FFFFFF") or keywords ("white").
     * @returns a linear d3 scale.
     */
    private static INTERPOLATE_COLORS(colors:string[]): D3.Scale.LinearScale {
      if (colors.length < 2) throw new Error("Color scale arrays must have at least two elements.");
      return d3.scale.linear()
        .range([0, 1])
        .interpolate((ignored:any): any => {
          return (t: any): any => {
            // Clamp t parameter to [0,1]
            t = Math.max(0, Math.min(1, t));

            // Determine indices for colors
            var tScaled = t*(colors.length - 1);
            var i0      = Math.floor(tScaled);
            var i1      = Math.ceil(tScaled);
            var frac    = (tScaled - i0);

            // Interpolate in the L*a*b color space
            return d3.interpolateLab(colors[i0], colors[i1])(frac);
          };
        });
    }

    /**
     * Creates a InterpolatedColorScale.
     *
     * @constructor
     * @param {string|string[]} [scaleType] the type of color scale to create
     *     (reds/blues/posneg). Default is "reds". An array of color values
     *     with at least 2 values may also be passed (e.g. ["#FF00FF", "red",
     *     "dodgerblue"], in which case the resulting scale will interpolate
     *     linearly between the color values across the domain.
     */
    constructor(scaleType?: any) {
      var scale: D3.Scale.LinearScale;
      if (scaleType instanceof Array){
        scale = InterpolatedColorScale.INTERPOLATE_COLORS(scaleType);
      } else {
        switch (scaleType) {
          case "blues":
            scale = InterpolatedColorScale.INTERPOLATE_COLORS(InterpolatedColorScale.COLOR_SCALES["blues"]);
            break;
          case "posneg":
            scale = InterpolatedColorScale.INTERPOLATE_COLORS(InterpolatedColorScale.COLOR_SCALES["posneg"]);
            break;
          case "reds":
          default:
            scale = InterpolatedColorScale.INTERPOLATE_COLORS(InterpolatedColorScale.COLOR_SCALES["reds"]);
            break;
        }
      }
      super(scale);
    }
  }
}
