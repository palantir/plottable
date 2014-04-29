///<reference path="../../reference.ts" />

module Plottable {
  export class DragBoxInteraction extends DragInteraction {
    private static CLASS_DRAG_BOX = "drag-box";
    public dragBox: D3.Selection;

    public _dragstart() {
      super._dragstart();
      this.clearBox();
    }

    /**
     * Clears the highlighted drag-selection box drawn by the AreaInteraction.
     *
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox() {
      this.dragBox.attr("height", 0).attr("width", 0);
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
