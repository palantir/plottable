///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Rect extends Default {

    public static ANIMATED_ATTRIBUTES = ["height", "width", "x", "y", "fill"];

    public isVertical: boolean;
    public isReverse: boolean;

    constructor(isVertical = true, isReverse = false) {
      super();
      this.isVertical = isVertical;
      this.isReverse = isReverse;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector): any {
      var startAttrToProjector: IAttributeToProjector = {};
      Rect.ANIMATED_ATTRIBUTES.forEach((attr: string) => startAttrToProjector[attr] = attrToProjector[attr]);

      startAttrToProjector[this._getMovingAttr()] = this._startMovingAttrProjector(attrToProjector);
      startAttrToProjector[this._getGrowingAttr()] = d3.functor(0);

      selection.attr(startAttrToProjector);
      return super.animate(selection, attrToProjector);
    }

    public _startMovingAttrProjector(attrToProjector: IAttributeToProjector) {
      if (this.isVertical === this.isReverse) {
        return attrToProjector[this._getMovingAttr()];
      }
      var movingAttrProjector = attrToProjector[this._getMovingAttr()];
      var growingAttrProjector = attrToProjector[this._getGrowingAttr()];
      return (d: any, i: number) => movingAttrProjector(d, i) + growingAttrProjector(d, i);
    }

    public _getGrowingAttr() {
      return this.isVertical ? "height" : "width";
    }

    public _getMovingAttr() {
      return this.isVertical ? "y" : "x";
    }

  }

}
}
