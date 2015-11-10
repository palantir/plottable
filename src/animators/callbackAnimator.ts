module Plottable.Animators {
  export type AnimateJoinCallback = (joinResult: Drawers.JoinResult
    , attrToAppliedProjector: AttributeToAppliedProjector
    , drawer: Drawer) => void;
  /**
   * Allows the implementation of animate to be passed as a callback function
   * Provides javascript clients that build custom animations
   * with full access to the drawing target, properties of the Drawer (appliedIntializer)
   * and the utility methods provided by Animators.Base
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
     * When Callback invokes the function, 'this' is set to the Callback animator itself
     */
    public animateJoin(joinResult: Drawers.JoinResult, attrToAppliedProjector: AttributeToAppliedProjector, drawer: Drawer): void {
      this.callback().call(this, joinResult, attrToAppliedProjector, drawer);
    }

    // delegate to base in legacy case
    public animate(selection: d3.Selection<any>
      , attrToAppliedProjector: AttributeToAppliedProjector): d3.Selection<any> | d3.Transition<any> {
      return super.animate(selection, attrToAppliedProjector);
    }
    /**
     * Gets the callback animateJoin function.
     * @returns {Callback} The calling Callback Animator.
     */
    public callback(): AnimateJoinCallback;
    /**
     * Sets the callback animateJoin function.
     *
     * @param {AnimateCallback} a function implementing Animator.animateJoin
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
     * 
     * @returns {innerAnimator} The current innerAnimator.
     */
    public innerAnimator(): Animator;
    /**
     * Sets the inner anmator.
     *
     * @param {Animator} an Animator
     * @returns {Callback} The calling Animator.
     */
    public innerAnimator(innerAnimator: Animator): Callback;
    public innerAnimator(innerAnimator?: Animator): any {
      if (innerAnimator == null) {
        return this._innerAnimator;
      } else {
        this._innerAnimator = innerAnimator;
        return this;
      }
    }
    /**
     * Invoke animateJoin on the specified innerAnimator.
     * If no innerAnimator is specified, delegates to Callback's base class
     * (Plottable.Animators.Base)
     * 
     * @param {Drawers.JoinResult} joinResult 
     * @param {AttributeToAppliedProjector} attrToAppliedProjector 
     * @param {Drawer} drawer 
     */
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
