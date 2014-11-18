///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter<X,Y> extends AbstractXYPlot<X,Y> implements Interaction.Hoverable {
    private closeDetectionRadius = 5;

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
      this.project("r", 3); // default
      this.project("opacity", 0.6); // default

      var defaultColor = new Scale.Color().range()[0];
      this.project("fill", () => defaultColor); // default

      this._animators["circles-reset"] = new Animator.Null();
      this._animators["circles"] = new Animator.Base()
                                               .duration(250)
                                               .delay(5);
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

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Element(key).svgElement("circle");
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["cx"] = attrToProjector["x"];
      delete attrToProjector["x"];
      attrToProjector["cy"] = attrToProjector["y"];
      delete attrToProjector["y"];
      return attrToProjector;
    }

    public _generateDrawSteps(): _Drawer.DrawStep[] {
      var drawSteps: _Drawer.DrawStep[] = [];
      if (this._dataChanged) {
        var resetAttrToProjector = this._generateAttrToProjector();
        resetAttrToProjector["r"] = () => 0;
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("circles-reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("circles")});
      return drawSteps;
    }

    public _getClosestStruckPoint(p: Point, range: number): Interaction.HoverData {
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
      var closestElementUserMedata: any;
      var closestElementPlotMedata: any;
      var closestIndex: number;
      var minDistSq = range * range;

       this._datasetKeysInOrder.forEach((key: string) => {
        var dataset = this._key2PlotDatasetKey.get(key).dataset;
        var plotMetadata = this._key2PlotDatasetKey.get(key).plotMetadata;
        var drawer = <_Drawer.Element>this._key2PlotDatasetKey.get(key).drawer;
        drawer._getDrawSelection().each(function (d, i) {
          var distSq = getDistSq(d, i, dataset.metadata(), plotMetadata);
          var r = attrToProjector["r"](d, i, dataset.metadata(), plotMetadata);

          if (distSq < r * r) { // cursor is over this point
            if (!overAPoint || distSq < minDistSq) {
              closestElement = this;
              closestIndex = i;
              minDistSq = distSq;
              closestElementUserMedata = dataset.metadata();
              closestElementPlotMedata = plotMetadata;
            }
            overAPoint = true;
          } else if (!overAPoint && distSq < minDistSq) {
            closestElement = this;
            closestIndex = i;
            minDistSq = distSq;
            closestElementUserMedata = dataset.metadata();
            closestElementPlotMedata = plotMetadata;
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
        x: attrToProjector["cx"](closestData[0], closestIndex, closestElementUserMedata, closestElementPlotMedata),
        y: attrToProjector["cy"](closestData[0], closestIndex, closestElementUserMedata, closestElementPlotMedata)
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
      return this._getClosestStruckPoint(p, this.closeDetectionRadius);
    }
    //===== /Hover logic =====
  }
}
}
