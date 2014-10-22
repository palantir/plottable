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
      this.project("fill", () => Core.Colors.INDIGO); // default
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

    public _getClosestStruckPoint(p: Point, range: number) {
      var drawers = <_Drawer.Element[]> this._getDrawersInOrder();
      var attrToProjector = this._generateAttrToProjector();

      var getDistSq = (d: any, i: number) => {
        var dx = attrToProjector["cx"](d, i) - p.x;
        var dy = attrToProjector["cy"](d, i) - p.y;
        return (dx * dx + dy * dy);
      };

      var overAPoint = false;
      var closestElement: Element;
      var minDistSq = range * range;

      drawers.forEach((drawer) => {
        drawer._getDrawSelection().each(function (d, i) {
          var distSq = getDistSq(d, i);
          var r = attrToProjector["r"](d, i);

          if (distSq < r * r) { // cursor is over this point
            if (!overAPoint || distSq < minDistSq) {
              closestElement = this;
              minDistSq = distSq;
            }
            overAPoint = true;
          } else if (!overAPoint && distSq < minDistSq) {
            closestElement = this;
            minDistSq = distSq;
          }
        });
      });

      if (closestElement) {
        var closestSelection = d3.select(closestElement);
        return {
          selection: closestSelection,
          data: closestSelection.data()
        };
      } else {
        return {
          selection: null,
          data: null
        };
      }
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
