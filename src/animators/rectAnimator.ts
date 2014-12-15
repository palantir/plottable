///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Rect extends Base {

    public static ANIMATED_ATTRIBUTES = ["height", "width", "x", "y", "fill"];

    public isVertical: boolean;
    public isReverse: boolean;

    constructor(isVertical = true, isReverse = false) {
      super();
      this.isVertical = isVertical;
      this.isReverse = isReverse;
    }

    public animate(selection: any, attrToProjector: AttributeToProjector) {
      var startAttrToProjector: AttributeToProjector = {};
      Rect.ANIMATED_ATTRIBUTES.forEach((attr: string) => startAttrToProjector[attr] = attrToProjector[attr]);

      startAttrToProjector[this._getMovingAttr()] = this._startMovingProjector(attrToProjector);
      startAttrToProjector[this._getGrowingAttr()] = () => 0;

      selection.attr(startAttrToProjector);
      return super.animate(selection, attrToProjector);
    }

    protected _startMovingProjector(attrToProjector: AttributeToProjector) {
      if (this.isVertical === this.isReverse) {
        return attrToProjector[this._getMovingAttr()];
      }
      var movingAttrProjector = attrToProjector[this._getMovingAttr()];
      var growingAttrProjector = attrToProjector[this._getGrowingAttr()];
      return (d: any, i: number, u: any, m: Plot.PlotMetadata) => movingAttrProjector(d, i, u, m) + growingAttrProjector(d, i, u, m);
    }

    private _getGrowingAttr() {
      return this.isVertical ? "height" : "width";
    }

    private _getMovingAttr() {
      return this.isVertical ? "y" : "x";
    }

  }

}
}
