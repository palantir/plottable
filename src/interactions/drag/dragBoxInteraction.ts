///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class DragBox extends Drag {
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
      if (this.dragBox == null) {return;} // HACKHACK #593
      this.dragBox.attr("height", 0).attr("width", 0);
      this.boxIsDrawn = false;
      return this;
    }

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

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var foreground = this.componentToListenTo.foregroundContainer;
      this.dragBox = foreground.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      return this;
    }
  }
}
}
