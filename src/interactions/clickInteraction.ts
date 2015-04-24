///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Click extends AbstractInteraction {

    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _touchDispatcher: Plottable.Dispatcher.Touch;
    private _clickCallback: (p: Point) => any;
    private _clickedDown = false;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.Click" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp("Interaction.Click" + this.getID(), (p: Point) => this._handleClickUp(p));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> component.content().node());
      //TODO Deal with no point case
      this._touchDispatcher.onTouchStart("Interaction.Click" + this.getID(), (points: Point[], ids: number[]) =>
                                                                               this._handleClickDown(points[ids[0]]));
      this._touchDispatcher.onTouchEnd("Interaction.Click" + this.getID(), (points: Point[], ids: number[]) =>
                                                                               this._handleClickUp(points[ids[0]]));
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
    public onClick(callback: (p: Point) => any): Interaction.Click;
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
