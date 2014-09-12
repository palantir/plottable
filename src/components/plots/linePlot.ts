///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Line<X> extends Abstract.XYPlot<X,number> {
    private linePath: D3.Selection;

    public _animators: Animator.IPlotAnimatorMap = {
      "line-reset" : new Animator.Null(),
      "line"       : new Animator.Base()
        .duration(600)
        .easing("exp-in-out")
    };
    public _colorVar = "stroke";
    public _yScale: Abstract.QuantitativeScale<number>;

    /**
     * Constructs a LinePlot.
     *
     * @constructor
     * @param {any | IDataset} dataset The dataset to render.
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.QuantitativeScale<X>, yScale: Abstract.QuantitativeScale<number>) {
      super(dataset, xScale, yScale);
      this.classed("line-plot", true);
      this.project("stroke", () => Core.Colors.INDIGO); // default
      this.project("stroke-width", () => "2px"); // default
    }

    public _setup() {
      super._setup();
      this._appendPath();
    }

    public _appendPath() {
      this.linePath = this._renderArea.append("path").classed("line", true);
    }

    public _getResetYFunction() {
      // gets the y-value generator for the animation start point
      var yDomain = this._yScale.domain();
      var domainMax = Math.max(yDomain[0], yDomain[1]);
      var domainMin = Math.min(yDomain[0], yDomain[1]);
      // start from zero, or the closest domain value to zero
      // avoids lines zooming on from offscreen.
      var startValue = 0;
      if (domainMax < 0) {
        startValue = domainMax;
      } else if (domainMin > 0) {
        startValue = domainMin;
      }
      var scaledStartValue = this._yScale.scale(startValue);
      return (d: any, i: number) => scaledStartValue;
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var wholeDatumAttributes = this._wholeDatumAttributes();
      function singleDatumAttributeFilter(attr: string) {
        return wholeDatumAttributes.indexOf(attr) === -1;
      }
      var singleDatumAttributes = d3.keys(attrToProjector).filter(singleDatumAttributeFilter);
      singleDatumAttributes.forEach((attribute: string) => {
        var projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number) => {
          if (data.length > 0) {
            return projector(data[0], i);
          } else {
            return null;
          }
        };
      });
      return attrToProjector;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      this.linePath.datum(this._dataset.data());

      if (this._dataChanged) {

        attrToProjector["d"] = d3.svg.line()
          .x(xFunction)
          .y(this._getResetYFunction());
        this._applyAnimatedAttributes(this.linePath, "line-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.line()
        .x(xFunction)
        .y(yFunction);
      this._applyAnimatedAttributes(this.linePath, "line", attrToProjector);
    }

    public _wholeDatumAttributes() {
      return ["x", "y"];
    }
  }
}
}
