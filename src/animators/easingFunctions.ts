namespace Plottable.Animators {
  export type d3SelectionOrTransition = d3.Selection<any> | d3.Transition<any>;

  export type EasingFunction = (t: number) => number;
  export type EasingFunctionSpecifier = string | EasingFunction;
  /**
   * Custom easing functions. these are designed to co-ordinate the timing of
   * actvities on two or more transitions that are active simultaneously
   * (on different selections)
   * These are designed to help animators schedule animations between
   * the enter, update and exit selections - each can have a transition of the same duration,
   * but the actual timing of activity will be determined by the easing function.
   */
  export class EasingFunctions {
    /**
     * atStart
     * An EasingFunction that applies all attributes at once at the start of the transition;
     * ie this creates a "wait" after applying the attributes.
     */
    public static atStart = (t: number) => {
      return 1;
    };
    /**
     * atEnd
     * An EasingFunction that applies all attributes at once at the end of the transition;
     * ie this creates a "wait" before applying the attributes.
     */
    public static atEnd = (t: number) => {
      if (t < 1) {
        return 0;
      };
      return 1;
    };
    /**
     * squEase
     * squEase ("squeezing ease") applies the transition squeezed into a subinterval [a,b] where 0 <= a <= b <= 1.
     * The actual easing to apply in that interval is passed as an argument.
     * @param easingFunction {EasingFunctionSpecifier} an easing function, or the string descriptor
     * of a d3 built-in easing function ( as used by d3.ease())
     * @param start {number} value between 0 and 1 at which the animation starts
     * @param end  {end} value between start and 1 at which the animation ends
     * Note that if start == end, the are applied instanteously at that point and the
     * easingFunction parameter is not relevant. In particular start == end == 0 is the
     * same as atStart
     * @returns {EasingFunction} An easing function that can be applied to a d3 transition.
     */
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
        if (typeof easingFunction === "string") {
          return d3.ease(easingFunction)(tbar);
        }
        return (<EasingFunction>easingFunction)(tbar);
      };
    }
  }
}
