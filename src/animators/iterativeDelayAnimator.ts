///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator that delays the animation of the attributes using the index
   * of the selection data.
   *
   * The delay between animations can be configured with the .delay getter/setter.
   */
  export class IterativeDelay extends Default {
    _delayMsec = 15;

    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      return selection.transition()
        .ease(this._easing)
        .duration(this._durationMsec)
        .delay((d: any, i: number) => this.delay() + i * this._delayMsec)
        .attr(attrToProjector);
    }
  }

}
}
