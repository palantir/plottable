module Plottable.Animators {

  /**
   * Base for animators that animate specific attributes, such as Opacity, height... .
   */
  export class Reset extends Base implements Animator {

    public animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void {
      joinResult.merge
        .attr(drawer.appliedInitializer());
      // now we can call the base class which will append the remove() to the end of the exit transition
      super.animateJoin(joinResult, attrToAppliedProjector, drawer);
    }
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any> {
        // can't do anything special
        return super.animate(selection, attrToAppliedProjector);
    }
  }
}
