///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Line<X> extends XYPlot<X, number> {
    private _defaultStrokeColor: string;

    /**
     * Constructs a LinePlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("line-plot", true);
      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                         .duration(600)
                                         .easing("exp-in-out"));

      this._defaultStrokeColor = new Scales.Color().range()[0];
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Line(key);
    }

    protected _getResetYFunction() {
      // gets the y-value generator for the animation start point
      var yDomain = this.y().scale.domain();
      var domainMax = Math.max(yDomain[0], yDomain[1]);
      var domainMin = Math.min(yDomain[0], yDomain[1]);
      // start from zero, or the closest domain value to zero
      // avoids lines zooming on from offscreen.
      var startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
      var scaledStartValue = this.y().scale.scale(startValue);
      return (d: any, i: number, dataset: Dataset, m: PlotMetadata) => scaledStartValue;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var attrToProjector = this._generateAttrToProjector();
        attrToProjector["y"] = this._getResetYFunction();
        drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator("reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("main")});

      return drawSteps;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var wholeDatumAttributes = this._wholeDatumAttributes();
      var isSingleDatumAttr = (attr: string) => wholeDatumAttributes.indexOf(attr) === -1;
      var singleDatumAttributes = d3.keys(attrToProjector).filter(isSingleDatumAttr);
      singleDatumAttributes.forEach((attribute: string) => {
        var projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number, dataset: Dataset, m: any) =>
          data.length > 0 ? projector(data[0], i, dataset, m) : null;
      });

      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this._defaultStrokeColor);
      attrToProjector["stroke-width"] = attrToProjector["stroke-width"] || d3.functor("2px");

      return attrToProjector;
    }

    protected _wholeDatumAttributes() {
      return ["x", "y", "defined"];
    }

    public getAllPlotData(datasets = this.datasets()): Plots.PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var allElements: EventTarget[] = [];

      this._keysForDatasets(datasets).forEach((datasetKey) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(datasetKey);
        if (plotDatasetKey == null) { return; }
        var drawer = plotDatasetKey.drawer;
        plotDatasetKey.dataset.data().forEach((datum: any, index: number) => {
          var pixelPoint = drawer._getPixelPoint(datum, index);
          if (pixelPoint.x !== pixelPoint.x || pixelPoint.y !== pixelPoint.y) {
            return;
          }
          data.push(datum);
          pixelPoints.push(pixelPoint);
        });

        if (plotDatasetKey.dataset.data().length > 0) {
          allElements.push(drawer._getSelection(0).node());
        }
      });

      return { data: data, pixelPoints: pixelPoints, selection: d3.selectAll(allElements) };
    }

    /**
     * Retrieves the closest PlotData to queryPoint.
     *
     * Lines implement an x-dominant notion of distance; points closest in x are
     * tie-broken by y distance.
     *
     * @param {Point} queryPoint The point to which plot data should be compared
     *
     * @returns {PlotData} The PlotData closest to queryPoint
     */
    public getClosestPlotData(queryPoint: Point): PlotData {
      var minXDist = Infinity;
      var minYDist = Infinity;

      var closestData: any[] = [];
      var closestPixelPoints: Point[] = [];
      var closestElements: Element[] = [];

      this.datasets().forEach((dataset) => {
        var plotData = this.getAllPlotData([dataset]);
        plotData.pixelPoints.forEach((pixelPoint: Point, index: number) => {
          var datum = plotData.data[index];
          var line = plotData.selection[0][0];

          if (!this._isVisibleOnPlot(datum, pixelPoint, d3.select(line))) {
            return;
          }

          var xDist = Math.abs(queryPoint.x - pixelPoint.x);
          var yDist = Math.abs(queryPoint.y - pixelPoint.y);

          if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
            closestData = [];
            closestPixelPoints = [];
            closestElements = [];

            minXDist = xDist;
            minYDist = yDist;
          }

          if (xDist === minXDist && yDist === minYDist) {
            closestData.push(datum);
            closestPixelPoints.push(pixelPoint);
            closestElements.push(line);
          }
        });
      });

      return {
        data: closestData,
        pixelPoints: closestPixelPoints,
        selection: d3.selectAll(closestElements)
      };
    }
  }
}
}
