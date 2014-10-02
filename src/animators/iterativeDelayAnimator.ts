///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator that delays the animation of the attributes using the index
   * of the selection data.
   *
   * The maximal delay between animations can be configured with the .maxIterativeDelay getter/setter.
   *
   * The maximum total animation duration can be configured with the .maxTotalDuration getter/setter.
   * maxTotalDuration does NOT set actual total animation duration.
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
     * The default maximum total animation duration
     */
    public static DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS = Infinity;

    private _maxIterativeDelay: number;
    private _maxTotalDuration: number;

    /**
     * Constructs an animator with a start delay between each selection animation
     *
     * @constructor
     */
    constructor() {
      super();
      this._maxIterativeDelay = IterativeDelay.DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS;
      this._maxTotalDuration = IterativeDelay.DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS;
    }

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      var numberOfIterations = selection[0].length;
      var maxIterativeDelay = this.maxIterativeDelay();
      var maxDelayForLastIteration = Math.max(this.maxTotalDuration() - this.duration(), 0);
      var adjustedIterativeDelay = Math.min(maxIterativeDelay, maxDelayForLastIteration / numberOfIterations);
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay((d: any, i: number) => this.delay() + adjustedIterativeDelay * i)
        .attr(attrToProjector);
    }

    /**
     * Gets the maximum start delay between animations in milliseconds.
     *
     * @returns {number} The current maximum iterative delay.
     */
    public maxIterativeDelay(): number;
    /**
     * Sets the maximum start delay between animations in milliseconds.
     *
     * @param {number} maxIterDelay The maximum iterative delay in milliseconds.
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
     * Gets the maximum total animation duration in milliseconds.
     *
     * @returns {number} The current maximum total animation duration.
     */
    public maxTotalDuration(): number;
    /**
     * Sets the maximum total animation duration in miliseconds.
     *
     * @param {number} maxDuration The maximum total animation duration in milliseconds.
     * @returns {IterativeDelay} The calling IterativeDelay Animator.
     */
    public maxTotalDuration(maxDuration: number): IterativeDelay;
    public maxTotalDuration(maxDuration?: number): any {
      if (maxDuration == null) {
        return this._maxTotalDuration;
      } else {
        this._maxTotalDuration = maxDuration;
        return this;
      }
    }
  }

}
}
