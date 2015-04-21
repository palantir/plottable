///<reference path="../reference.ts" />

module Plottable {
export module Interaction {

  export type ScrollCallback = (p: Point, deltaAmount: number) => any;

  export class Scroll extends Interaction.AbstractInteraction {

    /**
     * The number of pixels occupied in a line.
     */
    public static PIXELS_PER_LINE = 120;

    private _mouseDispatcher: Dispatcher.Mouse;
    private _scrollCallback: ScrollCallback;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onWheel("Interaction.Scroll" + this.getID(), (p: Point, e: WheelEvent) => this._handleScrollEvent(p, e));
    }

    private _handleScrollEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        if (this._scrollCallback) {
          e.preventDefault();
          var deltaPixelAmount = e.deltaY * (e.deltaMode ? Scroll.PIXELS_PER_LINE : 1);
          this._scrollCallback(translatedP, deltaPixelAmount);
        }
      }
    }

    /**
     * Gets the callback called when a scroll occurs
     *
     * @return {ScrollCallback} The current callback.
     */
    public onScroll(): ScrollCallback;
    /**
     * Sets the callback called when a scroll occurs
     *
     * @param {ScrollCallback} callback The callback to set.
     * @return {Interaction.Scroll} The calling Interaction.Scroll.
     */
    public onScroll(callback: ScrollCallback): Interaction.Scroll;
    public onScroll(callback?: ScrollCallback): any {
      if (callback === undefined) {
        return this._scrollCallback;
      }
      this._scrollCallback = callback;
      return this;
    }

  }
}
}
