///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Line<X> extends AbstractXYPlot<X,number> {

    public _yScale: Scale.AbstractQuantitative<number>;

    /**
     * Constructs a LinePlot.
     *
     * @constructor
     * @param {any | DatasetInterface} dataset The dataset to render.
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>) {
      super(xScale, yScale);
      this.classed("line-plot", true);
      this.project("stroke", () => Core.Colors.INDIGO); // default
      this.project("stroke-width", () => "2px"); // default
      this._animators["line-reset"] = new Animator.Null();
      this._animators["line-main"] = new Animator.Base()
                                        .duration(600)
                                        .easing("exp-in-out");
    }

     public _getDrawer(key: string) {
      return new Plottable._Drawer.Path(key);
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
      return (d: any, i: number) => scaledStartValue;
    }

    public _rejectNullsAndNaNs(d: any, i: number, projector: AppliedAccessor) {
      var value = projector(d, i);
      return value != null && value === value;
    }

    private createLine(xFunction: AppliedAccessor, yFunction: AppliedAccessor) {
      return d3.svg.line()
               .x(xFunction)
               .y(yFunction)
               .defined((d, i) => this._rejectNullsAndNaNs(d, i, xFunction) && this._rejectNullsAndNaNs(d, i, yFunction));
    }

    public _generateDrawSteps(): DrawStep[] {
      var drawSteps: DrawStep[] = [];
      debugger;
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      if(this._dataChanged) {
        var resetAttrToProjector: AttributeToProjector = {};
        d3.keys(attrToProjector).forEach((key) => { resetAttrToProjector[key] = attrToProjector[key]; });
        resetAttrToProjector["d"] = this.createLine(xFunction, this._getResetYFunction());
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator("line-reset")});
      }

      attrToProjector["d"] = this.createLine(xFunction, yFunction);
      drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator("line")});
      return drawSteps;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var wholeDatumAttributes = this._wholeDatumAttributes();
      var isSingleDatumAttr = (attr: string) => wholeDatumAttributes.indexOf(attr) === -1;
      var singleDatumAttributes = d3.keys(attrToProjector).filter(isSingleDatumAttr);
      singleDatumAttributes.forEach((attribute: string) => {
        var projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number) => data.length > 0 ? projector(data[0], i) : null;
      });
      return attrToProjector;
    }

    public _wholeDatumAttributes() {
      return ["x", "y"];
    }
  }
}
}
