///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class ErrorBar<X, Y> extends XYPlot<X, Y> {

    private _tickLength = 10;
    private _LOWER_BARS_CLASS = "error-lower-bars";
    private _UPPER_BARS_CLASS = "error-upper-bars";

    constructor() {
      super();
      this.addClass("error-bar-plot");
    }

    /**
     * Sets the tick length
     */
    public tickLength(): number;
    public tickLength(tickLength: number): ErrorBar<X, Y>;
    public tickLength(tickLength?: number): any {
      if (tickLength == null) {
        return this._tickLength;
      }
      this._tickLength = tickLength;
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for X2.
     */
    public x2(): AccessorScaleBinding<X, number>;
    /**
     * Sets X2 to a constant number or the result of an Accessor.
     * If a Scale has been set for X, it will also be used to scale X2.
     *
     * @param {number|Accessor<number>|X|Accessor<X>} x2
     * @returns {Plots.ErrorBar} The calling Error Bar Plot.
     */
    public x2(x2: number | Accessor<number> | X | Accessor<X>): ErrorBar<X, Y>;
    public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
      if (x2 == null) {
        return this._propertyBindings.get("x2");
      }
      var xBinding = this.x();
      var xScale = xBinding && xBinding.scale;
      this._bindProperty("x2", x2, xScale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for Y2.
     */
    public y2(): AccessorScaleBinding<Y, number>;
    /**
     * Sets Y2 to a constant number or the result of an Accessor.
     * If a Scale has been set for Y, it will also be used to scale Y2.
     *
     * @param {number|Accessor<number>|Y|Accessor<Y>} y2
     * @returns {Plots.ErrorBar} The calling Error Bar Plot.
     */
    public y2(y2: number | Accessor<number> | Y | Accessor<Y>): ErrorBar<X, Y>;
    public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
      if (y2 == null) {
        return this._propertyBindings.get("y2");
      }
      var yBinding = this.y();
      var yScale = yBinding && yBinding.scale;
      this._bindProperty("y2", y2, yScale);
      this.render();
      return this;
    }

    protected _additionalPaint(time: number) {
      super._additionalPaint(time);
      if (this._tickLength != null) {
        var lowerBars = this._renderArea.append("g").classed(this._LOWER_BARS_CLASS, true);
        var upperBars = this._renderArea.append("g").classed(this._UPPER_BARS_CLASS, true);
        this._renderArea.selectAll("line.error-bar")[0].forEach((elem) => {
          var selection = d3.select(elem);

          var x1 = selection.attr("x1");
          var x2 = selection.attr("x2");
          var y1 = selection.attr("y1");
          var y2 = selection.attr("y2");

          if (x1 === x2) {
            lowerBars.append("line").attr("x1", +x1 - this._tickLength / 2).attr("x2", +x1 + this._tickLength / 2)
                                    .attr("y1", +y1).attr("y2", +y1);
            upperBars.append("line").attr("x1", +x1 - this._tickLength / 2).attr("x2", +x1 + this._tickLength / 2)
                                    .attr("y1", +y2).attr("y2", +y2);
          } else {
            lowerBars.append("line").attr("x1", +x1).attr("x2", +x1)
                                    .attr("y1", +y1 - this._tickLength / 2).attr("y2", +y1 + this._tickLength / 2);
            upperBars.append("line").attr("x1", +x2).attr("x2", +x2)
                                    .attr("y1", +y1 - this._tickLength / 2).attr("y2", +y1 + this._tickLength / 2);
          }
        });
      }
    }

    protected _createDrawer(dataset: Dataset): Drawer {
      return new Plottable.Drawers.ErrorBar(dataset);
    }

    protected _propertyProjectors(): AttributeToProjector {
      var attrToProjector = super._propertyProjectors();
      attrToProjector["x1"] = Plot._scaledAccessor(this.x());
      attrToProjector["y1"] = Plot._scaledAccessor(this.y());
      attrToProjector["x2"] = this.x2() != null ? Plot._scaledAccessor(this.x2()) : Plot._scaledAccessor(this.x());
      attrToProjector["y2"] = this.y2() != null ? Plot._scaledAccessor(this.y2()) : Plot._scaledAccessor(this.y());
      return attrToProjector;
    }
  }
}
}
