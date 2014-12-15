///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends AbstractInteraction {

    private _dragBehavior: D3.Behavior.Drag;
    private      _origin = [0,0];
    private    _location = [0,0];
    protected   _isDragging = false;

    protected  _constrainX: (n: number) => number;
    protected  _constrainY: (n: number) => number;
    private _ondragstart: (start: Point) => void;
    private      _ondrag: (start: Point, end: Point) => void;
    private   _ondragend: (start: Point, end: Point) => void;

    /**
     * Constructs a Drag. A Drag will signal its callbacks on mouse drag.
     */
    constructor() {
      super();
      this._dragBehavior = d3.behavior.drag();
      this._dragBehavior.on("dragstart", () => this._dragstart());
      this._dragBehavior.on("drag",      () => this._drag     ());
      this._dragBehavior.on("dragend",   () => this._dragend  ());
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
        return this._ondragstart;
      } else {
        this._ondragstart = cb;
        return this;
      }
    }

    // we access origin and location through setOrigin and setLocation so that on XDragBox and YDragBox we can overwrite so that
    // we always have the uncontrolled dimension of the box extending across the entire component
    // this ensures that the callback values are synchronized with the actual box being drawn
    protected _setOrigin(x: number, y: number) {
      this._origin = [x, y];
    }
    protected _getOrigin(): number[] {
      return this._origin.slice();
    }
    protected _setLocation(x: number, y: number) {
      this._location = [x, y];
    }
    protected _getLocation(): number[] {
      return this._location.slice();
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
        return this._ondrag;
      } else {
        this._ondrag = cb;
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
        return this._ondragend;
      } else {
        this._ondragend = cb;
        return this;
      }
    }

    protected _dragstart(){
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

    protected _doDragstart() {
      if (this._ondragstart != null) {
        this._ondragstart({x: this._getOrigin()[0], y: this._getOrigin()[1]});
      }
    }

    protected _drag(){
      this._setLocation(this._constrainX(d3.event.x), this._constrainY(d3.event.y));
      this._doDrag();
    }

    protected _doDrag() {
      if (this._ondrag != null) {
        var start = {x: this._getOrigin()[0]  , y: this._getOrigin()[1]};
        var end   = {x: this._getLocation()[0], y: this._getLocation()[1]};
        this._ondrag(start, end);
      }
    }

    protected _dragend(){
      var location = d3.mouse(this._hitBox[0][0].parentNode);
      this._setLocation(location[0], location[1]);
      this._isDragging = false;
      this._doDragend();
    }

    protected _doDragend() {
      if (this._ondragend != null) {
        var start = {x: this._getOrigin()[0], y: this._getOrigin()[1]};
        var end = {x: this._getLocation()[0], y: this._getLocation()[1]};
        this._ondragend(start, end);
      }
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      hitBox.call(this._dragBehavior);
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
