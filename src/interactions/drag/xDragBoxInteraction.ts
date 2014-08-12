///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._selectionOrigin[0], this.location[0]);
    }

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this.componentToListenTo.availableHeight);
      return this;
    }

    public _isResizeStart(): boolean {
      return this._isResizeStartAttr(0, "x", "width");
    }

    public _cursorStyle(x: number, y: number): string {
      var c1 = parseInt(this.dragBox.attr("x"), 10);
      var c2 = parseInt(this.dragBox.attr("width"), 10) + c1;
      if (this._isCloseEnough(x, c1) || this._isCloseEnough(x, c2)) {
        return "ew-resize";
      } else {
        return "";
      }
    }
  }
}
}
