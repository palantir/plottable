///<reference path="../reference.ts" />
module Plottable {
  export module Animators {

    /**
     * Base for animators that animate specific attributes, such as Opacity, height... .
     */
    export class Attr extends Base implements Animator {

      private _startAttrs: AttributeToAppliedProjector;
      private _end: AttributeToAppliedProjector;

      public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector, drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {

        // first make the attr to apply to the enter selection before transition
        // this is attrToAppliedProjector + _start
        let startProjector: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, this.startAttrs());
        drawingTarget.enter = this.getTransition(drawingTarget.enter, 0)
          .attr(startProjector);

        drawingTarget.exit = this.getTransition(drawingTarget.exit, this.stepDuration(), this.delay(drawingTarget.exit))
          .attr(startProjector);

        // now we can call the base class which will append the remove() to the end of the exit transition
        return super.animate(selection, attrToAppliedProjector, drawingTarget);
      }
      /**
      * Gets the attributes for entering elements. These are overlaid over 
      * the target atr and 
      * @returns {number} The current start delay.
      */
      public startAttrs(): AttributeToAppliedProjector;
      /**
       * Sets the attributes for entering elements. T
       *
       * @param {startAttrs} startDelay The start delay in milliseconds.
       * @returns {Attr} The calling Attr Animator.
       */
      public startAttrs(startAttrs: AttributeToAppliedProjector): Attr;
      public startAttrs(startAttrs?: AttributeToAppliedProjector): any {
        if (startAttrs == null) {
          return this._startAttrs;
        } else {
          this._startAttrs = startAttrs;
          return this;
        }
      }
    }
  }
}