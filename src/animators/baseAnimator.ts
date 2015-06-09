///<reference path="../reference.ts" />

module Plottable {
export module Animators {

  /**
   * The base animator implementation with easing, duration, and delay.
   *
   * The delay between animations can be configured with iterativeDelay().
   * This will be affected if the maxTotalDuration() is used such that the entire animation
   * fits within the timeframe
   *
   * The maximum total animation duration can be configured with maxTotalDuration.
   * It is guaranteed the animation will not exceed this value,
   * by first reducing stepDuration, then iterativeDelay
   *
   * The actual interval delay is calculated by following formula:
   * min(iterativeDelay(),
   *   max(maxTotalDuration() - stepDuration(), 0) / (<number of iterations> - 1)
   */
  export class Base implements Animators.Plot {
    /**
     * The default starting delay of the animation in milliseconds
     */
    public static DEFAULT_START_DELAY_MILLISECONDS = 0;
    /**
     * The default duration of the animation in milliseconds
     */
    public static DEFAULT_STEP_DURATION_MILLISECONDS = 300;
    /**
     * The default maximum start delay between each start of an animation
     */
    public static DEFAULT_ITERATIVE_DELAY_MILLISECONDS = 15;
    /**
     * The default maximum total animation duration
     */
    public static DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS = Infinity;
    /**
     * The default easing of the animation
     */
    public static DEFAULT_EASING = "exp-out";

    private _startDelay: number;
    private _stepDuration: number;
    private _iterativeDelay: number;
    private _maxTotalDuration: number;
    private _easing: string;

    /**
     * Constructs the default animator
     *
     * @constructor
     */
    constructor() {
      this._startDelay = Base.DEFAULT_START_DELAY_MILLISECONDS;
      this._stepDuration = Base.DEFAULT_STEP_DURATION_MILLISECONDS;
      this._iterativeDelay = Base.DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
      this._maxTotalDuration = Base.DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS;
      this._easing = Base.DEFAULT_EASING;
    }

    public totalTime(numberOfIterations: number) {
      var maxDelayForLastIteration = Math.max(this.maxTotalDuration() - this.stepDuration(), 0);
      var adjustedIterativeDelay = Math.min(this.iterativeDelay(), maxDelayForLastIteration / Math.max(numberOfIterations - 1, 1));
      var time = this.startDelay() + adjustedIterativeDelay * (Math.max(numberOfIterations - 1, 0)) + this.stepDuration();
      return time;
    }

    public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector) {
      var numberOfIterations = selection[0].length;
      var maxDelayForLastIteration = Math.max(this.maxTotalDuration() - this.stepDuration(), 0);
      var adjustedIterativeDelay = Math.min(this.iterativeDelay(), maxDelayForLastIteration / Math.max(numberOfIterations - 1, 1));

      return selection.transition()
        .ease(this.easing())
        .duration(this.stepDuration())
        .delay((d: any, i: number) => this.startDelay() + adjustedIterativeDelay * i)
        .attr(attrToAppliedProjector);
    }

    /**
     * Gets the start delay of the animation in milliseconds.
     *
     * @returns {number} The current start delay.
     */
    public startDelay(): number;
    /**
     * Sets the start delay of the animation in milliseconds.
     *
     * @param {number} startDelay The start delay in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public startDelay(startDelay: number): Base;
    public startDelay(startDelay?: number): any {
      if (startDelay == null) {
        return this._startDelay;
      } else {
        this._startDelay = startDelay;
        return this;
      }
    }

    /**
     * Gets the duration of the animation in milliseconds.
     *
     * @returns {number} The current duration.
     */
    public stepDuration(): number;
    /**
     * Sets the duration of the animation in milliseconds.
     *
     * @param {number} duration The duration in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public stepDuration(stepDuration: number): Base;
    public stepDuration(stepDuration?: number): any {
      if (stepDuration == null) {
        return Math.min(this._stepDuration, this._maxTotalDuration);
      } else {
        this._stepDuration = stepDuration;
        return this;
      }
    }

    /**
     * Gets the maximum start delay between animations in milliseconds.
     *
     * @returns {number} The current maximum iterative delay.
     */
    public iterativeDelay(): number;
    /**
     * Sets the maximum start delay between animations in milliseconds.
     *
     * @param {number} maxIterDelay The maximum iterative delay in milliseconds.
     * @returns {Base} The calling Base Animator.
     */
    public iterativeDelay(iterativeDelay: number): Base;
    public iterativeDelay(iterativeDelay?: number): any {
      if (iterativeDelay == null) {
        return this._iterativeDelay;
      } else {
        this._iterativeDelay = iterativeDelay;
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
     * @returns {Base} The calling Base Animator.
     */
    public maxTotalDuration(maxDuration: number): Base;
    public maxTotalDuration(maxDuration?: number): any {
      if (maxDuration == null) {
        return this._maxTotalDuration;
      } else {
        this._maxTotalDuration = maxDuration;
        return this;
      }
    }

    /**
     * Gets the current easing of the animation.
     *
     * @returns {string} the current easing mode.
     */
    public easing(): string;
    /**
     * Sets the easing mode of the animation.
     *
     * @param {string} easing The desired easing mode.
     * @returns {Default} The calling Default Animator.
     */
    public easing(easing: string): Base;
    public easing(easing?: string): any {
      if (easing == null) {
        return this._easing;
      } else {
        this._easing = easing;
        return this;
      }
    }
  }
}
}
