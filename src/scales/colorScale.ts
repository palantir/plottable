///<reference path="../reference.ts" />

module Plottable {
  export class ColorScale extends Scale {
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

    private static TO_SCALE(colors:string[]): D3.Scale.Scale {
      return d3.scale.linear()
        .range([0, 1])
        .interpolate((ignored:any): any => {
          return (t: any): any => {
            var tScaled = t*(colors.length - 1);
            var i0      = Math.floor(tScaled);
            var i1      = Math.ceil(tScaled);
            var frac    = (tScaled - i0);
            var interpolated = d3.interpolateLab(colors[i0], colors[i1])(frac);
            return interpolated;
          };
        });
    }

    /**
     * Creates a ColorScale.
     *
     * @constructor
     * @param {string} [scaleType] the type of color scale to create
     *     (Category10/Category20/Category20b/Category20c,reds,blues,posneg).
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
        case "reds":
          scale = ColorScale.TO_SCALE(ColorScale.COLOR_SCALES["reds"]);
          break;
        case "blues":
          scale = ColorScale.TO_SCALE(ColorScale.COLOR_SCALES["blues"]);
          break;
        case "posneg":
          scale = ColorScale.TO_SCALE(ColorScale.COLOR_SCALES["posneg"]);
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

    public domain(values?: any[]): any {
      if (values != null) values = d3.extent(values);
      return super.domain(values); // need to override type sig to enable method chaining :/
    }
  }
}
