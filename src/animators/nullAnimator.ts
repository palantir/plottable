///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements PlotAnimator {

    public getTiming(selection: any) {
      return 0;
    }
    public animate(selection: any, attrToProjector: AttributeToProjector): any {
      return selection.attr(attrToProjector);
    }
  }

}
}
