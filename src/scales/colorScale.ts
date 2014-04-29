///<reference path="../reference.ts" />

module Plottable {
  export class ColorScale extends Scale {

    /**
     * Creates a ColorScale.
     *
     * @constructor
     * @param {string} [scaleType] the type of color scale to create
     *     (Category10/Category20/Category20b/Category20c).
     */
    constructor(scaleType?: string) {
      var scale: D3.Scale.Scale;
      switch (scaleType) {
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
        case null:
        case undefined:
          scale = d3.scale.ordinal();
          break;
        default:
          throw new Error("Unsupported ColorScale type");
      }
      super(scale);
    }
  }
}
