///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Segment<X, Y> extends XYPlot<X, Y> {
    private static _X2_KEY = "x2";
    private static _Y2_KEY = "y2";

    /**
     * A Segment Plot displays line segments based on the data.
     *
     * @constructor
     */
    constructor() {
      super();
      this.addClass("segment-plot");
    }

    protected _createDrawer(dataset: Dataset) {
      return new Drawers.Segment(dataset);
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null()}];
    }

    /**
     * Gets the AccessorScaleBinding for X
     */
    public x(): AccessorScaleBinding<X, number>;
    /**
     * Sets X to a constant value or the result of an Accessor.
     *
     * @param {X|Accessor<X>} x
     * @returns {Plots.Segment} The calling Segment Plot.
     */
    public x(x: number | Accessor<number>): Plots.Segment<X, Y>;
    /**
     * Sets X to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {X|Accessor<X>} x
     * @param {Scale<X, number>} xScale
     * @returns {Plots.Segment} The calling Segment Plot.
     */
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): Plots.Segment<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }
      if (xScale == null) {
        return super.x(<number | Accessor<number>>x);
      } else {
        return super.x(<X | Accessor<X>>x, xScale);
      }
    }

    /**
     * Gets the AccessorScaleBinding for X2
     */
    public x2(): AccessorScaleBinding<X, number>;
    /**
     * Sets X2 to a constant number or the result of an Accessor.
     * If a Scale has been set for X, it will also be used to scale X2.
     * 
     * @param {number|Accessor<number>|Y|Accessor<Y>} y2
     * @returns {Plots.Segment} The calling Segment Plot
     */
    public x2(x2: number | Accessor<number> | X | Accessor<X>): Plots.Segment<X, Y>;
    public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
      if (x2 == null) {
        return this._propertyBindings.get(Segment._X2_KEY);
      }
      var xBinding = this.x();
      var xScale = xBinding && xBinding.scale;
  
      this._bindProperty(Segment._X2_KEY, x2, xScale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for Y
     */
    public y(): AccessorScaleBinding<Y, number>;
    /**
     * Sets Y to a constant value or the result of an Accessor.
     *
     * @param {Y|Accessor<Y>} y
     * @returns {Plots.Segment} The calling Segment Plot.
     */
    public y(y: number | Accessor<number>): Plots.Segment<X, Y>;
    /**
     * Sets Y to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {Y|Accessor<Y>} y
     * @param {Scale<Y, number>} yScale
     * @returns {Plots.Segment} The calling Segment Plot.
     */
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): Plots.Segment<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }
      if (yScale == null) {
        return super.y(<number | Accessor<number>>y);
      } else {
        return super.y(<Y | Accessor<Y>>y, yScale);
      }     
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
     * @returns {Plots.Segment} The calling Segment Plot.
     */
    public y2(y2: number | Accessor<number> | Y | Accessor<Y>): Plots.Segment<X, Y>;
    public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
      if (y2 == null) {
        return this._propertyBindings.get(Segment._Y2_KEY);
      }
      var yBinding = this.y();
      var yScale = yBinding && yBinding.scale;
      this._bindProperty(Segment._Y2_KEY, y2, yScale);
      this.render();
      return this;
    }

    protected _propertyProjectors(): AttributeToProjector {
      var attrToProjector = super._propertyProjectors();
      attrToProjector["x1"] = Plot._scaledAccessor(this.x());
      attrToProjector["x2"] = this.x2() == null ? Plot._scaledAccessor(this.x()) : Plot._scaledAccessor(this.x2());
      attrToProjector["y1"] = Plot._scaledAccessor(this.y());
      attrToProjector["y2"] = this.y2() == null ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.y2());
      return attrToProjector;
    }
  }
}
}
