///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export module Color {
    /**
     * Return relative luminance (defined here: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef)
     * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under BSD)
     * chroma.js may be found here: https://github.com/gka/chroma.js
     * License may be found here: https://github.com/gka/chroma.js/blob/master/LICENSE
     */
    function luminance(color: string) {
      var rgb = d3.rgb(color);

      var lum = (x: number) => {
        x = x / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };
      var r = lum(rgb.r);
      var g = lum(rgb.g);
      var b = lum(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Return contrast ratio between two colors
     * Based on implementation from chroma.js by Gregor Aisch (gka) (licensed under BSD)
     * chroma.js may be found here: https://github.com/gka/chroma.js
     * License may be found here: https://github.com/gka/chroma.js/blob/master/LICENSE
     * see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
     */
    export function contrast(a: string, b: string) {
      var l1 = luminance(a) + 0.05;
      var l2 = luminance(b) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     * Source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    export function rgbToHsl(r: number, g: number, b: number) {
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var h: number;
      var s: number;
      var l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [h, s, l];
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     * Source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    export function hslToRgb(h: number, s: number, l: number) {
      var r: number;
      var g: number;
      var b: number;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        function hue2rgb(p: number, q: number, t: number) {
          if(t < 0) { t += 1; }
          if(t > 1) { t -= 1; }
          if(t < 1/6) { return p + (q - p) * 6 * t; }
          if(t < 1/2) { return q; }
          if(t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
  }
}
}
