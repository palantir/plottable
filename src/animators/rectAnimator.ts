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

    public animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition {
      var startAttrToProjector: AttributeToProjector = {};
      Rect.ANIMATED_ATTRIBUTES.forEach((attr: string) => startAttrToProjector[attr] = attrToProjector[attr]);

      startAttrToProjector[this.getMovingAttr()] = this._startMovingProjector(attrToProjector);
      startAttrToProjector[this.getGrowingAttr()] = () => 0;

      selection.attr(startAttrToProjector);
      return super.animate(selection, attrToProjector);
    }

    public _startMovingProjector(attrToProjector: AttributeToProjector) {
      if (this.isVertical === this.isReverse) {
        return attrToProjector[this.getMovingAttr()];
      }
      var movingAttrProjector = attrToProjector[this.getMovingAttr()];
      var growingAttrProjector = attrToProjector[this.getGrowingAttr()];
      return (d: any, i: number) => movingAttrProjector(d, i) + growingAttrProjector(d, i);
    }

    private getGrowingAttr() {
      return this.isVertical ? "height" : "width";
    }

    private getMovingAttr() {
      return this.isVertical ? "y" : "x";
    }

  }

}
}
