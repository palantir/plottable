///<reference path="../reference.ts" />

module Plottable {
export module Animators {

   /**
    * An animator implementation with no animation. The attributes are
    * immediately set on the selection.
    */
  export class Null implements Animator {

    public totalTime(selection: any) {
      return 0;
    }
    public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector, drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {

      if (drawingTarget) {
        drawingTarget.exit
          .remove();
        return drawingTarget.merge
          .attr(attrToAppliedProjector);
      } else {
        // legacy compatibility
        return selection.attr(attrToAppliedProjector);
      }
    }
  }
}
}