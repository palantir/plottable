///<reference path="../reference.ts" />

module Plottable {

export type DragCallback = (start: Point, end: Point) => any;

export module Interactions {
  export class Drag extends Interaction {
    private _dragging = false;
    private _constrain = true;
    private _mouseDispatcher: Dispatchers.Mouse;
    private _touchDispatcher: Dispatchers.Touch;
    private _dragOrigin: Point;
    private _dragStartCallbacks = new Utils.CallbackSet<DragCallback>();
    private _dragCallbacks = new Utils.CallbackSet<DragCallback>();
    private _dragEndCallbacks = new Utils.CallbackSet<DragCallback>();


    private mouseDownCallback = (p: Point, e: MouseEvent) => this._startDrag(p, e);
    private mouseMoveCallback = (p: Point, e: MouseEvent) => this._doDrag(p, e);
    private mouseUpCallback = (p: Point, e: MouseEvent) => this._endDrag(p, e);
    private touchStartCallback = (ids: any, idToPoint: any, e: any) => this._startDrag(idToPoint[ids[0]], e);
    private touchMoveCallback = (ids: any, idToPoint: any, e: any) => this._doDrag(idToPoint[ids[0]], e);
    private touchEndCallback = (ids: any, idToPoint: any, e: any) => this._endDrag(idToPoint[ids[0]], e);


    protected _anchor(component: Component) {
      super._anchor(component);
      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onMouseDown(this.mouseDownCallback);
      this._mouseDispatcher.onMouseMove(this.mouseMoveCallback);
      this._mouseDispatcher.onMouseUp(this.mouseUpCallback);

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._touchDispatcher.onTouchStart(this.touchStartCallback);
      this._touchDispatcher.onTouchMove(this.touchMoveCallback);
      this._touchDispatcher.onTouchEnd(this.touchEndCallback);
    }

    private _translateAndConstrain(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (!this._constrain) {
        return translatedP;
      }

      return {
        x: Utils.Methods.clamp(translatedP.x, 0, this._componentToListenTo.width()),
        y: Utils.Methods.clamp(translatedP.y, 0, this._componentToListenTo.height())
      };
    }

    private _startDrag(point: Point, event: UIEvent) {
      if (event instanceof MouseEvent && (<MouseEvent> event).button !== 0) {
        return;
      }
      var translatedP = this._translateToComponentSpace(point);
      if (this._isInsideComponent(translatedP)) {
        event.preventDefault();
        this._dragging = true;
        this._dragOrigin = translatedP;
        this._dragStartCallbacks.callCallbacks(this._dragOrigin);
      }
    }

    private _doDrag(point: Point, event: UIEvent) {
      if (this._dragging) {
        this._dragCallbacks.callCallbacks(this._dragOrigin, this._translateAndConstrain(point));
      }
    }

    private _endDrag(point: Point, event: UIEvent) {
      if (event instanceof MouseEvent && (<MouseEvent> event).button !== 0) {
        return;
      }
      if (this._dragging) {
        this._dragging = false;
        this._dragEndCallbacks.callCallbacks(this._dragOrigin, this._translateAndConstrain(point));
      }
    }

    /**
     * Returns whether or not this Interactions constrains Points passed to its
     * callbacks to lie inside its Component.
     *
     * If true, when the user drags outside of the Component, the closest Point
     * inside the Component will be passed to the callback instead of the actual
     * cursor position.
     *
     * @return {boolean} Whether or not the Interactions.Drag constrains.
     */
    public constrainToComponent(): boolean;
    /**
     * Sets whether or not this Interactions constrains Points passed to its
     * callbacks to lie inside its Component.
     *
     * If true, when the user drags outside of the Component, the closest Point
     * inside the Component will be passed to the callback instead of the actual
     * cursor position.
     *
     * @param {boolean} constrain Whether or not to constrain Points.
     * @return {Interactions.Drag} The calling Interactions.Drag.
     */
    public constrainToComponent(constrain: boolean): Drag;
    public constrainToComponent(constrain?: boolean): any {
      if (constrain == null) {
        return this._constrain;
      }
      this._constrain = constrain;
      return this;
    }

    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {DragCallback} callback The callback to be called. Takes in a Point in pixels.
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDragStart(callback: DragCallback) {
      this._dragStartCallbacks.add(callback);
      return this;
    }

    /**
     * Removes the callback to be called when dragging starts.
     *
     * @param {DragCallback} callback The callback to be removed.
     * @returns {Drag} The calling Interactions.Drag.
     */
    public offDragStart(callback: DragCallback) {
      this._dragStartCallbacks.delete(callback);
      return this;
    }

    /**
     * Adds a callback to be called during dragging.
     *
     * @param {DragCallback} callback The callback to be called. Takes in Points in pixels.
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDrag(callback: DragCallback) {
      this._dragCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback to be called during dragging.
     *
     * @param {DragCallback} callback The callback to be removed.
     * @returns {Drag} The calling Interactions.Drag.
     */
    public offDrag(callback: DragCallback) {
      this._dragCallbacks.delete(callback);
      return this;
    }

    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {DragCallback} callback The callback to be called. Takes in Points in pixels.
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDragEnd(callback: DragCallback) {
      this._dragEndCallbacks.add(callback);
      return this;
    }

    /**
     * Removes a callback to be called when the dragging ends.
     *
     * @param {DragCallback} callback The callback to be removed
     * @returns {Drag} The calling Interactions.Drag.
     */
    public offDragEnd(callback: DragCallback) {
      this._dragEndCallbacks.delete(callback);
      return this;
    }
  }
}
}
