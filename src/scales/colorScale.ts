///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Color extends Scale<string, string> {

    private static _LOOP_LIGHTEN_FACTOR = 1.6;
    // The maximum number of colors we are getting from CSS stylesheets
    private static _MAXIMUM_COLORS_FROM_CSS = 256;

    private _d3Scale: d3.scale.Ordinal<string, string>;

    /**
     * A Color Scale maps string values to color hex values expressed as a string.
     *
     * @constructor
     * @param {string} [scaleType] One of "Category10"/"Category20"/"Category20b"/"Category20c".
     *   (see https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors)
     *   If not supplied, reads the colors defined using CSS -- see plottable.css.
     */
    constructor(scaleType?: string) {
      super();
      var scale: d3.scale.Ordinal<string, string>;
      switch (scaleType) {
        case null:
        case undefined:
          scale = d3.scale.ordinal<string, string>().range(Color._getPlottableColors());
          break;
        case "Category10":
        case "category10":
        case "10":
          scale = d3.scale.category10();
          break;
        case "Category20":
        case "category20":
        case "20":
          scale = d3.scale.category20();
          break;
        case "Category20b":
        case "category20b":
        case "20b":
          scale = d3.scale.category20b();
          break;
        case "Category20c":
        case "category20c":
        case "20c":
          scale = d3.scale.category20c();
          break;
        default:
          throw new Error("Unsupported ColorScale type");
      }
      this._d3Scale = scale;
    }

    public extentOfValues(values: string[]) {
      return Utils.Array.uniq(values);
    }

    // Duplicated from OrdinalScale._getExtent - should be removed in #388
    protected _getExtent(): string[] {
      return Utils.Array.uniq(this._getAllIncludedValues());
    }

    private static _getPlottableColors(): string[] {
      var plottableDefaultColors: string[] = [];
      var colorTester = d3.select("body").append("plottable-color-tester");

      var defaultColorHex: string = Color._colorTest(colorTester, "");
      var i = 0;
      var colorHex: string;
      while ((colorHex = Color._colorTest(colorTester, "plottable-colors-" + i)) !== null &&
              i < this._MAXIMUM_COLORS_FROM_CSS) {
        if (colorHex === defaultColorHex && colorHex === plottableDefaultColors[plottableDefaultColors.length - 1]) {
          break;
        }
        plottableDefaultColors.push(colorHex);
        i++;
      }
      colorTester.remove();
      return plottableDefaultColors;
    }

    /**
     * Gets the Hex Code of the color resulting by applying the className CSS class to the
     * colorTester selection. Returns null if the tester is transparent.
     *
     * @param {d3.Selection<void>} colorTester The d3 selection to apply the CSS class to
     * @param {string} className The name of the class to be applied
     * @return {string} The hex code of the computed color
     */
    private static _colorTest(colorTester: d3.Selection<void>, className: string) {
      colorTester.classed(className, true);
      // Use regex to get the text inside the rgb parentheses
      var colorStyle = colorTester.style("background-color");
      if (colorStyle === "transparent") {
        return null;
      }
      var rgb = /\((.+)\)/.exec(colorStyle)[1]
                          .split(",")
                          .map((colorValue: string) => {
                            var colorNumber = +colorValue;
                            var hexValue = colorNumber.toString(16);
                            return colorNumber < 16 ? "0" + hexValue : hexValue;
                          });
      if (rgb.length === 4 && rgb[3] === "00") {
        return null;
      }
      var hexCode = "#" + rgb.join("");
      colorTester.classed(className, false);
      return hexCode;
    }


    /**
     * Returns the color-string corresponding to a given string.
     * If there are not enough colors in the range(), a lightened version of an existing color will be used.
     *
     * @param {string} value
     * @returns {string}
     */
    public scale(value: string): string {
      var color = this._d3Scale(value);
      var index = this.domain().indexOf(value);
      var numLooped = Math.floor(index / this.range().length);
      var modifyFactor = Math.log(numLooped * Color._LOOP_LIGHTEN_FACTOR + 1);
      return Utils.Color.lightenColor(color, modifyFactor);
    }

    protected _getDomain() {
      return this._d3Scale.domain();
    }

    protected _setBackingScaleDomain(values: string[]) {
      this._d3Scale.domain(values);
    }

    protected _getRange() {
      return this._d3Scale.range();
    }

    protected _setRange(values: string[]) {
      this._d3Scale.range(values);
    }
  }
}
}
