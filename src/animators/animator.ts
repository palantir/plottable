///<reference path="../reference.ts" />

module Plottable {

  export interface Animator {
    /**
     * Applies the supplied attributes to a d3.Selection with some animation.
     *
     * @param {d3.Selection} selection The update selection or transition selection that we wish to animate.
     * @param {{ [attr: string]: (datum: any, index: number) => any; })} attrToAppliedProjector
     *     An object that maps attributes to functions that generate attribute values.
     * @return {any} Animators should return the Selection or
     *     Transition object so that plots may chain the transitions between
     *     Animators.
     */
    animate(selection: d3.Selection<any>,
            attrToAppliedProjector: { [attr: string]: (datum: any, index: number) => any; }
           ): d3.Selection<any> | d3.Transition<any>;

    /**
     * Given the number of elements, return the total time the animation requires
     *
     * @param {number} numberofIterations The number of elements that will be drawn
     * @returns {number}
     */
    totalTime(numberOfIterations: number): number;
  }

}
