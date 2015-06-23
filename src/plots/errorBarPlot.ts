///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class ErrorBar<X, Y> extends XYPlot<X, Y> {

    constructor() {
      super();
      this.addClass("error-bar-plot");
    }

    /**
     * Gets the AccessorScaleBinding for X.
     */
    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): ErrorBar<X, Y>;
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): ErrorBar<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }

      if (xScale == null) {
        super.x(<number | Accessor<number>>x);
      } else {
        super.x(< X | Accessor<X>>x, xScale);
      }

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
     * Gets the AccessorScaleBinding for Y.
     */
    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): ErrorBar<X, Y>;
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): ErrorBar<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }

      if (yScale == null) {
        super.y(<number | Accessor<number>>y);
      } else {
        super.y(<Y | Accessor<Y>>y, yScale);
      }
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
