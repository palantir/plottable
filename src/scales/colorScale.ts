///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Color extends Scale<string, string> {

    private static LOOP_LIGHTEN_FACTOR = 1.6;
    // The maximum number of colors we are getting from CSS stylesheets
    private static MAXIMUM_COLORS_FROM_CSS = 256;

    private _d3Scale: D3.Scale.OrdinalScale;

    /**
     * Constructs a ColorScale.
     *
     * @constructor
     * @param {string} [scaleType] the type of color scale to create
     *     (Category10/Category20/Category20b/Category20c).
     * See https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
     */
    constructor(scaleType?: string) {
      super();
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
      this._d3Scale = scale;
    }

    public getExtendFromData(data: string[]): string[] {
      return Utils.Methods.uniq(data);
    }

    // Duplicated from OrdinalScale._getExtent - should be removed in #388
    protected _getExtent(): string[] {
      var extents = this._getAllExtents();
      var concatenatedExtents: string[] = [];
      extents.forEach((e) => {
        concatenatedExtents = concatenatedExtents.concat(e);
      });
      return Utils.Methods.uniq(concatenatedExtents);
    }

    private static _getPlottableColors(): string[] {
      var plottableDefaultColors: string[] = [];
      var colorTester = d3.select("body").append("plottable-color-tester");

      var defaultColorHex: string = Utils.Methods.colorTest(colorTester, "");
      var i = 0;
      var colorHex: string;
      while ((colorHex = Utils.Methods.colorTest(colorTester, "plottable-colors-" + i)) !== null &&
              i < this.MAXIMUM_COLORS_FROM_CSS) {
        if (colorHex === defaultColorHex && colorHex === plottableDefaultColors[plottableDefaultColors.length - 1]) {
          break;
        }
        plottableDefaultColors.push(colorHex);
        i++;
      }
      colorTester.remove();
      return plottableDefaultColors;
    }

    // Modifying the original scale method so that colors that are looped are lightened according
    // to how many times they are looped.
    public scale(value: string): string {
      var color = this._d3Scale(value);
      var index = this.domain().indexOf(value);
      var numLooped = Math.floor(index / this.range().length);
      var modifyFactor = Math.log(numLooped * Color.LOOP_LIGHTEN_FACTOR + 1);
      return Utils.Methods.lightenColor(color, modifyFactor);
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
