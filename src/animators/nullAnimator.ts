///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements PlotAnimator {
    public animate(selection: any, attrToProjector: AttributeToProjector): TransitionAndTime {
      return {selection: selection.attr(attrToProjector), time: 0};
    }
  }

}
}
