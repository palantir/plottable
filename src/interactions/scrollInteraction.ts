///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Scroll extends Interaction.AbstractInteraction {
    private _mouseDispatcher: Dispatcher.Mouse;
    private _scrollCallback: (p: Point, deltaAmount: number) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onWheel("Interaction.Scroll" + this.getID(), (p: Point, e: WheelEvent) => this._handleScrollEvent(p, e));
    }

    private _handleScrollEvent(p: Point, e: WheelEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        if (this._scrollCallback) {
          var deltaPixelAmount = e.deltaY * (e.deltaMode ? 120 : 1);
          this._scrollCallback(translatedP, deltaPixelAmount);
        }
      }
    }

    /**
     * Gets the callback called when a scroll occurs
     *
     * @return {(p: Point, deltaAmount: number) => any} The current callback.
     */
    public onScroll(): (p: Point, deltaAmount: number) => any;
    /**
     * Sets the callback called when a scroll occurs
     *
     * @param {(p: Point, deltaAmount: number) => any} callback The callback to set.
     * @return {Interaction.Scroll} The calling Interaction.Scroll.
     */
    public onScroll(callback: (p: Point, deltaAmount: number) => any): Interaction.Scroll;
    public onScroll(callback?: (p: Point, deltaAmount: number) => any): any {
      if (callback === undefined) {
        return this._scrollCallback;
      }
      this._scrollCallback = callback;
      return this;
    }

  }
}
}
