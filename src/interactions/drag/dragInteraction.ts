///<reference path="../../reference.ts" />

module Plottable {
  export class DragInteraction extends Interaction {
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    public origin = [0,0];
    public location = [0,0];
    private constrainX: (n: number) => number;
    private constrainY: (n: number) => number;
    public callbackToCall: (dragInfo: any) => any;

    /**
     * Creates a DragInteraction.
     *
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this._dragstart());
      this.dragBehavior.on("drag",      () => this._drag     ());
      this.dragBehavior.on("dragend",   () => this._dragend  ());
    }

    /**
     * Adds a callback to be called when the AreaInteraction triggers.
     *
     * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public callback(cb?: (a: any) => any) {
      this.callbackToCall = cb;
      return this;
    }

    public _dragstart(){
      var availableWidth  = this.componentToListenTo.availableWidth;
      var availableHeight = this.componentToListenTo.availableHeight;
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
      this.constrainX = constraintFunction(0, availableWidth);
      this.constrainY = constraintFunction(0, availableHeight);
    }

    public _drag(){
      if (!this.dragInitialized) {
        this.origin = [d3.event.x, d3.event.y];
        this.dragInitialized = true;
      }

      this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
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
      if (this.callbackToCall != null) {
        this.callbackToCall([this.origin, this.location]);
      }
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.call(this.dragBehavior);
      return this;
    }
  }
}
