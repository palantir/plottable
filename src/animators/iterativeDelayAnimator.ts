///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator that delays the animation of the attributes using the index
   * of the selection data.
   *
   * The maximal delay between animations can be configured with the .maxIterativeDelay getter/setter.
   *
   * The limit for total animation duration can be configured with the .totalDurationLimit getter/setter.
   * totalDurationLimit does NOT set actual total animation duration.
   *
   * The actual interval delay is calculated by following formula:
   * min(maxIterativeDelay(), 
   *   max(totalDurationLimit() - duration(), 0) / <number of iterations>)
   */
  export class IterativeDelay extends Base {
    /**
     * The default maximal start delay between each start of an animation
     */
    public static DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS = 15;

    /**
     * The default total animation duration limit
     */
    public static DEFAULT_TOTAL_DURATION_LIMIT_MILLISECONDS = Infinity;

    private _maxIterativeDelay: number;
    private _totalDurationLimit: number;

    /**
     * Constructs an animator with a start delay between each selection animation
     *
     * @constructor
     */
    constructor() {
      super();
      this._maxIterativeDelay = IterativeDelay.DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS;
      this._totalDurationLimit = IterativeDelay.DEFAULT_TOTAL_DURATION_LIMIT_MILLISECONDS;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      var numberOfIterations = selection[0].length;
      var maxIterativeDelay = this.maxIterativeDelay();
      var maxDelayForLastIteration = Math.max(this.totalDurationLimit() - this.duration(), 0);
      var adjustedIterativeDelay = Math.min(maxIterativeDelay, maxDelayForLastIteration / numberOfIterations);
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
    public maxIterativeDelay(): number;
    /**
     * Sets the maximal start delay between animations in milliseconds.
     *
     * @param {number} maxIterDelay The maximal iterative delay in milliseconds.
     * @returns {IterativeDelay} The calling IterativeDelay Animator.
     */
    public maxIterativeDelay(maxIterDelay: number): IterativeDelay;
    public maxIterativeDelay(maxIterDelay?: number): any {
      if (maxIterDelay === undefined) {
        return this._maxIterativeDelay;
      } else {
        this._maxIterativeDelay = maxIterDelay;
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
      if (timeLimit == null) {
        return this._totalDurationLimit;
      } else {
        this._totalDurationLimit = timeLimit;
        return this;
      }
    }
  }

}
}
