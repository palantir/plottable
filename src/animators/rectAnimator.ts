///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Rect extends Base {

    private static ANIMATED_ATTRIBUTES = ["height", "width", "x", "y"];

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

      var growingAttr = this.isVertical ? "height" : "width";
      var growingAttrProjector = attrToProjector[growingAttr];

      if (!this.isReverse) {
        var movingAttr = this.isVertical ? "y" : "x";
        var movingAttrProjector = startAttrToProjector[movingAttr];
        var offsetProjector = this.isVertical ? growingAttrProjector : (d: any, i: number) => 0 - growingAttrProjector(d, i);
        startAttrToProjector[movingAttr] = (d: any, i: number) => movingAttrProjector(d, i) + offsetProjector(d, i);
      }

      startAttrToProjector[growingAttr] = d3.functor(0);

      selection.attr(startAttrToProjector);
      return super.animate(selection, attrToProjector);
    }

  }

}
}
