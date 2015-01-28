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

      this.animator("circles-reset", new Animator.Null());
      this.animator("circles", new Animator.Base()
                                           .duration(250)
                                           .delay(5));
    }

    /**
     * @param {string} attrToSet One of ["x", "y", "cx", "cy", "r",
     * "fill"]. "cx" and "cy" are aliases for "x" and "y". "r" is the datum's
     * radius, and "fill" is the CSS color of the datum.
     */
    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.project(attrToSet, accessor, scale);
      return this;
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.Element(key).svgElement("circle");
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["cx"] = attrToProjector["x"];
      delete attrToProjector["x"];
      attrToProjector["cy"] = attrToProjector["y"];
      delete attrToProjector["y"];
      attrToProjector["r"] = attrToProjector["r"] || d3.functor(3);
      attrToProjector["opacity"] = attrToProjector["opacity"] || d3.functor(0.6);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      return attrToProjector;
    }

    protected _generateDrawSteps(): _Drawer.DrawStep[] {
      var drawSteps: _Drawer.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var resetAttrToProjector = this._generateAttrToProjector();
        resetAttrToProjector["r"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("circles-reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("circles")});
      return drawSteps;
    }

    protected _getClosestStruckPoint(p: Point, range: number): Interaction.HoverData {
      var attrToProjector = this._generateAttrToProjector();
      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      var getDistSq = (d: any, i: number, userMetdata: any, plotMetadata: PlotMetadata) => {
        var dx = attrToProjector["cx"](d, i, userMetdata, plotMetadata) - p.x;
        var dy = attrToProjector["cy"](d, i, userMetdata, plotMetadata) - p.y;
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
        var drawer = <_Drawer.Element>this._key2PlotDatasetKey.get(key).drawer;
        drawer._getRenderArea().selectAll("circle").each(function(d, i) {
          var distSq = getDistSq(d, i, dataset.metadata(), plotMetadata);
          var r = attrToProjector["r"](d, i, dataset.metadata(), plotMetadata);

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
        x: attrToProjector["cx"](closestData[0], closestIndex, closestElementUserMetadata, closestElementPlotMetadata),
        y: attrToProjector["cy"](closestData[0], closestIndex, closestElementUserMetadata, closestElementPlotMetadata)
      };
      return {
        selection: closestSelection,
        pixelPositions: [closestPoint],
        data: closestData
      };
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
