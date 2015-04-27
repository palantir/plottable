///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Line<X> extends XYPlot<X, number> implements Interactions.Hoverable {
    private defaultStrokeColor: string;
    private hoverDetectionRadius = 15;
    private hoverTarget: D3.Selection;

    protected _yScale: QuantitativeScale<number>;

    /**
     * Constructs a LinePlot.
     *
     * @constructor
     * @param {QuantitativeScaleScale} xScale The x scale to use.
     * @param {QuantitativeScaleScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("line-plot", true);
      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                         .duration(600)
                                         .easing("exp-in-out"));

      this.defaultStrokeColor = new Scales.Color().range()[0];
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

      this.datasetOrder().forEach((key: string) => {
        var plotData = this.getAllPlotData(key);
        plotData.pixelPoints.forEach((pixelPoint: Point, index: number) => {
          var datum = plotData.data[index];
          var line = plotData.selection[0][0];

          if (!this.isVisibleOnPlot(datum, pixelPoint, d3.select(line))) {
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

    //===== Hover logic =====
    public hoverOverComponent(p: Point) {
      // no-op
    }

    public hoverOutComponent(p: Point) {
      // no-op
    }

    public doHover(p: Point): Interactions.HoverData {
      var closestInfo = this.getClosestWithinRange(p, this.hoverDetectionRadius);
      var closestValue = closestInfo.closestValue;
      if (closestValue === undefined) {
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      var closestPoint = closestInfo.closestPoint;
      this.hoverTarget.attr({
        "cx": closestInfo.closestPoint.x,
        "cy": closestInfo.closestPoint.y
      });

      return {
        data: [closestValue],
        pixelPositions: [closestPoint],
        selection: this.hoverTarget
      };
    }
    //===== /Hover logic =====

    protected generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this.dataChanged && this.animated) {
        var attrToProjector = this.generateAttrToProjector();
        attrToProjector["y"] = this.getResetYFunction();
        drawSteps.push({attrToProjector: attrToProjector, animator: this.getAnimator("reset")});
      }

      drawSteps.push({attrToProjector: this.generateAttrToProjector(), animator: this.getAnimator("main")});

      return drawSteps;
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();
      var wholeDatumAttributes = this.wholeDatumAttributes();
      var isSingleDatumAttr = (attr: string) => wholeDatumAttributes.indexOf(attr) === -1;
      var singleDatumAttributes = d3.keys(attrToProjector).filter(isSingleDatumAttr);
      singleDatumAttributes.forEach((attribute: string) => {
        var projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number, u: any, m: any) =>
          data.length > 0 ? projector(data[0], i, u, m) : null;
      });

      var xFunction = attrToProjector["x"];
      var yFunction = attrToProjector["y"];

      attrToProjector["defined"] = (d: any, i: number, u: any, m: any) =>
          this.rejectNullsAndNaNs(d, i, u, m, xFunction) && this.rejectNullsAndNaNs(d, i, u, m, yFunction);
      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this.defaultStrokeColor);
      attrToProjector["stroke-width"] = attrToProjector["stroke-width"] || d3.functor("2px");

      return attrToProjector;
    }

    protected _getAllPlotData(datasetKeys: string[]): PlotData {
      var data: any[] = [];
      var pixelPoints: Point[] = [];
      var allElements: EventTarget[] = [];

      datasetKeys.forEach((datasetKey) => {
        var plotDatasetKey = this.datasetKeys.get(datasetKey);
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

    protected getClosestWithinRange(p: Point, range: number) {
      var attrToProjector = this.generateAttrToProjector();
      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];

      var getDistSq = (d: any, i: number, userMetdata: any, plotMetadata: PlotMetadata) => {
        var dx = +xProjector(d, i, userMetdata, plotMetadata) - p.x;
        var dy = +yProjector(d, i, userMetdata, plotMetadata) - p.y;
        return (dx * dx + dy * dy);
      };

      var closestOverall: any;
      var closestPoint: Point;
      var closestDistSq = range * range;

       this.datasetKeysInOrder.forEach((key: string) => {
        var dataset = this.datasetKeys.get(key).dataset;
        var plotMetadata = this.datasetKeys.get(key).plotMetadata;
        dataset.data().forEach((d: any, i: number) => {
          var distSq = getDistSq(d, i, dataset.metadata(), plotMetadata);
          if (distSq < closestDistSq) {
            closestOverall = d;
            closestPoint = {
              x: xProjector(d, i, dataset.metadata(), plotMetadata),
              y: yProjector(d, i, dataset.metadata(), plotMetadata)
            };
            closestDistSq = distSq;
          }
        });
      });

      return {
        closestValue: closestOverall,
        closestPoint: closestPoint
      };
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Line(key);
    }

    protected getResetYFunction() {
      // gets the y-value generator for the animation start point
      var yDomain = this._yScale.domain();
      var domainMax = Math.max(yDomain[0], yDomain[1]);
      var domainMin = Math.min(yDomain[0], yDomain[1]);
      // start from zero, or the closest domain value to zero
      // avoids lines zooming on from offscreen.
      var startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
      var scaledStartValue = this._yScale.scale(startValue);
      return (d: any, i: number, u: any, m: PlotMetadata) => scaledStartValue;
    }

    protected rejectNullsAndNaNs(d: any, i: number, userMetdata: any, plotMetadata: any, accessor: _Accessor) {
      var value = accessor(d, i, userMetdata, plotMetadata);
      return value != null && value === value;
    }

    protected setup() {
      super.setup();
      this.hoverTarget = this.foreground().append("circle")
                                           .classed("hover-target", true)
                                           .attr("r", this.hoverDetectionRadius)
                                           .style("visibility", "hidden");
    }

    protected wholeDatumAttributes() {
      return ["x", "y"];
    }
  }
}
}
