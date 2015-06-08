///<reference path="../reference.ts" />

module Plottable {
export module Animators {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Rect extends Base {

    public static ANIMATED_ATTRIBUTES = ["height", "width", "x", "y", "fill"];

    public isVertical: boolean;

    /**
     * The pixel value to move from
     */
    public startPixelValue: number;

    constructor(startPixelValue: number, isVertical = true) {
      super();
      this.isVertical = isVertical;
      this.startPixelValue = startPixelValue;
    }

    public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector) {
      var startAttrToAppliedProjector: AttributeToAppliedProjector = {};
      Rect.ANIMATED_ATTRIBUTES.forEach((attr: string) => startAttrToAppliedProjector[attr] = attrToAppliedProjector[attr]);

      var movingAttribute = this.isVertical ? "y" : "x";
      startAttrToAppliedProjector[movingAttribute] = () => this.startPixelValue;
      var growingAttribute = this.isVertical ? "height" : "width";
      startAttrToAppliedProjector[growingAttribute] = () => 0;

      selection.attr(attrToAppliedProjector);
      return super.animate(selection, attrToAppliedProjector);
    }

  }

}
}
