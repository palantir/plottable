///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * A child class of RectAnimator that will move the rectangle
   * as well as animate its growth.
   */
  export class MovingRect extends Rect {

    /**
     * The value to move from
     */
    public baseline: number;

    /**
     * Constructs a MovingRectAnimator
     *
     * @param {number} baseline The value to start moving from
     * @param {boolean} isVertical If the movement/animation is vertical
     */
    constructor(baseline: number, isVertical = true) {
      super(isVertical);
      this.baseline = baseline;
    }

    public _startMovingProjector(attrToProjector: IAttributeToProjector) {
      return d3.functor(this.baseline);
    }

  }

}
}
