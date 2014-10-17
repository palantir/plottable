///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter<X,Y> extends AbstractXYPlot<X,Y> {

    /**
     * Constructs a ScatterPlot.
     *
     * @constructor
     * @param {DatasetInterface | any} dataset The dataset to render.
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
  }
}
}
