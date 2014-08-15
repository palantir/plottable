///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class Default implements IPlotAnimator {
    public _durationMsec: Number = 300;
    public _delayMsec: Number    = 0;
    public _easing: string       = "exp-out";

    public animate(selection: any, attrToProjector: IAttributeToProjector, plot: Abstract.Plot): any {
      return selection.transition()
        .ease(this._easing)
        .duration(this._durationMsec)
        .delay(this._delayMsec)
        .attr(attrToProjector);
    }

    /**
     * Gets the duration of the animation in milliseconds.
     *
     * @returns {Number} The current duration.
     */
    public duration(): Number;
    /**
     * Sets the duration of the animation in milliseconds.
     *
     * @param {Number} duration The duration in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public duration(duration: Number): Default;
    public duration(duration?: Number): any{
      if (duration === undefined) {
        return this._durationMsec;
      } else {
        this._durationMsec = duration;
        return this;
      }
    }

    /**
     * Gets the delay of the animation in milliseconds.
     *
     * @returns {Number} The current delay.
     */
    public delay(): Number;
    /**
     * Sets the delay of the animation in milliseconds.
     *
     * @param {Number} delay The delay in milliseconds.
     * @returns {Default} The calling Default Animator.
     */
    public delay(delay: Number): Default;
    public delay(delay?: Number): any{
      if (delay === undefined) {
        return this._delayMsec;
      } else {
        this._delayMsec = delay;
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
    public easing(easing: string): Default;
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
