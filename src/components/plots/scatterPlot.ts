///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter<X,Y> extends AbstractXYPlot<X,Y> implements Interaction.Hoverable {
    private _closeDetectionRadius = 5;
    private _defaultFillColor: string;

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractScale<X, number>, yScale: Scale.AbstractScale<Y, number>) {
      super(xScale, yScale);
      this.classed("scatter-plot", true);
      this._defaultFillColor = new Scale.Color().range()[0];

      this.animator("symbols-reset", new Animator.Null());
      this.animator("symbols", new Animator.Base()
                                           .duration(250)
                                           .delay(5));
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.Symbol(key);
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["size"] = attrToProjector["size"] || d3.functor(6);
      attrToProjector["opacity"] = attrToProjector["opacity"] || d3.functor(0.6);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      attrToProjector["symbol"] = attrToProjector["symbol"] || (() => SymbolFactories.circle());

      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      var drawSteps: _Drawer.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        resetAttrToProjector["size"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("symbols-reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("symbols")});
      return drawSteps;
    }

    protected _getClosestStruckPoint(p: Point, range: number): Interaction.HoverData {
      var attrToProjector = this._generateAttrToProjector();
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

      this._datasetKeysInOrder.forEach((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        var drawer = <_Drawer.Symbol>this._key2PlotDatasetKey.get(key).drawer;
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

    protected _isVisibleOnPlot(datum: any, pixelPoint: Point, selection: D3.Selection): boolean {
      var chartXExtent = { min: 0, max: this.width() };
      var chartYExtent = { min: 0, max: this.height() };

      var translation = d3.transform(selection.attr("transform")).translate;
      var bbox = selection[0][0].getBBox();
      var translatedBbox: SVGRect = {
        x: bbox.x + translation[0],
        y: bbox.y + translation[1],
        width: bbox.width,
        height: bbox.height
      };

      return Plottable._Util.Methods.intersectsBBox(chartXExtent, chartYExtent, translatedBbox);
    }

    //===== Hover logic =====
    public _hoverOverComponent(p: Point) {
      // no-op
    }

    public _hoverOutComponent(p: Point) {
      // no-op
    }

    public _doHover(p: Point): Interaction.HoverData {
      return this._getClosestStruckPoint(p, this._closeDetectionRadius);
    }
    //===== /Hover logic =====
  }
}
}
