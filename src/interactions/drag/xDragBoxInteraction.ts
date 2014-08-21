///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      var x1 = this.location[0];
      if (this.isResizing) {
        x1 += this._resizeStartDiff[0];
      }
      this.setBox(this._selectionOrigin[0], x1);
    }

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this.componentToListenTo.availableHeight);
      return this;
    }

    public _isResizeStart(): boolean {
      return this._isResizeStartAttr(true);
    }

    public _cursorStyle(x: number, y: number): string {
      var c1 = parseInt(this.dragBox.attr("x"), 10);
      var c2 = parseInt(this.dragBox.attr("width"), 10) + c1;
      if (this._isCloseEnough(x, c1, this.resizePadding) ||
          this._isCloseEnough(x, c2, this.resizePadding)) {
        return "ew-resize";
      } else {
        return "";
      }
    }
  }
}
}
