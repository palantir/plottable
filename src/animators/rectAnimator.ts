///<reference path="../reference.ts" />

module Plottable {
export module Animators {

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

    public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector) {
      var startAttrToAppliedProjector: AttributeToAppliedProjector = {};
      Rect.ANIMATED_ATTRIBUTES.forEach((attr: string) => startAttrToAppliedProjector[attr] = attrToAppliedProjector[attr]);

      startAttrToAppliedProjector[this._getMovingAttr()] = this._startMovingProjector(attrToAppliedProjector);
      startAttrToAppliedProjector[this._getGrowingAttr()] = () => 0;

      selection.attr(attrToAppliedProjector);
      return super.animate(selection, attrToAppliedProjector);
    }

    protected _startMovingProjector(attrToAppliedProjector: AttributeToAppliedProjector) {
      if (this.isVertical === this.isReverse) {
        return attrToAppliedProjector[this._getMovingAttr()];
      }
      var movingAttrAppliedProjector = attrToAppliedProjector[this._getMovingAttr()];
      var growingAttrAppliedProjector = attrToAppliedProjector[this._getGrowingAttr()];
      return (d: any, i: number) => {
        return movingAttrAppliedProjector(d, i) + growingAttrAppliedProjector(d, i);
      };
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
