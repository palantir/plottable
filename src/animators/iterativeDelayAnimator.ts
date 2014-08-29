///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator that delays the animation of the attributes using the index
   * of the selection data.
   *
   * The delay between animations can be configured with the .delay getter/setter.
   */
  export class IterativeDelay extends Base {
    /**
     * The delay between each start of an animation
     */
    public static ITERATIVE_DELAY_MILLISECONDS = 15;

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay((d: any, i: number) => this.delay() + IterativeDelay.ITERATIVE_DELAY_MILLISECONDS * i)
        .attr(attrToProjector);
    }
  }

}
}
