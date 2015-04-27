///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  export class Scatter<X, Y> extends XYPlot<X, Y> implements Interactions.Hoverable {
    private closeDetectionRadius = 5;
    private defaultFillColor: string;

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale<X, number>, yScale: Scale<Y, number>) {
      super(xScale, yScale);
      this.classed("scatter-plot", true);
      this.defaultFillColor = new Scales.Color().range()[0];

      this.animator("symbols-reset", new Animators.Null());
      this.animator("symbols", new Animators.Base()
                                           .duration(250)
                                           .delay(5));
    }

    //===== Hover logic =====
    public doHover(p: Point): Interactions.HoverData {
      return this.getClosestStruckPoint(p, this.closeDetectionRadius);
    }

    public hoverOutComponent(p: Point) {
      // no-op
    }

    public hoverOverComponent(p: Point) {
      // no-op
    }
    //===== /Hover logic =====

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();
      attrToProjector["size"] = attrToProjector["size"] || d3.functor(6);
      attrToProjector["opacity"] = attrToProjector["opacity"] || d3.functor(0.6);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this.defaultFillColor);
      attrToProjector["symbol"] = attrToProjector["symbol"] || (() => SymbolFactories.circle());

      return attrToProjector;
    }

    protected generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this.dataChanged && this.animated) {
        var resetAttrToProjector = this.generateAttrToProjector();
        resetAttrToProjector["size"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this.getAnimator("symbols-reset")});
      }

      drawSteps.push({attrToProjector: this.generateAttrToProjector(), animator: this.getAnimator("symbols")});
      return drawSteps;
    }

    protected getClosestStruckPoint(p: Point, range: number): Interactions.HoverData {
      var attrToProjector = this.generateAttrToProjector();
      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      var getDistSq = (d: any, i: number, userMetdata: any, plotMetadata: PlotMetadata) => {
        var dx = attrToProjector["x"](d, i, userMetdata, plotMetadata) - p.x;
        var dy = attrToProjector["y"](d, i, userMetdata, plotMetadata) - p.y;
        return (dx * dx + dy * dy);
      };

      var overAPoint = false;
      var closestElement: Element;
      var closestElementUserMetadata: any;
      var closestElementPlotMetadata: any;
      var closestIndex: number;
      var minDistSq = range * range;

      this.datasetKeysInOrder.forEach((key: string) => {
        var dataset = this.datasetKeys.get(key).dataset;
        var plotMetadata = this.datasetKeys.get(key).plotMetadata;
        var drawer = <Drawers.Symbol>this.datasetKeys.get(key).drawer;
        drawer._getRenderArea().selectAll("path").each(function(d, i) {
          var distSq = getDistSq(d, i, dataset.metadata(), plotMetadata);
          var r = attrToProjector["size"](d, i, dataset.metadata(), plotMetadata) / 2;

          if (distSq < r * r) { // cursor is over this point
            if (!overAPoint || distSq < minDistSq) {
              closestElement = this;
              closestIndex = i;
              minDistSq = distSq;
              closestElementUserMetadata = dataset.metadata();
              closestElementPlotMetadata = plotMetadata;
            }
            overAPoint = true;
          } else if (!overAPoint && distSq < minDistSq) {
            closestElement = this;
            closestIndex = i;
            minDistSq = distSq;
            closestElementUserMetadata = dataset.metadata();
            closestElementPlotMetadata = plotMetadata;
          }
        });
      });

      if (!closestElement) {
        return {
          selection: null,
          pixelPositions: null,
          data: null
        };
      }

      var closestSelection = d3.select(closestElement);
      var closestData = closestSelection.data();
      var closestPoint = {
        x: attrToProjector["x"](closestData[0], closestIndex, closestElementUserMetadata, closestElementPlotMetadata),
        y: attrToProjector["y"](closestData[0], closestIndex, closestElementUserMetadata, closestElementPlotMetadata)
      };
      return {
        selection: closestSelection,
        pixelPositions: [closestPoint],
        data: closestData
      };
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Symbol(key);
    }

    protected isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var xRange = { min: 0, max: this.width() };
      var yRange = { min: 0, max: this.height() };

      var translation = d3.transform(selection.attr("transform")).translate;
      var bbox = selection[0][0].getBBox();
      var translatedBbox: SVGRect = {
        x: bbox.x + translation[0],
        y: bbox.y + translation[1],
        width: bbox.width,
        height: bbox.height
      };

      return Plottable.Utils.Methods.intersectsBBox(xRange, yRange, translatedBbox);
    }
  }
}
}
