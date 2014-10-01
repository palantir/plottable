///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  /**
   * A DragBox is an interaction that automatically draws a box across the
   * element you attach it to when you drag.
   */
  export class DragBox extends Drag {
    private static CLASS_DRAG_BOX = "drag-box";
    /**
     * The DOM element of the box that is drawn. When no box is drawn, it is
     * null.
     */
    public dragBox: D3.Selection;
    /**
     * Whether or not dragBox has been rendered in a visible area.
     */
    public boxIsDrawn = false;

    public _dragstart() {
      super._dragstart();
      this.clearBox();
    }

    /**
     * Clears the highlighted drag-selection box drawn by the DragBox.
     *
     * @returns {DragBox} The calling DragBox.
     */
    public clearBox() {
      if (this.dragBox == null) {return;} // HACKHACK #593
      this.dragBox.attr("height", 0).attr("width", 0);
      this.boxIsDrawn = false;
      return this;
    }

    /**
     * Set where the box is draw explicitly.
     *
     * @param {number} x0 Left.
     * @param {number} x1 Right.
     * @param {number} y0 Top.
     * @param {number} y1 Bottom.
     *
     * @returns {DragBox} The calling DragBox.
     */
    public setBox(x0: number, x1: number, y0: number, y1: number) {
      if (this.dragBox == null) {return;} // HACKHACK #593
      var w = Math.abs(x0 - x1);
      var h = Math.abs(y0 - y1);
      var xo = Math.min(x0, x1);
      var yo = Math.min(y0, y1);
      this.dragBox.attr({x: xo, y: yo, width: w, height: h});
      this.boxIsDrawn = (w > 0 && h > 0);
      return this;
    }

    public _anchor(component: Abstract.Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var background = this._componentToListenTo._backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      return this;
    }
  }
}
}
