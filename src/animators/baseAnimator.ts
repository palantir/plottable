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
     * The default duration of one animation step in milliseconds
     */
    public static DEFAULT_STEP_DURATION_MILLISECONDS = 300;
    /**
     * The default maximum start delay between each step of an animation
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

    public totalTime(numberOfSteps: number) {
      var adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);
      return this.startDelay() + adjustedIterativeDelay * (Math.max(numberOfSteps - 1, 0)) + this.stepDuration();
    }

    public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector) {
      var numberOfSteps = selection[0].length;
      var adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);

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
     * @returns {Base} The calling Base Animator.
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
     * Gets the duration of one animation step in milliseconds.
     *
     * @returns {number} The current duration.
     */
    public stepDuration(): number;
    /**
     * Sets the duration of one animation step in milliseconds.
     *
     * @param {number} stepDuration The duration in milliseconds.
     * @returns {Base} The calling Base Animator.
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
     * Gets the maximum start delay between animation steps in milliseconds.
     *
     * @returns {number} The current maximum iterative delay.
     */
    public iterativeDelay(): number;
    /**
     * Sets the maximum start delay between animation steps in milliseconds.
     *
     * @param {number} iterativeDelay The maximum iterative delay in milliseconds.
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
     * Gets the maximum total animation duration constraint in milliseconds.
     *
     * @returns {number} The current maximum total animation duration.
     */
    public maxTotalDuration(): number;
    /**
     * Sets the maximum total animation duration constraint in miliseconds.
     *
     * @param {number} maxTotalDuration The maximum total animation duration in milliseconds.
     * @returns {Base} The calling Base Animator.
     */
    public maxTotalDuration(maxTotalDuration: number): Base;
    public maxTotalDuration(maxTotalDuration?: number): any {
      if (maxTotalDuration == null) {
        return this._maxTotalDuration;
      } else {
        this._maxTotalDuration = maxTotalDuration;
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
     * @returns {Base} The calling Base Animator.
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

    /**
     * Adjust the iterative delay, such that it takes into account the maxTotalDuration constraint
     */
    private _getAdjustedIterativeDelay(numberOfSteps: number) {
      var stepStartTimeInterval = this.maxTotalDuration() - this.stepDuration();
      stepStartTimeInterval = Math.max(stepStartTimeInterval, 0);
      var maxPossibleIterativeDelay = stepStartTimeInterval / Math.max(numberOfSteps - 1, 1)
      return Math.min(this.iterativeDelay(), maxPossibleIterativeDelay);
    }
  }
}
}
