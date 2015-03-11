///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends AbstractInteraction {
    private _dragging = false;
    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _dragOrigin: Point;
    private _dragStartCallback: (p: Point) => any;
    private _dragCallback: (start: Point, end: Point) => any;
    private _dragEndCallback: (start: Point, end: Point) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(
                                <SVGElement> (<any> this._componentToListenTo)._element.node()
                              );
      this._mouseDispatcher.onMouseDown("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._startDrag(p, e));
      this._mouseDispatcher.onMouseMove("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._doDrag(p, e));
      this._mouseDispatcher.onMouseUp("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._endDrag(p, e));
    }

    private _translateAndConstrain(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      var constrainedX = Math.min(Math.max(0, translatedP.x), this._componentToListenTo.width());
      var constrainedY = Math.min(Math.max(0, translatedP.y), this._componentToListenTo.height());
      return {
        x: constrainedX,
        y: constrainedY
      };
    }

    private _startDrag(p: Point, e: MouseEvent) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        e.preventDefault();
        this._dragging = true;
        this._dragOrigin = translatedP;
        if (this._dragStartCallback) {
          this._dragStartCallback(this._dragOrigin);
        }
      }
    }

    private _doDrag(p: Point, e: MouseEvent) {
      if (this._dragging) {
        if (this._dragCallback) {
          var constrainedP = this._translateAndConstrain(p);
          this._dragCallback(this._dragOrigin, constrainedP);
        }
      }
    }

    private _endDrag(p: Point, e: MouseEvent) {
      if (this._dragging) {
        this._dragging = false;
        if (this._dragEndCallback) {
          var constrainedP = this._translateAndConstrain(p);
          this._dragEndCallback(this._dragOrigin, constrainedP);
        }
      }
    }

    /**
     * Gets the callback that is called when dragging starts.
     *
     * @returns {(start: Point) => void} The callback called when dragging starts.
     */
    public onDragStart(): (start: Point) => void;
    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {(start: Point) => any} cb The callback to be called. Takes in a Point in pixels.
     * @returns {Drag} The calling Interaction.Drag.
     */
    public onDragStart(cb: (start: Point) => any): Drag;
    public onDragStart(cb?: (start: Point) => any): any {
      if (cb === undefined) {
        return this._dragStartCallback;
      } else {
        this._dragStartCallback = cb;
        return this;
      }
    }

    /**
     * Gets the callback that is called during dragging.
     *
     * @returns {(start: Point, end: Point) => void} The callback called during dragging.
     */
    public onDrag(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called during dragging.
     *
     * @param {(start: Point, end: Point) => any} cb The callback to be called. Takes in Points in pixels.
     * @returns {Drag} The calling Interaction.Drag.
     */
    public onDrag(cb: (start: Point, end: Point) => any): Drag;
    public onDrag(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this._dragCallback;
      } else {
        this._dragCallback = cb;
        return this;
      }
    }

    /**
     * Gets the callback that is called when dragging ends.
     *
     * @returns {(start: Point, end: Point) => void} The callback called when dragging ends.
     */
    public onDragEnd(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {(start: Point, end: Point) => any} cb The callback to be called. Takes in Points in pixels.
     * @returns {Drag} The calling Interaction.Drag.
     */
    public onDragEnd(cb: (start: Point, end: Point) => any): Drag;
    public onDragEnd(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this._dragEndCallback;
      } else {
        this._dragEndCallback = cb;
        return this;
      }
    }
  }
}
}
