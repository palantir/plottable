///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The base animator implementation with easing, duration, and delay.
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
     * The default easing of the animation
     */
    public static DEFAULT_EASING = "exp-out";

    private _duration: number;
    private _delay: number;
    private _easing: string;

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

    public animate(selection: any, attrToProjector: AttributeToProjector): D3.Selection {
      return selection.transition()
        .ease(this.easing())
        .duration(this.duration())
        .delay(this.delay())
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
  }

}
}
