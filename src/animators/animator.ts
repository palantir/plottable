module Plottable {
export class EasingFunctions {
  public static atStart = (t: number) => {
    return 1;
  };
  public static atEnd = (t: number) => {
    if (t < 1) return 0;
    return 1;
  };
  public static squEase(easingFunction: string, end: number, start?: number) {
    return (t: number) => {
      if (start === undefined) start = 0;
      let tbar: number;
      if (t < start)
        tbar = 0;
      else {
        if (t > end) {
          tbar = 1;
        } else {
          tbar = (t - start) / (end - start);
        }

        return d3.ease(easingFunction)(tbar);
      }
    };
  }
};
export interface Animator {
  /**
   * Applies the supplied attributes to a d3.Selection with some animation.
   *
   * @param {d3.Selection} selection The update selection or transition selection that we wish to animate.
   * @param {AttributeToAppliedProjector} attrToAppliedProjector The set of
   *     AppliedProjectors that we will use to set attributes on the selection.
   * @return {any} Animators should return the selection or
   *     transition object so that plots may chain the transitions between
   *     animators.
   */
  animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector, drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any>;

  /**
   * Given the number of elements, return the total time the animation requires
   *
   * @param {number} numberofIterations The number of elements that will be drawn
   * @returns {number}
   */
  totalTime(numberOfIterations: number): number;
}

}
