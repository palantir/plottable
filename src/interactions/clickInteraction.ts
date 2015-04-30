///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Click extends Interaction {

    private _mouseDispatcher: Plottable.Dispatchers.Mouse;
    private _touchDispatcher: Plottable.Dispatchers.Touch;
    private _clickCallback: (p: Point) => any;
    private _clickedDown = false;

    public _anchor(component: Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.Click" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp("Interaction.Click" + this.getID(), (p: Point) => this._handleClickUp(p));

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart("Interaction.Click" + this.getID(), (ids, idToPoint) =>
                                                                               this._handleClickDown(idToPoint[ids[0]]));
      this._touchDispatcher.onTouchEnd("Interaction.Click" + this.getID(), (ids, idToPoint) =>
                                                                               this._handleClickUp(idToPoint[ids[0]]));
      this._touchDispatcher.onTouchCancel("Interaction.Click" + this.getID(), (ids, idToPoint) =>
                                                                               this._clickedDown = false);
    }

    private _handleClickDown(p: Point) {
      var translatedPoint = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedPoint)) {
        this._clickedDown = true;
      }
    }

    private _handleClickUp(p: Point) {
      var translatedPoint = this._translateToComponentSpace(p);
      if (this._clickedDown && this._isInsideComponent(translatedPoint) && (this._clickCallback != null)) {
        this._clickCallback(translatedPoint);
      }
      this._clickedDown = false;
    }

    /**
     * Gets the callback called when the Component is clicked.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onClick(): (p: Point) => any;
    /**
     * Sets the callback called when the Component is clicked.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Click} The calling Interaction.Click.
     */
    public onClick(callback: (p: Point) => any): Interactions.Click;
    public onClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._clickCallback;
      }
      this._clickCallback = callback;
      return this;
    }

  }
}
}
