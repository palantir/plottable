///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  export interface IPlotAnimator {
    /**
     * Applies the supplied attributes to a D3.Selection with some animation.
     *
     * @param {D3.Selection} selection The update selection or transition selection that we wish to animate.
     * @param {IAttributeToProjector} attrToProjector The set of
     *     IAccessors that we will use to set attributes on the selection.
     * @return {any} Animators should return the selection or
     *     transition object so that plots may chain the transitions between
     *     animators.
     */
    animate(selection: any, attrToProjector: IAttributeToProjector): any;
  }

  export interface IPlotAnimatorMap {
    [animatorKey: string] : IPlotAnimator;
  }

}
}
