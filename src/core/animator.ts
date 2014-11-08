///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  export interface PlotAnimator {
    /**
     * Applies the supplied attributes to a D3.Selection with some animation.
     *
     * @param {D3.Selection} selection The update selection or transition selection that we wish to animate.
     * @param {AttributeToProjector} attrToProjector The set of
     *     IAccessors that we will use to set attributes on the selection.
     * @return {any} Animators should return the selection or
     *     transition object so that plots may chain the transitions between
     *     animators.
     */
    animate(selection: any, attrToProjector: AttributeToProjector): any;

    /**
     * Given the number of elements, return the total time the animation requires
     * @param number numberofIterations The number of elements that will be drawn
     * @returns {any} The time required for the animation
     */
    getTiming(numberOfIterations: number): number;
  }

  export interface PlotAnimatorMap {
    [animatorKey: string] : PlotAnimator;
  }

}
}
