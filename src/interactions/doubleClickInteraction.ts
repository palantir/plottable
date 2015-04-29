///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  enum ClickState {NotClicked, SingleClicked, DoubleClicked};
  export class DoubleClick extends Interaction {

    private _mouseDispatcher: Plottable.Dispatchers.Mouse;
    private _touchDispatcher: Plottable.Dispatchers.Touch;
    private _doubleClickCallback: (p: Point) => any;
    private _clickState = ClickState.NotClicked;
    private _clickedDown = false;
    private _clickedPoint: Point;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);

      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interactions.DoubleClick" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp("Interactions.DoubleClick" + this.getID(), (p: Point) => this._handleClickUp(p));
      this._mouseDispatcher.onDblClick("Interactions.DoubleClick" + this.getID(), (p: Point) => this._handleDblClick());

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart("Interactions.DoubleClick" + this.getID(), (ids, idToPoint) =>
                                                                                     this._handleClickDown(idToPoint[ids[0]]));
      this._touchDispatcher.onTouchEnd("Interactions.DoubleClick" + this.getID(), (ids, idToPoint) =>
                                                                                     this._handleClickUp(idToPoint[ids[0]]));
    }

    private _handleClickDown(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        if (!(this._clickState === ClickState.SingleClicked) || !DoubleClick.pointsEqual(translatedP, this._clickedPoint)) {
          this._clickState = ClickState.NotClicked;
        }
        this._clickedPoint = translatedP;
        this._clickedDown = true;
      }
    }

    private _handleClickUp(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._clickedDown && DoubleClick.pointsEqual(translatedP, this._clickedPoint)) {
        this._clickState = this._clickState === ClickState.NotClicked ? ClickState.SingleClicked : ClickState.DoubleClicked;
      } else {
        this._clickState = ClickState.NotClicked;
      }
      this._clickedDown = false;
    }

    private _handleDblClick() {
      if (this._clickState === ClickState.DoubleClicked) {
        if (this._doubleClickCallback) {
          this._doubleClickCallback(this._clickedPoint);
        }
        this._clickState = ClickState.NotClicked;
      }
    }

    private static pointsEqual(p1: Point, p2: Point) {
      return p1.x === p2.x && p1.y === p2.y;
    }

    /**
     * Gets the callback called when the Component is double-clicked.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onDoubleClick(): (p: Point) => any;
    /**
     * Sets the callback called when the Component is double-clicked.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
     */
    public onDoubleClick(callback: (p: Point) => any): Interactions.DoubleClick;
    public onDoubleClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._doubleClickCallback;
      }
      this._doubleClickCallback = callback;
      return this;
    }

  }
}
}
