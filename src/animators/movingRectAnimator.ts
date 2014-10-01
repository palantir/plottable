///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class MovingRect extends Rect {

    public baseline: number;

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
