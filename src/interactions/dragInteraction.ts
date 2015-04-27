///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Drag extends Interaction {
    private constrained = true;
    private drag: (start: Point, end: Point) => any;
    private dragging = false;
    private dragEndCallback: (start: Point, end: Point) => any;
    private dragOrigin: Point;
    private dragStartCallback: (p: Point) => any;
    private mouseDispatchers: Plottable.Dispatchers.Mouse;
    private touchDispatchers: Dispatchers.Touch;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);
      this.mouseDispatchers = Dispatchers.Mouse.getDispatcher(<SVGElement> this.component.content().node());
      this.mouseDispatchers.onMouseDown("Interactions.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this.startDrag(p, e));
      this.mouseDispatchers.onMouseMove("Interactions.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this.doDrag(p, e));
      this.mouseDispatchers.onMouseUp("Interactions.Drag" + this.getID(),
        (p: Point, e: MouseEvent) => this.endDrag(p, e));

      this.touchDispatchers = Dispatchers.Touch.getDispatcher(<SVGElement> this.component.content().node());
      this.touchDispatchers.onTouchStart("Interactions.Drag" + this.getID(),
        (ids, idToPoint, e) => this.startDrag(idToPoint[ids[0]], e));
      this.touchDispatchers.onTouchMove("Interactions.Drag" + this.getID(),
        (ids, idToPoint, e) => this.doDrag(idToPoint[ids[0]], e));
      this.touchDispatchers.onTouchEnd("Interactions.Drag" + this.getID(),
        (ids, idToPoint, e) => this.endDrag(idToPoint[ids[0]], e));
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
        return this.constrained;
      }
      this.constrained = constrain;
      return this;
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
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDrag(cb: (start: Point, end: Point) => any): Drag;
    public onDrag(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this.drag;
      } else {
        this.drag = cb;
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
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDragEnd(cb: (start: Point, end: Point) => any): Drag;
    public onDragEnd(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this.dragEndCallback;
      } else {
        this.dragEndCallback = cb;
        return this;
      }
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
     * @returns {Drag} The calling Interactions.Drag.
     */
    public onDragStart(cb: (start: Point) => any): Drag;
    public onDragStart(cb?: (start: Point) => any): any {
      if (cb === undefined) {
        return this.dragStartCallback;
      } else {
        this.dragStartCallback = cb;
        return this;
      }
    }

    private doDrag(p: Point, e: UIEvent) {
      if (this.dragging) {
        if (this.drag) {
          var constrainedP = this.translateAndConstrain(p);
          this.drag(this.dragOrigin, constrainedP);
        }
      }
    }

    private endDrag(p: Point, e: UIEvent) {
      if (e instanceof MouseEvent && (<MouseEvent> e).button !== 0) {
        return;
      }
      if (this.dragging) {
        this.dragging = false;
        if (this.dragEndCallback) {
          var constrainedP = this.translateAndConstrain(p);
          this.dragEndCallback(this.dragOrigin, constrainedP);
        }
      }
    }

    private startDrag(p: Point, e: UIEvent) {
      if (e instanceof MouseEvent && (<MouseEvent> e).button !== 0) {
        return;
      }
      var translatedP = this.translateToComponentSpace(p);
      if (this.isInsideComponent(translatedP)) {
        e.preventDefault();
        this.dragging = true;
        this.dragOrigin = translatedP;
        if (this.dragStartCallback) {
          this.dragStartCallback(this.dragOrigin);
        }
      }
    }

    private translateAndConstrain(p: Point) {
      var translatedP = this.translateToComponentSpace(p);
      if (!this.constrained) {
        return translatedP;
      }

      return {
        x: Utils.Methods.clamp(translatedP.x, 0, this.component.width()),
        y: Utils.Methods.clamp(translatedP.y, 0, this.component.height())
      };
    }
  }
}
}
