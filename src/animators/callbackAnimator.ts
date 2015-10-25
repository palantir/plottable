module Plottable.Animators {
  export type AnimateJoinCallback = (joinResult: Drawers.JoinResult
    , attrToAppliedProjector: AttributeToAppliedProjector
    , drawer: Drawer) => void;
  /**
   * Allows the implementation of animate to be passed as a callback function
   * Provides javascript clients that build custom animations
   * with full access to the drawing target and properties of the Drawer (appliedIntializer)
   */
  export class Callback extends Base implements Animator {
    private _callback: AnimateJoinCallback = (joinResult: Drawers.JoinResult
      , attrToAppliedProjector: AttributeToAppliedProjector
      , drawer: Drawer) => { return; };
    private _innerAnimator: Animator;

    constructor() {
      super();
    }
    /**
     * animateJoin implementation delegates to the callback
     */
    public animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void {
      this.callback().call(this, joinResult, attrToAppliedProjector, drawer);
    }
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any>;

    public animate(joinResult: any, attrToAppliedProjector: AttributeToAppliedProjector, drawer?: Drawer): any {
        return ;
    }
    /**
     * Gets the callback animate function.
     * @returns {Callback} The calling Callback Animator.
     */
    public callback(): AnimateJoinCallback;
    /**
     * Sets the attributes for entering elements.
     *
     * @param {AnimateCallback} a function implementing Animator.animate
     * @returns {Callback} The calling Callback Animator.
     */
    public callback(callback: AnimateJoinCallback): Callback;
    public callback(callback?: AnimateJoinCallback): any {
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
     * @param {Animator} an Animator
     * @returns {Callback} The calling Animator.
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

    public innerAnimate(joinResult: Drawers.JoinResult
      , attrToAppliedProjector: AttributeToAppliedProjector
      , drawer: Drawer): void {

      if (this.innerAnimator) {
        return this.innerAnimator().animateJoin(joinResult, attrToAppliedProjector, drawer);
      } else {
        return super.animateJoin(joinResult, attrToAppliedProjector, drawer);
      }
    }
  }
}
