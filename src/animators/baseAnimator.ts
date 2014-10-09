///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The base animator implementation with easing, duration, and delay.
   *
   * The maximum delay between animations can be configured with maxIterativeDelay.
   *
   * The maximum total animation duration can be configured with maxTotalDuration.
   * maxTotalDuration does not set actual total animation duration.
   *
   * The actual interval delay is calculated by following formula:
   * min(maxIterativeDelay(),
   *   max(maxTotalDuration() - duration(), 0) / <number of iterations>)
   */
  export class Base implements PlotAnimator {
    /**
     * The default duration of the animation in milliseconds
     */
    public static DEFAULT_DURATION_MILLISECONDS = 300;
    /**
     * The default starting delay of the animation in milliseconds
     */
    public static DEFAULT_DELAY_MILLISECONDS = 0;
    /**
     * The default maximum start delay between each start of an animation
     */
    public static DEFAULT_MAX_ITERATIVE_DELAY_MILLISECONDS = 15;
    /**
     * The default maximum total animation duration
     */
    public static DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS = 600;
    /**
     * The default easing of the animation
     */
    public static DEFAULT_EASING = "exp-out";

    private _duration: number;
    private _delay: number;
    private _easing: string;
    private _maxIterativeDelay: number;
    private _maxTotalDuration: number;

    /**
     * Constructs the default animator
     *
     * @constructor
     */
    constructor() {
      this._duration = Base.DEFAULT_DURATION_MILLISECONDS;
      this._delay = Base.DEFAULT_DELAY_MILLISECONDS;
      this._easing = Base.DEFAULT_EASING;
    }

    public animate(selection: any, attrToProjector: AttributeToProjector): D3.Transition.Transition {
      var numberOfIterations = selection[0].length - 1;
      var maxDelayForLastIteration = Math.max(this.maxTotalDuration() - this.duration(), 0);
      var adjustedIterativeDelay = Math.min(this.maxIterativeDelay(), maxDelayForLastIteration / numberOfIterations);
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay((d: any, i: number) => this.delay() + adjustedIterativeDelay * i)
        .attr(attrToProjector);
    }

    /**
     * Gets the duration of the animation in milliseconds.
     *
     * @returns {number} The current duration.
     */
    public duration(): number;
    /**
     * Sets the duration of the animation in milliseconds.
     *
     * @param {number} duration The duration in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public duration(duration: number): Base;
    public duration(duration?: number): any{
      if (duration === undefined) {
        return this._duration;
      } else {
        this._duration = duration;
        return this;
      }
    }

    /**
     * Gets the delay of the animation in milliseconds.
     *
     * @returns {number} The current delay.
     */
    public delay(): number;
    /**
     * Sets the delay of the animation in milliseconds.
     *
     * @param {number} delay The delay in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public delay(delay: number): Base;
    public delay(delay?: number): any{
      if (delay === undefined) {
        return this._delay;
      } else {
        this._delay = delay;
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
    public easing(easing?: string): any{
      if (easing === undefined) {
        return this._easing;
      } else {
        this._easing = easing;
        return this;
      }
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
     * @returns {Base} The calling Base Animator.
     */
    public maxIterativeDelay(maxIterDelay: number): Base;
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
  }

}
}
