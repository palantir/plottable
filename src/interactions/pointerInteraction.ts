///<reference path="../reference.ts" />

module Plottable {

export type PointerCallback = (point: Point) => any;
export module Interactions {
  export class Pointer extends Interaction {
    private _mouseDispatcher: Dispatchers.Mouse;
    private _touchDispatcher: Dispatchers.Touch;
    private _overComponent = false;
    private _pointerEnterCallbacks = new Utils.CallbackSet<PointerCallback>();
    private _pointerMoveCallbacks = new Utils.CallbackSet<PointerCallback>();
    private _pointerExitCallbacks = new Utils.CallbackSet<PointerCallback>();

    private _mouseMoveCallback = (p: Point) => this._handlePointerEvent(p);
    private _touchStartCallback = (ids: number[], idToPoint: Point[]) => this._handlePointerEvent(idToPoint[ids[0]]);

    protected _anchor(component: Component) {
      super._anchor(component);
      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onMouseMove(this._mouseMoveCallback);

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._touchDispatcher.onTouchStart(this._touchStartCallback);
    }

    protected _unanchor() {
      super._unanchor();
      this._mouseDispatcher.offMouseMove(this._mouseMoveCallback);
      this._mouseDispatcher = null;

      this._touchDispatcher.offTouchStart(this._touchStartCallback);
      this._touchDispatcher = null;
    }

    private _handlePointerEvent(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        var wasOverComponent = this._overComponent;
        this._overComponent = true;
        if (!wasOverComponent) {
          this._pointerEnterCallbacks.callCallbacks(translatedP);
        }
        this._pointerMoveCallbacks.callCallbacks(translatedP);
      } else if (this._overComponent) {
        this._overComponent = false;
        this._pointerExitCallbacks.callCallbacks(translatedP);
      }
    }

    /**
     * Sets the callback called when the pointer enters the Component.
     *
     * @param {PointerCallback} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerEnter(callback: PointerCallback) {
      this._pointerEnterCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback called when the pointer enters the Component.
     *
     * @param {PointerCallback} callback The callback to remove.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public offPointerEnter(callback: PointerCallback) {
      this._pointerEnterCallbacks.delete(callback);
      return this;
    }

    /**
     * Sets the callback called when the pointer moves.
     *
     * @param {PointerCallback} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerMove(callback: PointerCallback) {
      this._pointerMoveCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback called when the pointer moves.
     *
     * @param {PointerCallback} callback The callback to remove.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public offPointerMove(callback: PointerCallback) {
      this._pointerMoveCallbacks.delete(callback);
      return this;
    }

    /**
     * Sets the callback called when the pointer exits the Component.
     *
     * @param {PointerCallback} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerExit(callback: PointerCallback) {
      this._pointerExitCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback called when the pointer exits the Component.
     *
     * @param {PointerCallback} callback The callback to remove.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public offPointerExit(callback: PointerCallback) {
      this._pointerExitCallbacks.delete(callback);
      return this;
    }
  }
}
}
