module Plottable.Animators {
  /**
   * Fade in  fade out the entering  exiting elements by transitioning opacity
   */
  export class Opacity extends Attr implements Animator {
    private _startOpacity: number;
    private _endOpacity: number;

    constructor(startOpacity?: number, endOpacity?: number) {
      super();
      startOpacity = startOpacity || 0;
      this.startOpacity(startOpacity);
      endOpacity = endOpacity || 0;
      this.endOpacity(endOpacity);
    }

    /**
     * Sets the starting opacity for entering elements.
     *
     * @returns {number} The current start opacity.
     */
    public startOpacity(): number;
    /**
     * Sets the starting opacity for entering elements.
     *
     * @param {number} startOpacity The opacity to apply to new elements.
     * @returns {Opacity} The calling Animator.
     */
    public startOpacity(startOpacity: number): Opacity;
    public startOpacity(startOpacity?: number): any {
      if (startOpacity == null) {
        return this._startOpacity;
      } else {
        this._startOpacity = startOpacity;
        this.startAttrs({ opacity: () => { return startOpacity; } });
        return this;
      }
    }
    /**
     * Sets the ending opacity for exiting elements.
     *
     * @returns {number} The current end opacity.
     */
    public endOpacity(): number;
    /**
     * Sets the ending opacity for entering elements.
     *
     * @param {number} endOpacity The opacity to transition to exiting elements.
     * @returns {Opacity} The calling Animator.
     */
    public endOpacity(endOpacity: number): Opacity;
    public endOpacity(endOpacity?: number): any {
      if (endOpacity == null) {
        return this._endOpacity;
      } else {
        this._endOpacity = endOpacity;
        this.endAttrs({ opacity: () => { return endOpacity; } });

        return this;
      }
    }
  }
}
