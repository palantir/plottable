///<reference path="../reference.ts" />

module Plottable {
  export class AreaInteraction extends Interaction {
    private static CLASS_DRAG_BOX = "drag-box";
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    private origin = [0,0];
    private location = [0,0];
    private constrainX: (n: number) => number;
    private constrainY: (n: number) => number;
    private dragBox: D3.Selection;
    private callbackToCall: (area: SelectionArea) => any;

    /**
     * Creates an AreaInteraction.
     *
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this.dragstart());
      this.dragBehavior.on("drag",      () => this.drag     ());
      this.dragBehavior.on("dragend",   () => this.dragend  ());
    }

    /**
     * Adds a callback to be called when the AreaInteraction triggers.
     *
     * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public callback(cb?: (a: SelectionArea) => any): AreaInteraction {
      this.callbackToCall = cb;
      return this;
    }

    private dragstart(){
      this.clearBox();
      var availableWidth  = parseFloat(this.hitBox.attr("width"));
      var availableHeight = parseFloat(this.hitBox.attr("height"));
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
      this.constrainX = constraintFunction(0, availableWidth);
      this.constrainY = constraintFunction(0, availableHeight);
    }

    private drag(){
      if (!this.dragInitialized) {
        this.origin = [d3.event.x, d3.event.y];
        this.dragInitialized = true;
      }

      this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
      var width  = Math.abs(this.origin[0] - this.location[0]);
      var height = Math.abs(this.origin[1] - this.location[1]);
      var x = Math.min(this.origin[0], this.location[0]);
      var y = Math.min(this.origin[1], this.location[1]);
      this.dragBox.attr("x", x).attr("y", y).attr("height", height).attr("width", width);
    }

    private dragend(){
      if (!this.dragInitialized) {
        return;
      }

      this.dragInitialized = false;
      if (this.callbackToCall == null) {
        return;
      }

      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      var yMin = Math.min(this.origin[1], this.location[1]);
      var yMax = Math.max(this.origin[1], this.location[1]);
      var pixelArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      this.callbackToCall(pixelArea);
    }

    /**
     * Clears the highlighted drag-selection box drawn by the AreaInteraction.
     *
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox(): AreaInteraction {
      this.dragBox.attr("height", 0).attr("width", 0);
      return this;
    }

    public _anchor(hitBox: D3.Selection): AreaInteraction {
      super._anchor(hitBox);
      var cname = AreaInteraction.CLASS_DRAG_BOX;
      var background = this.componentToListenTo.backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.call(this.dragBehavior);
      return this;
    }
  }
}
