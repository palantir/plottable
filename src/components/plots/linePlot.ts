///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Line<X> extends AbstractXYPlot<X,number> implements Interaction.Hoverable {
    private _hoverDetectionRadius = 15;
    private _hoverTarget: D3.Selection;
    private _defaultStrokeColor: string;

    public _yScale: Scale.AbstractQuantitative<number>;

    /**
     * Constructs a LinePlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>) {
      super(xScale, yScale);
      this.classed("line-plot", true);
      this.animator("reset", new Animator.Null());
      this.animator("main", new Animator.Base()
                                         .duration(600)
                                         .easing("exp-in-out"));

      this._defaultStrokeColor = new Scale.Color().range()[0];
    }

    public _setup() {
      super._setup();
      this._hoverTarget = this._foregroundContainer.append("circle")
                                                   .classed("hover-target", true)
                                                   .attr("radius", this._hoverDetectionRadius)
                                                   .style("visibility", "hidden");
    }

    public _rejectNullsAndNaNs(d: any, i: number, userMetdata: any, plotMetadata: any, accessor: _Accessor) {
      var value = accessor(d, i, userMetdata, plotMetadata);
      return value != null && value === value;
    }

     public _getDrawer(key: string) {
      return new Plottable._Drawer.Line(key);
    }

    public _getResetYFunction() {
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

    public _generateDrawSteps(): _Drawer.DrawStep[] {
      var drawSteps: _Drawer.DrawStep[] = [];
      if (this._dataChanged && this._animate) {
        var attrToProjector = this._generateAttrToProjector();
        attrToProjector["y"] = this._getResetYFunction();
        drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator("reset")});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("main")});

      return drawSteps;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var wholeDatumAttributes = this._wholeDatumAttributes();
      var isSingleDatumAttr = (attr: string) => wholeDatumAttributes.indexOf(attr) === -1;
      var singleDatumAttributes = d3.keys(attrToProjector).filter(isSingleDatumAttr);
      singleDatumAttributes.forEach((attribute: string) => {
        var projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number, u: any, m: any) =>
          data.length > 0 ? projector(data[0], i, u, m) : null;
      });

      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];

      attrToProjector["defined"] = (d: any, i: number, u: any, m: any) =>
          this._rejectNullsAndNaNs(d, i, u, m, xFunction) && this._rejectNullsAndNaNs(d, i, u, m, yFunction);
      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this._defaultStrokeColor);
      attrToProjector["stroke-width"] = attrToProjector["stroke-width"] || d3.functor("2px");

      return attrToProjector;
    }

    public _wholeDatumAttributes() {
      return ["x", "y"];
    }

    // HACKHACK User and plot metadata should be applied here - #1306.
    public _getClosestWithinRange(p: Point, range: number) {
      var attrToProjector = this._generateAttrToProjector();
      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];

      var getDistSq = (d: any, i: number) => {
        var dx = +xProjector(d, i, null, null) - p.x;
        var dy = +yProjector(d, i, null, null) - p.y;
        return (dx * dx + dy * dy);
      };

      var closestOverall: any;
      var closestPoint: Point;
      var closestDistSq = range * range;

      this.datasets().forEach((dataset) => {
        dataset.data().forEach((d: any, i: number) => {
          var distSq = getDistSq(d, i);
          if (distSq < closestDistSq) {
            closestOverall = d;
            closestPoint = {
              x: xProjector(d, i, null, null),
              y: yProjector(d, i, null, null)
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

    //===== Hover logic =====
    public _hoverOverComponent(p: Point) {
      // no-op
    }

    public _hoverOutComponent(p: Point) {
      // no-op
    }

    public _doHover(p: Point): Interaction.HoverData {
      var closestInfo = this._getClosestWithinRange(p, this._hoverDetectionRadius);
      var closestValue = closestInfo.closestValue;
      if (closestValue === undefined) {
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      var closestPoint = closestInfo.closestPoint;
      this._hoverTarget.attr({
        "cx": closestInfo.closestPoint.x,
        "cy": closestInfo.closestPoint.y
      });

      return {
        data: [closestValue],
        pixelPositions: [closestPoint],
        selection: this._hoverTarget
      };
    }
    //===== /Hover logic =====
  }
}
}
