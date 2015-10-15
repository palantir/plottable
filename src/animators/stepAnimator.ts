module Plottable {
export module Animators {

  /**
   * Execute a set of animators in sequence.
   */
  export class Step extends Base implements Animator {

    private _frames: Animator[];

    public animate(selection: d3.Selection<any>,
      attrToAppliedProjector: AttributeToAppliedProjector
      , drawingTarget?: Drawers.DrawingTarget): d3.Selection<any> | d3.Transition<any> {
      this._frames.forEach((frame) => { frame.animate(selection, attrToAppliedProjector, drawingTarget); });
    }

    /**
     * get an array of Animators to execute in sequence
     * @returns {number} The current collection.
     */
    public frames(): Animator[];
    /**
     * Sets the attributes for entering elements. 
     *
     * @param {frame} A collection of attribuets applied to entering elements.
     * These are applied over the top of the attributes pass to the animate method
     * Any attribute passed to frame will transition to its final value
     * @returns {Attr} The calling Attr Animator.
     */
    public frames(frames: Animator[]): Step;
    public frames(frames?: Animator[]): any {
      if (frames == null) {
        return this._frames;
      } else {
        this._frames = frames;
        return this;
      }
    }
  }
}
}
