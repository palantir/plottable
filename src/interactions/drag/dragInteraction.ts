///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends AbstractInteraction {
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    private      origin = [0,0];
    private    location = [0,0];
    public  _isDragging = false;
    public  _constrainX: (n: number) => number;
    public  _constrainY: (n: number) => number;
    private ondragstart: (start: Point) => void;
    private      ondrag: (start: Point, end: Point) => void;
    private   ondragend: (start: Point, end: Point) => void;

    /**
     * Constructs a Drag. A Drag will signal its callbacks on mouse drag.
     */
    constructor() {
      super();
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this._dragstart());
      this.dragBehavior.on("drag",      () => this._drag     ());
      this.dragBehavior.on("dragend",   () => this._dragend  ());
    }

    /**
     * Gets the callback that is called when dragging starts.
     *
     * @returns {(start: Point) => void} The callback called when dragging starts.
     */
    public dragstart(): (start: Point) => void;
    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {(start: Point) => any} cb If provided, the function to be called. Takes in a Point in pixels.
     * @returns {Drag} The calling Drag.
     */
    public dragstart(cb: (start: Point) => any): Drag;
    public dragstart(cb?: (start: Point) => any): any {
      if (cb === undefined) {
        return this.ondragstart;
      } else {
        this.ondragstart = cb;
        return this;
      }
    }

    // we access origin and location through setOrigin and setLocation so that on XDragBox and YDragBox we can overwrite so that
    // we always have the uncontrolled dimension of the box extending across the entire component
    // this ensures that the callback values are synchronized with the actual box being drawn
    public _setOrigin(x: number, y: number) {
      this.origin = [x, y];
    }
    public _getOrigin(): number[] {
      return this.origin.slice();
    }
    public _setLocation(x: number, y: number) {
      this.location = [x, y];
    }
    public _getLocation(): number[] {
      return this.location.slice();
    }

    /**
     * Gets the callback that is called during dragging.
     *
     * @returns {(start: Point, end: Point) => void} The callback called during dragging.
     */
    public drag(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called during dragging.
     *
     * @param {(start: Point, end: Point) => any} cb If provided, the function to be called. Takes in Points in pixels.
     * @returns {Drag} The calling Drag.
     */
    public drag(cb: (start: Point, end: Point) => any): Drag;
    public drag(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this.ondrag;
      } else {
        this.ondrag = cb;
        return this;
      }
    }

    /**
     * Gets the callback that is called when dragging ends.
     *
     * @returns {(start: Point, end: Point) => void} The callback called when dragging ends.
     */
    public dragend(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {(start: Point, end: Point) => any} cb If provided, the function to be called. Takes in points in pixels.
     * @returns {Drag} The calling Drag.
     */
    public dragend(cb: (start: Point, end: Point) => any): Drag;
    public dragend(cb?: (start: Point, end: Point) => any): any {
      if (cb === undefined) {
        return this.ondragend;
      } else {
        this.ondragend = cb;
        return this;
      }
    }

    public _dragstart(){
      this._isDragging = true;
      var width  = this._componentToListenTo.width();
      var height = this._componentToListenTo.height();
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
      this._constrainX = constraintFunction(0, width );
      this._constrainY = constraintFunction(0, height);
      var origin = d3.mouse(this._hitBox[0][0].parentNode);
      this._setOrigin(origin[0], origin[1]);
      this._doDragstart();
    }

    public _doDragstart() {
      if (this.ondragstart != null) {
        this.ondragstart({x: this._getOrigin()[0], y: this._getOrigin()[1]});
      }
    }

    public _drag(){
      this._setLocation(this._constrainX(d3.event.x), this._constrainY(d3.event.y));
      this._doDrag();
    }

    public _doDrag() {
      if (this.ondrag != null) {
        var start = {x: this._getOrigin()[0]  , y: this._getOrigin()[1]};
        var end   = {x: this._getLocation()[0], y: this._getLocation()[1]};
        this.ondrag(start, end);
      }
    }

    public _dragend(){
      var origin = d3.mouse(this._hitBox[0][0].parentNode);
      this._setLocation(origin[0], origin[1]);
      this._isDragging = false;
      this._doDragend();
    }

    public _doDragend() {
      if (this.ondragend != null) {
        var start = {x: this._getOrigin()[0], y: this._getOrigin()[1]};
        var end = {x: this._getLocation()[0], y: this._getLocation()[1]};
        this.ondragend(start, end);
      }
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      hitBox.call(this.dragBehavior);
      return this;
    }

    /**
     * Sets up so that the xScale and yScale that are passed have their
     * domains automatically changed as you zoom.
     *
     * @param {QuantitativeScale} xScale The scale along the x-axis.
     * @param {QuantitativeScale} yScale The scale along the y-axis.
     * @returns {Drag} The calling Drag.
     */
    public setupZoomCallback(xScale?: Scale.AbstractQuantitative<any>, yScale?: Scale.AbstractQuantitative<any>) {
      var xDomainOriginal = xScale != null ? xScale.domain() : null;
      var yDomainOriginal = yScale != null ? yScale.domain() : null;
      var resetOnNextClick = false;

      function callback(upperLeft: Point, lowerRight: Point) {
        if (upperLeft == null || lowerRight == null) {
          if (resetOnNextClick) {
            if (xScale != null) {
              xScale.domain(xDomainOriginal);
            }
            if (yScale != null) {
              yScale.domain(yDomainOriginal);
            }
          }
          resetOnNextClick = !resetOnNextClick;
          return;
        }
        resetOnNextClick = false;
        if (xScale != null) {
          xScale.domain([xScale.invert(upperLeft.x), xScale.invert(lowerRight.x)]);
        }
        if (yScale != null) {
          yScale.domain([yScale.invert(lowerRight.y), yScale.invert(upperLeft.y)]);
        }
        this.clearBox();
        return;
      }
      this.drag(callback);
      this.dragend(callback);
      return this;
    }
  }
}
}
