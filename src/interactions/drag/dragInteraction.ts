///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends Abstract.Interaction {
    private dragBehavior: D3.Behavior.Drag;
    /**
     * Where dragging originated for the current dragging event.
     */
    public origin = [0,0];
    /**
     * The current location of the mouse for the current dragging event.
     */
    public location = [0,0];
    public  _constrainX: (n: number) => number;
    public  _constrainY: (n: number) => number;
    public  _isDragging = false;
    private ondragstart: (start: Point) => void;
    private      ondrag: (start: Point, end: Point) => void;
    private   ondragend: (start: Point, end: Point) => void;

    /**
     * Creates a Drag.
     *
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Abstract.Component) {
      super(componentToListenTo);
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this._dragstart());
      this.dragBehavior.on("drag",      () => this._drag     ());
      this.dragBehavior.on("dragend",   () => this._dragend  ());
    }

    /**
     * Gets the callback that is called when dragging starts.
     *
     * @returns {(start: Point) => void}
     */
    public dragstart(): (start: Point) => void;
    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {(start: Point) => any} cb The function to be called.
     * @returns {Drag}
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

    /**
     * Gets the callback that is called during dragging.
     *
     * @returns {(start: Point, end: Point) => void}
     */
    public drag(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called during dragging.
     *
     * @param {(start: Point, end: Point) => any} cb The function to be called.
     * @returns {Drag}
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
     * @returns {(start: Point, end: Point) => void}
     */
    public dragend(): (start: Point, end: Point) => void;
    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {(start: Point, end: Point) => any} cb The function to be called. Takes in a SelectionArea in pixels.
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
      var availableWidth  = this.componentToListenTo.availableWidth;
      var availableHeight = this.componentToListenTo.availableHeight;
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
      this._constrainX = constraintFunction(0, availableWidth );
      this._constrainY = constraintFunction(0, availableHeight);
      this.origin = d3.mouse(this.hitBox[0][0].parentNode);
      this._doDragstart();
    }

    public _doDragstart() {
      if (this.ondragstart != null) {
        this.ondragstart({x: this.origin[0], y: this.origin[1]});
      }
    }

    public _drag(){
      this.location = [this._constrainX(d3.event.x), this._constrainY(d3.event.y)];
      this._doDrag();
    }

    public _doDrag() {
      if (this.ondrag != null) {
        var start = {x: this.origin[0], y: this.origin[1]};
        var end = {x: this.location[0], y: this.location[1]};
        this.ondrag(start, end);
      }
    }

    public _dragend(){
      this._isDragging = false;
      this._doDragend();
    }

    public _doDragend() {
      if (this.ondragend != null) {
        var start = {x: this.origin[0], y: this.origin[1]};
        var end = {x: this.location[0], y: this.location[1]};
        this.ondragend(start, end);
      }
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.call(this.dragBehavior);
      return this;
    }

    public setupZoomCallback(xScale?: Abstract.QuantitativeScale, yScale?: Abstract.QuantitativeScale) {
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
