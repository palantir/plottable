///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Color extends Abstract.Scale<any, string> {
    /**
     * Creates a ColorScale.
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
          scale = d3.scale.ordinal().range(Core.Colors.PLOTTABLE_COLORS);
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

    public _getExtent(): any[] {
      return Scale.Ordinal.prototype._getExtent.apply(this);
    }
  }
}
}
