///<reference path="../../reference.ts" />

module Plottable {
  export class DragBoxInteraction extends DragInteraction {
    private static CLASS_DRAG_BOX = "drag-box";
    public dragBox: D3.Selection;
    public boxIsDrawn = false;

    public _dragstart() {
      super._dragstart();
      if (this.callbackToCall != null) {
        this.callbackToCall(null);
      }
      this.clearBox();
    }

    /**
     * Clears the highlighted drag-selection box drawn by the AreaInteraction.
     *
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox() {
      this.dragBox.attr("height", 0).attr("width", 0);
      this.boxIsDrawn = false;
      return this;
    }

    public setBox(x0: number, x1: number, y0: number, y1: number) {
      var w = Math.abs(x0 - x1);
      var h = Math.abs(y0 - y1);
      var xo = Math.min(x0, x1);
      var yo = Math.min(y0, y1);
      this.dragBox.attr({x: xo, y: yo, width: w, height: h});
      this.boxIsDrawn = (w > 0 && h > 0);
      return this;
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      var cname = DragBoxInteraction.CLASS_DRAG_BOX;
      var background = this.componentToListenTo.backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      return this;
    }
  }
}
