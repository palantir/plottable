///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export module Color {
    /**
     * Return relative luminance (defined here: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef)
     * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under modified MIT)
     * chroma.js may be found here: https://github.com/gka/chroma.js
     */
    function luminance(color: string) {
      var rgb = d3.rgb(color);

      var luminance_x = (x: number) => {
        x = x / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      }
      var r = luminance_x(rgb.r);
      var g = luminance_x(rgb.g);
      var b = luminance_x(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Return contrast ratio between two colors
     * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under modified MIT)
     * chroma.js may be found here: https://github.com/gka/chroma.js
     * see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     */
    export function contrast(a: string, b: string) {
      var l1 = luminance(a) + 0.05;
      var l2 = luminance(b) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }
  }
}
}
