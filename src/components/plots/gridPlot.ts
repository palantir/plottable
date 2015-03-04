///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Grid extends Rectangle<any, any> {
    private _colorScale: Scale.AbstractScale<any, string>;

    /**
     * Constructs a GridPlot.
     *
     * A GridPlot is used to shade a grid of data. Each datum is a cell on the
     * grid, and the datum can control what color it is.
     *
     * @constructor
     * @param {Scale.AbstractScale} xScale The x scale to use.
     * @param {Scale.AbstractScale} yScale The y scale to use.
     * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
     * to use for each grid cell.
     */
    constructor(xScale: Scale.AbstractScale<any, any>, yScale: Scale.AbstractScale<any, any>,
      colorScale: Scale.AbstractScale<any, string>) {
      super(xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scale.Category) {
        xScale.innerPadding(0).outerPadding(0);
      }
      if (yScale instanceof Scale.Category) {
        yScale.innerPadding(0).outerPadding(0);
      }

      this._colorScale = colorScale;
      this.animator("cells", new Animator.Null());
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in Grid plots");
        return this;
      }
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

      // Adjust the xScale if it is ordinal
      if (this._xScale instanceof Scale.Category) {
        attrToProjector["width"] = () => (<Scale.Category> this._xScale).rangeBand();
        attrToProjector["x"] = (d, i, u, m) => x1Attr(d, i, u, m) - attrToProjector["width"](d, i, u, m) / 2;
      } else {
        attrToProjector["width"] = (d, i, u, m) => Math.abs(x2Attr(d, i, u, m) - x1Attr(d, i, u, m));
      }

      // Adjust the yScale if it is ordinal
      if (this._yScale instanceof Scale.Category) {
        attrToProjector["height"] = () => (<Scale.Category> this._yScale).rangeBand();
        attrToProjector["y"] = (d, i, u, m) => y1Attr(d, i, u, m) - attrToProjector["height"](d, i, u, m) / 2;
      } else {
        attrToProjector["height"] = (d, i, u, m) => Math.abs(y2Attr(d, i, u, m) - y1Attr(d, i, u, m));
        attrToProjector["y"] = (d, i, u, m) => y1Attr(d, i, u, m) - attrToProjector["height"](d, i, u, m);
      }

      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }
  }
}
}
