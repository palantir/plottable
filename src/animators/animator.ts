module Plottable {
export module Animators {
  export type EasingFunction = (t: number) => number;
  export type EasingFunctionSpecifier = string|EasingFunction;
  export class EasingFunctions {
    public static atStart = (t: number) => {
      return 1;
    };
    public static atEnd = (t: number) => {
      if (t < 1) {
        return 0;
      };
      return 1;
    };
    public static squEase(easingFunction: EasingFunctionSpecifier, start: number, end: number): EasingFunction {
      return (t: number) => {
        if (start === undefined) {
          start = 0;
        };
        if (t >= end) {
            return 1;
        }
        if (t <= start) {
          return 0;
        }
        let tbar = (t - start) / (end - start);
        if (typeof (easingFunction) === "string") {
          easingFunction = d3.ease(<string>easingFunction);
        }
        return (<EasingFunction>easingFunction)(tbar);
      };
    }
  }
}
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
  animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector,
    drawingTarget?: Drawers.DrawingTarget, drawer?: Drawer): d3.Selection<any> | d3.Transition<any>;

  /**
   * Given the number of elements, return the total time the animation requires
   *
   * @param {number} numberofIterations The number of elements that will be drawn
   * @returns {number}
   */
  totalTime(numberOfIterations: number): number;
}

}
