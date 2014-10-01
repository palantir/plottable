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

    /**
     * The start delay between each start of an animation
     */
    public static DEFAULT_TOTAL_DURATION_LIMIT_MILLISECONDS = Infinity;

    private _iterativeDelay: number;
    private _totalDurationLimit: number;

    /**
     * Constructs an animator with a start delay between each selection animation
     *
     * @constructor
     */
    constructor() {
      super();
      this._iterativeDelay = IterativeDelay.DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
      this._totalDurationLimit = IterativeDelay.DEFAULT_TOTAL_DURATION_LIMIT_MILLISECONDS;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      var numberOfIterations = selection[0].length;
      var adjustedIterativeDelay = Math.min(this.iterativeDelay(),
            Math.max(this.totalDurationLimit() - this.duration(), 0) / numberOfIterations);
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay((d: any, i: number) => this.delay() + adjustedIterativeDelay * i)
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
     * This value can be overriden in case of total animation's duration
     * exceeds totalDurationLimit() value.
     * Delay between animation is calculated by following formula:
     * min(iterativeDelay(), 
     *   max(totalDurationLimit() - duration(), 0) / <number of iterations>)
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

    /**
     * Gets the total animation duration limit in milliseconds.
     *
     * @returns {number} The current total animation duration limit.
     */
    public totalDurationLimit(): number;
    /**
     * Sets the total animation duration limit in miliseconds.
     *
     * @param {number} timeLimit The total animation duration limit in milliseconds.
     * @returns {IterativeDelay} The calling IterativeDelay Animator.
     */
    public totalDurationLimit(timeLimit: number): IterativeDelay;
    public totalDurationLimit(timeLimit?: number): any {
      if (timeLimit === undefined) {
        return this._totalDurationLimit;
      } else {
        this._totalDurationLimit = timeLimit;
        return this;
      }
    }
  }

}
}
