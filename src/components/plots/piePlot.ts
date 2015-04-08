///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
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
  export class Pie extends AbstractPlot {

    private _colorScale: Scale.Color;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scale.Color();
      this.classed("pie-plot", true);
    }

    public _computeLayout(offeredXOrigin?: number, offeredYOrigin?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(keyOrDataset, dataset);
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

    protected _getDrawer(key: string): _Drawer.AbstractDrawer {
      return new Plottable._Drawer.Arc(key).setClass("arc");
    }

    public getAllPlotData(datasetKeys?: string | string[]): PlotData {
      var allPlotData = super.getAllPlotData(datasetKeys);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }

    protected _getPlotData(xExtent: Extent, yExtent: Extent, datasetKeys: string[]): PlotData {
      var queryPoint = {x: (xExtent.min + xExtent.max) / 2 - this.width() / 2,
                        y: (yExtent.min + yExtent.max) / 2 - this.height() / 2};
      var radiusDistance = Math.sqrt(Math.pow(queryPoint.x, 2) + Math.pow(queryPoint.y, 2));
      var pixelAngle = Math.atan2(queryPoint.x, -queryPoint.y);
      if (pixelAngle < 0) {
        pixelAngle += Math.PI * 2;
      }
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var selections: EventTarget[] = [];
      datasetKeys.forEach((datasetKey) => {
        var plotData = this.getAllPlotData(datasetKey);
        var projectors = this.generateProjectors(datasetKey);
        plotData.data.forEach((datum, index) => {
          var piePlotSelection = d3.select(plotData.selection[0][index]);
          var innerRadius = projectors["inner-radius"](datum, index);
          var outerRadius = projectors["outer-radius"](datum, index);
          if (radiusDistance < innerRadius || radiusDistance > outerRadius) {
            return;
          }

          var startAngle = +piePlotSelection.datum()["startAngle"];
          var endAngle = +piePlotSelection.datum()["endAngle"];
          if (pixelAngle < startAngle || pixelAngle > endAngle) {
            return;
          }

          data.push(datum);
          pixelPoints.push(plotData.pixelPoints[index]);
          selections.push(plotData.selection[0][index]);
        });
      });

      return {data: data,
              pixelPoints: pixelPoints,
              selection: d3.selectAll(selections)};
    }
  }
}
}
