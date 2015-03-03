///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Rectangle extends AbstractXYPlot<any, any> {
    private _colorScale: Scale.AbstractScale<any, string>;

    /**
     * Constructs a RectanglePlot.
     *
     * A RectanglePlot consists of a bunch of rectangles. The user is required to
     * project the top left corner of each rectangle (x1, y1) and the bottom right
     * corner of each rectangle (x2, y2)
     *
     * @constructor
     * @param {Scale.Ordinal} xScale The x scale to use.
     * @param {Scale.Ordinal} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<any, any>, yScale: Scale.AbstractScale<any, any>,
        colorScale: Scale.AbstractScale<any, string>) {
      super(xScale, yScale);

      // Category scales should not have padding by default
      if (xScale instanceof Scale.Ordinal) {
        (<Scale.Ordinal> xScale).innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scale.Ordinal) {
        (<Scale.Ordinal> yScale).innerPadding(0).outerPadding(0);
      }

      this._colorScale = colorScale;
      this.classed("rectangle-plot", true);
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      super.addDataset(keyOrDataset, dataset);
      return this;
    }

    protected _getDrawer(key: string) {
      return new _Drawer.Rect(key, true);
    }

    /**
     * @param {string} attrToSet One of ["x", "y", "fill"]. If "fill" is used,
     * the data should return a valid CSS color.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "fill") {
        this._colorScale = this._projections["fill"].scale;
      }
      return this;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors
      var x1Attr = attrToProjector["x"];
      var y1Attr = attrToProjector["y"];
      var x2Attr = attrToProjector["x2"];
      var y2Attr = attrToProjector["y2"];

      // Infer width
      attrToProjector["width"] = (d, i, u, m) => {
        return Math.abs(x2Attr(d, i, u, m) - x1Attr(d, i, u, m));
      };

      // Infer height, with an exception for ordinal scales
      if (y2Attr === undefined) {
        attrToProjector["height"] = () => (<Scale.Ordinal> this._yScale).rangeBand();
      } else {
        attrToProjector["height"] = (d, i, u, m) => {
          return Math.abs(y2Attr(d, i, u, m) - y1Attr(d, i, u, m));
        };
      }

      // Adjust y to respect the height, with an exception for ordinal scales
      attrToProjector["y"] = (d, i, u, m) => {
        var offset = attrToProjector["height"](d, i, u, m);
        if (y2Attr === undefined) {
          offset = offset / 2;
        }
        return y1Attr(d, i, u, m) - offset;
      };

      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }
  }
}
}
