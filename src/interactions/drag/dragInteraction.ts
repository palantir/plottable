///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class Drag extends Abstract.Interaction {
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    public origin = [0,0];
    public location = [0,0];
    private constrainX: (n: number) => number;
    private constrainY: (n: number) => number;
    public ondragstart: (dragInfo: any) => any;
    public ondrag     : (dragInfo: any) => any;
    public ondragend  : (dragInfo: any) => any;

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
     * Adds a callback to be caleld when dragging starts.
     *
     * @param {(a: SelectionArea) => any} cb The function to be called.
     * @returns {AreaInteraction}
     */
    public dragstart(cb?: (a: any) => any) {
      this.ondragstart = cb;
      return this;
    }

    /**
     * Adds a callback to be called during dragging.
     *
     * @param {(a: SelectionArea) => any} cb The function to be called.
     * @returns {AreaInteraction}
     */
    public drag(cb?: (a: any) => any) {
      this.ondrag = cb;
      return this;
    }

    /**
     * Adds a callback to be called when the dragging ends.
     *
     * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public dragend(cb?: (a: any) => any) {
      this.ondragend = cb;
      return this;
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
        this.ondragstart(this.origin);
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
        this.ondrag([this.origin, this.location]);
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
      // seperated out so it can be over-ridden by dragInteractions that want to pass out diff information
      // eg just x values for an xSelectionInteraction
      if (this.ondragend != null) {
        this.ondragend([this.origin, this.location]);
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
      function callback(pixelArea: IPixelArea) {
        if (pixelArea == null) {
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
          xScale.domain([xScale.invert(pixelArea.xMin), xScale.invert(pixelArea.xMax)]);
        }
        if (yScale != null) {
          yScale.domain([yScale.invert(pixelArea.yMax), yScale.invert(pixelArea.yMin)]);
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
