///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends AbstractInteraction {
    private _dragging = false;
    private _constrain = true;
    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _touchDispatcher: Dispatcher.Touch;
    private _dragOrigin: Point;
    private _dragStartCallback: (p: Point) => any;
    private _dragCallback: (start: Point, end: Point) => any;
    private _dragEndCallback: (start: Point, end: Point) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._startDrag(p, e));
      this._mouseDispatcher.onMouseMove("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._doDrag(p, e));
      this._mouseDispatcher.onMouseUp("Interaction.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this._endDrag(p, e));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> this._componentToListenTo.content().node());
      this._touchDispatcher.onTouchStart("Interaction.Drag" + this.getID(),
        (p: Point, e: TouchEvent) => this._startDrag(p, e));
      this._touchDispatcher.onTouchMove("Interaction.Drag" + this.getID(),
        (p: Point, e: TouchEvent) => this._doDrag(p, e));
      this._touchDispatcher.onTouchEnd("Interaction.Drag" + this.getID(),
        (p: Point, e: TouchEvent) => this._endDrag(p, e));
    }

    private _translateAndConstrain(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (!this._constrain) {
        return translatedP;
      }

      return {
        x: _Util.Methods.clamp(translatedP.x, 0, this._componentToListenTo.width()),
        y: _Util.Methods.clamp(translatedP.y, 0, this._componentToListenTo.height())
      };
    }

    private _startDrag(p: Point, e: UIEvent) {
      if (e instanceof MouseEvent && (<MouseEvent> e).button !== 0) {
        return;
      }
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

    private _doDrag(p: Point, e: UIEvent) {
      if (this._dragging) {
        if (this._dragCallback) {
          var constrainedP = this._translateAndConstrain(p);
          this._dragCallback(this._dragOrigin, constrainedP);
        }
      }
    }

    private _endDrag(p: Point, e: UIEvent) {
      if (this._dragging) {
        this._dragging = false;
        if (this._dragEndCallback) {
          var constrainedP = this._translateAndConstrain(p);
          this._dragEndCallback(this._dragOrigin, constrainedP);
        }
      }
    }

    /**
     * Returns whether or not this Interaction constrains Points passed to its
     * callbacks to lie inside its Component.
     *
     * If true, when the user drags outside of the Component, the closest Point
     * inside the Component will be passed to the callback instead of the actual
     * cursor position.
     *
     * @return {boolean} Whether or not the Interaction.Drag constrains.
     */
    public constrain(): boolean;
    /**
     * Sets whether or not this Interaction constrains Points passed to its
     * callbacks to lie inside its Component.
     *
     * If true, when the user drags outside of the Component, the closest Point
     * inside the Component will be passed to the callback instead of the actual
     * cursor position.
     *
     * @param {boolean} doConstrain Whether or not to constrain Points.
     * @return {Interaction.Drag} The calling Interaction.Drag.
     */
    public constrain(doConstrain: boolean): Drag;
    public constrain(doConstrain?: boolean): any {
      if (doConstrain == null) {
        return this._constrain;
      }
      this._constrain = doConstrain;
      return this;
    }

    /**
     * Gets the callback that is called when dragging starts.
     *
     * @returns {(start: Point) => any} The callback called when dragging starts.
     */
    public onDragStart(): (start: Point) => any;
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
     * @returns {(start: Point, end: Point) => any} The callback called during dragging.
     */
    public onDrag(): (start: Point, end: Point) => any;
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
     * @returns {(start: Point, end: Point) => any} The callback called when dragging ends.
     */
    public onDragEnd(): (start: Point, end: Point) => any;
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
