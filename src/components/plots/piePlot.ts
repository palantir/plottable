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

    private colorScale: Scales.Color;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this.colorScale = new Scales.Color();
      this.classed("pie-plot", true);
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      if (this.datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(keyOrDataset, dataset);
      return this;
    }

    public computeLayout(offeredXOrigin?: number, offeredYOrigin?: number, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
      this.renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
    }

    public getAllPlotData(datasetKeys?: string | string[]): PlotData {
      var allPlotData = super.getAllPlotData(datasetKeys);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }

    protected generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = super.generateAttrToProjector();
      attrToProjector["inner-radius"] = attrToProjector["inner-radius"] || d3.functor(0);
      attrToProjector["outer-radius"] = attrToProjector["outer-radius"] || d3.functor(Math.min(this.width(), this.height()) / 2);

      var defaultFillFunction = (d: any, i: number) => this.colorScale.scale(String(i));
      attrToProjector["fill"] = attrToProjector["fill"] || defaultFillFunction;

      return attrToProjector;
    }

    protected getDrawer(key: string): Drawers.AbstractDrawer {
      return new Plottable.Drawers.Arc(key).setClass("arc");
    }
  }
}
}
