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

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)}];
    }

    public x2(): AccessorScaleBinding<X, number>;
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
     * Gets the AccessorScaleBinding for Y2.
     */
    public y2(): AccessorScaleBinding<Y, number>;
    /**
     * Sets Y2 to a constant number or the result of an Accessor.
     * If a Scale has been set for Y, it will also be used to scale Y2.
     *
     * @param {number|Accessor<number>|Y|Accessor<Y>} y2
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
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
      attrToProjector["x2"] = Plot._scaledAccessor(this.x2());
      attrToProjector["y1"] = Plot._scaledAccessor(this.y());
      attrToProjector["y2"] = Plot._scaledAccessor(this.y2());
      return attrToProjector;
    }
  }
}
}
