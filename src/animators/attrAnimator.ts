module Plottable.Animators {
  /**
   * Base for animators that animate specific attributes, such as Opacity, height... .
   */
  export class Attr extends Base implements Animator {

    private _startAttrs: AttributeToAppliedProjector;
    private _endAttrs: AttributeToAppliedProjector;
    private _exitEasingMode: EasingFunctionSpecifier;

    public animate(selection: d3.Selection<any>,
      attrToAppliedProjector: AttributeToAppliedProjector
      , drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {

      // first make the attr to apply to the enter selection before transition
      // this is attrToAppliedProjector + _start
      let startProjector: AttributeToAppliedProjector = this.mergeAttrs(attrToAppliedProjector, this.startAttrs());
      let endProjector: AttributeToAppliedProjector = this.endAttrs() || this.startAttrs();
      drawingTarget.enter = this.getTransition(drawingTarget.enter, 0)
        .attr(startProjector);

      drawingTarget.exit = this.getTransition(drawingTarget.exit, this.stepDuration(),
        this.delay(drawingTarget.exit), this.exitEasingMode())
        .attr(endProjector);

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
     * Sets the attributes for entering elements.
     *
     * @param {startAttrs} A collection of attribuets applied to entering elements.
     * These are applied over the top of the attributes pass to the animate method
     * Any attribute passed to startAttrs will transition to its final value
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
    /**
     * Gets the attributes for exiting elements.
     * Exisitng elements will transition to these attribuest before being removed
     * @returns {AttributeToAppliedProjector} The current exiting attributes.
     */
    public endAttrs(): AttributeToAppliedProjector;
    /**
     * Sets the attributes for entering elements.
     *
     * @param {endAttrs} A collection of attribuets applied to entering elements.
     * These are applied over the top of the attributes pass to the animate method
     * Any attribute passed to endAttrs will transition to its final value
     * @returns {Attr} The calling Attr Animator.
     */
    public endAttrs(endAttrs: AttributeToAppliedProjector): Attr;
    public endAttrs(endAttrs?: AttributeToAppliedProjector): any {
      if (endAttrs == null) {
        return this._endAttrs;
      } else {
        this._endAttrs = endAttrs;
        return this;
      }
    }

    /**
     * gets the easing mode for exiting elements.
     * Existing elements will transition out using this easing mode before being removed
     * if not specified, easingMode() is used
     * @returns {EasingFunctionSpecifier} The current exiting Easing mode.
     */
    public exitEasingMode(): EasingFunctionSpecifier;
    /**
     * easing mode for exiting elements
     *
     * @param {EasingFunctionSpecifier} The easing function, or d3 easing function name.
     * Animations may separate the activity on entering and easing elements by using
     * the squEase easing function over different intervals.
     *
     * @returns {Attr} The calling Attr Animator.
     */
    public exitEasingMode(exitEasingMode: EasingFunctionSpecifier): Attr;
    public exitEasingMode(exitEasingMode?: EasingFunctionSpecifier): any {
      if (exitEasingMode == null) {
        return this._exitEasingMode;
      } else {
        this._exitEasingMode = exitEasingMode;
        return this;
      }
    }

  }
}
