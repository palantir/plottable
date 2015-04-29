///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Pointer extends Interaction {
    private _mouseDispatcher: Dispatchers.Mouse;
    private _touchDispatcher: Dispatchers.Touch;
    private _overComponent = false;
    private _pointerEnterCallback: (p: Point) => any;
    private _pointerMoveCallback: (p: Point) => any;
    private _pointerExitCallback: (p: Point) => any;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);
      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onMouseMove("Interaction.Pointer" + this.getID(), (p: Point) => this._handlePointerEvent(p));

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> this._componentToListenTo.content().node());

      this._touchDispatcher.onTouchStart("Interaction.Pointer" + this.getID(), (ids, idToPoint) =>
                                                                                this._handlePointerEvent(idToPoint[ids[0]]));
    }

    private _handlePointerEvent(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        var wasOverComponent = this._overComponent;
        this._overComponent = true;
        if (!wasOverComponent && this._pointerEnterCallback) {
          this._pointerEnterCallback(translatedP);
        }
        if (this._pointerMoveCallback) {
          this._pointerMoveCallback(translatedP);
        }
      } else if (this._overComponent) {
        this._overComponent = false;
        if (this._pointerExitCallback) {
          this._pointerExitCallback(translatedP);
        }
      }
    }

    /**
     * Gets the callback called when the pointer enters the Component.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerEnter(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer enters the Component.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerEnter(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerEnter(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._pointerEnterCallback;
      }
      this._pointerEnterCallback = callback;
      return this;
    }

    /**
     * Gets the callback called when the pointer moves.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerMove(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer moves.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerMove(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerMove(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._pointerMoveCallback;
      }
      this._pointerMoveCallback = callback;
      return this;
    }

    /**
     * Gets the callback called when the pointer exits the Component.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerExit(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer exits the Component.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerExit(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerExit(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._pointerExitCallback;
      }
      this._pointerExitCallback = callback;
      return this;
    }
  }
}
}
