///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * A child class of RectAnimator that will move the rectangle
   * as well as animate its growth.
   */
  export class MovingRect extends Rect {

    /**
     * The pixel value to move from
     */
    public startPixelValue: number;

    /**
     * Constructs a MovingRectAnimator
     *
     * @param {number} basePixel The pixel value to start moving from
     * @param {boolean} isVertical If the movement/animation is vertical
     */
    constructor(startPixelValue: number, isVertical = true) {
      super(isVertical);
      this.startPixelValue = startPixelValue;
    }

    protected _startMovingProjector(attrToProjector: AttributeToProjector) {
      return d3.functor(this.startPixelValue);
    }

  }

}
}
