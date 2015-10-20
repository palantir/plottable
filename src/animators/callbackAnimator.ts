module Plottable.Animators {
  export type AnimateCallback = (selection: d3.Selection<any>
    , attrToAppliedProjector: AttributeToAppliedProjector
    , drawingTarget?: Drawers.DrawingTarget
    , drawer?: Drawer) => d3.Selection<any> | d3.Transition<any>;
  /**
   * Allows the implementation of animate to be passed as a callback function
   * Provides javascript clients build custom animations with full access to the drawing target
   */
  export class Callback extends Base implements Animator {
    private _callback: AnimateCallback = (selection: d3.Selection<any>,
      attrToAppliedProjector: AttributeToAppliedProjector
      , drawingTarget?: Drawers.DrawingTarget) => { return drawingTarget.merge; };
    private _innerAnimator: Animator;

    constructor() {
      super();
    }
    /**
     * animate implementation delegates to the callback
     */
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector
      , drawingTarget?: Drawers.DrawingTarget
      , drawer?: Drawer): d3.Selection<any> | d3.Transition<any> {
        return this.callback().call(this, selection, attrToAppliedProjector, drawingTarget, drawer);
    }
    /**
     * Gets the callback animate function.
     * @returns {Callback} The calling Callback Animator.
     */
    public callback(): AnimateCallback;
    /**
     * Sets the attributes for entering elements.
     *
     * @param {AnimateCallback} a function implementing Animator.animate
     * @returns {Callback} The calling Callback Animator.
     */
    public callback(callback: AnimateCallback): Callback;
    public callback(callback?: AnimateCallback): any {
      if (callback == null) {
        return this._callback;
      } else {
        this._callback = callback;
        return this;
      }
    }
    /**
     * Gets an inner animator.
     * callback functions have access to this animator, so callbacks may be designed to
     * wrap another animator
     * @returns {innerAnimator} The current innerAnimator.
     */
    public innerAnimator(): Animator;
    /**
     * Sets the attributes for entering elements.
     *
     * @param {Animator} a function implementing Animator.animate
     * @returns {Callback} The calling innerAnimator Animator.
     */
    public innerAnimator(innerAnimator: Animator): Attr;
    public innerAnimator(innerAnimator?: Animator): any {
      if (innerAnimator == null) {
        return this._innerAnimator;
      } else {
        this._innerAnimator = innerAnimator;
        return this;
      }
    }

    public InnerAnimate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector
      , drawingTarget?: Drawers.DrawingTarget
      , drawer?: Drawer): d3.Selection<any> | d3.Transition < any > {

      if (this.innerAnimator) {
        return this.innerAnimator().animate(selection, attrToAppliedProjector, drawingTarget, drawer);
      } else {
        return super.animate(selection, attrToAppliedProjector, drawingTarget, drawer);
      }
    }
  }
}
