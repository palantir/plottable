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
     * The start delay between each start of an animation
     */
    public static DEFAULT_ITERATIVE_DELAY_MILLISECONDS = 15;

    private _iterativeDelay: number;

    /**
     * Constructs an animator with a start delay between each selection animation
     *
     * @constructor
     */
    constructor() {
      super();
      this._iterativeDelay = IterativeDelay.DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay((d: any, i: number) => this.delay() + IterativeDelay.DEFAULT_ITERATIVE_DELAY_MILLISECONDS * i)
        .attr(attrToProjector);
    }

    /**
     * Gets the start delay between animations in milliseconds.
     *
     * @returns {number} The current iterative delay.
     */
    public iterativeDelay(): number;
    /**
     * Sets the start delay between animations in milliseconds.
     *
     * @param {number} iterDelay The iterative delay in milliseconds.
     * @returns {IterativeDelay} The calling IterativeDelay Animator.
     */
    public iterativeDelay(iterDelay: number): IterativeDelay;
    public iterativeDelay(iterDelay?: number): any {
      if (iterDelay === undefined) {
        return this._iterativeDelay;
      } else {
        this._iterativeDelay = iterDelay;
        return this;
      }
    }

  }

}
}
