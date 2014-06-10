///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * The default animator implementation with easing, duration, and delay.
   */
  export class DefaultAnimator implements IPlotAnimator {
    public _durationMsec: Number = 300;
    public _delayMsec: Number    = 0;
    public _easing: string       = "exp-out";

    public animate(selection: any, attrToProjector: Abstract.IAttributeToProjector, plot: Abstract.Plot): any {
      return selection.transition()
        .ease(this._easing)
        .duration(this._durationMsec)
        .delay(this._delayMsec)
        .attr(attrToProjector);
    }

    /**
     * Gets or sets the duration of the animation in milliseconds.
     *
     * @param {Number} duration The duration in milliseconds.
     * @return {Number|DefaultAnimator} Returns this object for chaining or
     *     the current duration if no argument is supplied.
     */
    public duration(): Number;
    public duration(duration: Number): DefaultAnimator;
    public duration(duration?: Number): any{
      if (duration == null) {
        return this._durationMsec;
      } else {
        this._durationMsec = duration;
        return this;
      }
    }

    /**
     * Gets or sets the delay of the animation in milliseconds.
     *
     * @param {Number} delay The delay in milliseconds.
     * @return {Number|DefaultAnimator} Returns this object for chaining or
     *     the current delay if no argument is supplied.
     */
    public delay(): Number;
    public delay(delay: Number): DefaultAnimator;
    public delay(delay?: Number): any{
      if (delay == null) {
        return this._delayMsec;
      } else {
        this._delayMsec = delay;
        return this;
      }
    }

    /**
     * Gets or sets the easing string of the animation in milliseconds.
     *
     * @param {string} easing The easing string.
     * @return {string|DefaultAnimator} Returns this object for chaining or
     *     the current easing string if no argument is supplied.
     */
    public easing(): string;
    public easing(easing: string): DefaultAnimator;
    public easing(easing?: string): any{
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
