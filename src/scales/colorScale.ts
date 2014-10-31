///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Color extends AbstractScale<string, string> {
    /**
     * Constructs a ColorScale.
     *
     * @constructor
     * @param {string} [scaleType] the type of color scale to create
     *     (Category10/Category20/Category20b/Category20c).
     * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
     */
    constructor(scaleType?: string) {
      var scale: D3.Scale.OrdinalScale;
      switch (scaleType) {
        case null:
        case undefined:
          scale = d3.scale.ordinal().range(Color.getPlottableColors());
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
      super(scale);
    }

    // Duplicated from OrdinalScale._getExtent - should be removed in #388
    public _getExtent(): string[] {
      var extents = this._getAllExtents();
      var concatenatedExtents: string[] = [];
      extents.forEach((e) => {
        concatenatedExtents = concatenatedExtents.concat(e);
      });
      return _Util.Methods.uniq(concatenatedExtents);
    }

    private static getPlottableColors(): string[] {
      var plottableDefaultColors: string[] = [];
      var defaultNumColors = 10;
      for (var i = 0; i < defaultNumColors; i++) {
        var colorTester = d3.select("body").append("div").classed("plottable-colors-" + i, true);
        var rgbString = colorTester.style("color");
        var rgb = rgbString.split("(")[1].split(")")[0].split(",");
        rgb = rgb.map((colorNumber: string) => Scale.Color.toDoubleDigitHex(+colorNumber));
        plottableDefaultColors.push("#" + rgb.join(""));
        colorTester.remove();
      }
      return plottableDefaultColors;
    }

    private static toDoubleDigitHex(value: number): string {
      var baseValue = Scale.Color.toHexDigit(value % 16);
      var remainingValue = Scale.Color.toHexDigit(Math.floor(value / 16));
      return remainingValue + baseValue;
    }

    private static toHexDigit(value: number): string {
      switch (value) {
        case 10:
          return "a";
        case 11:
          return "b";
        case 12:
          return "c";
        case 13:
          return "d";
        case 14:
          return "e";
        case 15:
          return "f";
        default:
          return String(value);
      }
    }
  }
}
}
