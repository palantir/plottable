module Plottable.Animators {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements Animator {

    public totalTime(selection: any) {
      return 0;
    }
    public animate(drawingTarget: Drawers.DrawingTarget, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void;
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any>;

    public animate(drawingTarget: any, attrToAppliedProjector: AttributeToAppliedProjector): any {

      if (!Array.isArray(drawingTarget)) {
        drawingTarget.exit
          .remove();
        return drawingTarget.merge
          .attr(attrToAppliedProjector);
      } else {
        // legacy compatibility
        return drawingTarget.attr(attrToAppliedProjector);
      }
    }
  }
}
