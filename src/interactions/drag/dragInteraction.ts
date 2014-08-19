///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends Abstract.Interaction {
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    public origin = [0,0];
    public location = [0,0];
    private  constrainX: (n: number) => number;
    private  constrainY: (n: number) => number;
    private ondragstart: (startLocation: Point) => void;
    private      ondrag: (startLocation: Point, endLocation: Point) => void;
    private   ondragend: (startLocation: Point, endLocation: Point) => void;

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
     * @returns {(startLocation: Point) => void}
     */
    public dragstart(): (startLocation: Point) => void;
    /**
     * Sets the callback to be called when dragging starts.
     *
     * @param {(startLocation: Point) => any} cb The function to be called.
     * @returns {Drag}
     */
    public dragstart(cb: (startLocation: Point) => any): Drag;
    public dragstart(cb?: (startLocation: Point) => any): any {
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
     * @returns {(startLocation: Point, endLocation: Point) => void}
     */
    public drag(): (startLocation: Point, endLocation: Point) => void;
    /**
     * Adds a callback to be called during dragging.
     *
     * @param {(startLocation: Point, endLocation: Point) => any} cb The function to be called.
     * @returns {Drag}
     */
    public drag(cb: (startLocation: Point, endLocation: Point) => any): Drag;
    public drag(cb?: (startLocation: Point, endLocation: Point) => any): any {
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
     * @returns {(startLocation: Point, endLocation: Point) => void}
     */
    public dragend(): (startLocation: Point, endLocation: Point) => void;
    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {(startLocation: Point, endLocation: Point) => any} cb The function to be called. Takes in a SelectionArea in pixels.
     * @returns {Drag} The calling Drag.
     */
    public dragend(cb: (startLocation: Point, endLocation: Point) => any): Drag;
    public dragend(cb?: (startLocation: Point, endLocation: Point) => any): any {
      if (cb === undefined) {
        return this.ondragend;
      } else {
        this.ondragend = cb;
        return this;
      }
    }

    public _dragstart(){
      var availableWidth  = this.componentToListenTo.availableWidth;
      var availableHeight = this.componentToListenTo.availableHeight;
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
      this.constrainX = constraintFunction(0, availableWidth );
      this.constrainY = constraintFunction(0, availableHeight);
    }

    public _doDragstart() {
      if (this.ondragstart != null) {
        this.ondragstart({x: this.origin[0], y: this.origin[1]});
      }
    }

    public _drag(){
      if (!this.dragInitialized) {
        this.origin = [d3.event.x, d3.event.y];
        this.dragInitialized = true;
        this._doDragstart();
      }

      this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
      this._doDrag();
    }

    public _doDrag() {
      if (this.ondrag != null) {
        var startLocation = {x: this.origin[0], y: this.origin[1]};
        var endLocation = {x: this.location[0], y: this.location[1]};
        this.ondrag(startLocation, endLocation);
      }
    }

    public _dragend(){
      if (!this.dragInitialized) {
        return;
      }
      this.dragInitialized = false;
      this._doDragend();
    }

    public _doDragend() {
      if (this.ondragend != null) {
        var startLocation = {x: this.origin[0], y: this.origin[1]};
        var endLocation = {x: this.location[0], y: this.location[1]};
        this.ondragend(startLocation, endLocation);
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
