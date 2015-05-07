///<reference path="../reference.ts" />

module Plottable {

export type ClickCallback = (point: Point) => any;

export module Interactions {
  export class Click extends Interaction {

    private _mouseDispatcher: Plottable.Dispatchers.Mouse;
    private _touchDispatcher: Plottable.Dispatchers.Touch;
    private _clickedDown = false;
    private _onClickCallbacks = new Utils.CallbackSet<ClickCallback>();

    protected _anchor(component: Component) {
      super._anchor(component);

      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown((p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp((p: Point) => this._handleClickUp(p));

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart((ids, idToPoint) => this._handleClickDown(idToPoint[ids[0]]));
      this._touchDispatcher.onTouchEnd((ids, idToPoint) => this._handleClickUp(idToPoint[ids[0]]));
      this._touchDispatcher.onTouchCancel((ids, idToPoint) => this._clickedDown = false);
    }

    private _handleClickDown(p: Point) {
      var translatedPoint = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedPoint)) {
        this._clickedDown = true;
      }
    }

    private _handleClickUp(p: Point) {
      var translatedPoint = this._translateToComponentSpace(p);
      if (this._clickedDown && this._isInsideComponent(translatedPoint)) {
        this._onClickCallbacks.callCallbacks(translatedPoint);
      }
      this._clickedDown = false;
    }

    /**
     * Sets the callback called when the Component is clicked.
     *
     * @param {ClickCallback} callback The callback to set.
     * @return {Interaction.Click} The calling Interaction.Click.
     */
    public onClick(callback: ClickCallback) {
      this._onClickCallbacks.add(callback);
      return this;
    }

    /**
     * Removes the callback from click.
     *
     * @param {ClickCallback} callback The callback to remove.
     * @return {Interaction.Click} The calling Interaction.Click.
     */
    public offClick(callback: ClickCallback) {
      this._onClickCallbacks.delete(callback);
      return this;
    }
  }
}
}
