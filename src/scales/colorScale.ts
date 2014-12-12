///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Color extends AbstractScale<string, string> {

    private static HEX_SCALE_FACTOR = 20;
    private _lightenAmount: number;

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
          scale = d3.scale.ordinal().range(Color._getPlottableColors());
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
      this._lightenAmount = 0.16;
    }

    // Duplicated from OrdinalScale._getExtent - should be removed in #388
    protected _getExtent(): string[] {
      var extents = this._getAllExtents();
      var concatenatedExtents: string[] = [];
      extents.forEach((e) => {
        concatenatedExtents = concatenatedExtents.concat(e);
      });
      return _Util.Methods.uniq(concatenatedExtents);
    }

    private static _getPlottableColors(): string[] {
      var plottableDefaultColors: string[] = [];
      var colorTester = d3.select("body").append("div");
      var i = 0;
      var colorHex: string;
      while ((colorHex = _Util.Methods.colorTest(colorTester, "plottable-colors-" + i)) !== null) {
        plottableDefaultColors.push(colorHex);
        i++;
      }
      colorTester.remove();
      return plottableDefaultColors;
    }

    // Modifying the original scale method so that colors that are looped are lightened according
    // to how many times they are looped.
    public scale(value: string): string {
      var color = super.scale(value);
      var index = this.domain().indexOf(value);
      var modifyFactor = Math.floor(index / this.range().length);
      return _Util.Methods.lightenColor(color, modifyFactor, this._lightenAmount);
    }
  }
}
}
