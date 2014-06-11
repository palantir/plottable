///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator that delays the animation of the attributes using the index
   * of the selection data.
   *
   * The delay between animations can be configured with the .delay getter/setter.
   */
  export class IterativeDelayAnimator extends DefaultAnimator {
    _delayMsec = 15;

    public animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any {
      return selection.transition()
        .ease(this._easing)
        .duration(this._durationMsec)
        .delay((d: any, i: number) => i * this._delayMsec)
        .attr(attrToProjector);
    }
  }

}
}
