module Plottable.Animators {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements Animator {

    public totalTime(selection: any) {
      return 0;
    }
    public animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void {
      joinResult.exit
        .remove();
      joinResult.merge
        .attr(attrToAppliedProjector);
    }
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any> {
        return selection.attr(attrToAppliedProjector);
    }
  }
}
