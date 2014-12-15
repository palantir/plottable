///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Grid extends AbstractXYPlot<string,string> {
    private _colorScale: Scale.AbstractScale<any, string>;

    /**
     * Constructs a GridPlot.
     *
     * A GridPlot is used to shade a grid of data. Each datum is a cell on the
     * grid, and the datum can control what color it is.
     *
     * @constructor
     * @param {Scale.Ordinal} xScale The x scale to use.
     * @param {Scale.Ordinal} yScale The y scale to use.
     * @param {Scale.Color|Scale.InterpolatedColor} colorScale The color scale
     * to use for each grid cell.
     */
    constructor(xScale: Scale.Ordinal, yScale: Scale.Ordinal, colorScale: Scale.AbstractScale<any, string>) {
      super(xScale, yScale);
      this.classed("grid-plot", true);

      // The x and y scales should render in bands with no padding
      (<Scale.Ordinal> this._xScale).rangeType("bands", 0, 0);
      (<Scale.Ordinal> this._yScale).rangeType("bands", 0, 0);

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
      return new _Drawer.Element(key).svgElement("rect");
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
      var xStep = (<Scale.Ordinal> this._xScale).rangeBand();
      var yStep = (<Scale.Ordinal> this._yScale).rangeBand();
      attrToProjector["width"]  = () => xStep;
      attrToProjector["height"] = () => yStep;
      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("cells")}];
    }
  }
}
}
