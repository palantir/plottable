///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   *
   * Primary projection attributes:
   *   "fill" - Accessor determining the color of each sector
   *   "inner-radius" - Accessor determining the distance from the center to the inner edge of the sector
   *   "outer-radius" - Accessor determining the distance from the center to the outer edge of the sector
   *   "value" - Accessor to extract the value determining the proportion of each slice to the total
   */
  export class Pie extends Plot {

    private _colorScale: Scales.Color;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scales.Color();
      this.classed("pie-plot", true);
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      return this;
    }

    public addDataset(dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(dataset);
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["inner-radius"] = attrToProjector["inner-radius"] || d3.functor(0);
      attrToProjector["outer-radius"] = attrToProjector["outer-radius"] || d3.functor(Math.min(this.width(), this.height()) / 2);

      var defaultFillFunction = (d: any, i: number) => this._colorScale.scale(String(i));
      attrToProjector["fill"] = attrToProjector["fill"] || defaultFillFunction;

      return attrToProjector;
    }

    protected _getDrawer(): Drawers.AbstractDrawer {
      return new Plottable.Drawers.Arc().setClass("arc");
    }

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var allPlotData = super.getAllPlotData(datasets);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }
  }
}
}
