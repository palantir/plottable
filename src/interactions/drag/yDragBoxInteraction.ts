///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      var y1 = this.location[1];
      this.setBox(this._selectionOrigin[1], y1);
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this.componentToListenTo.availableWidth, y0, y1);
      return this;
    }

    public _isResizeStart(): boolean {
      this.isResizingY = this._isResizeStartAttr(false);
      return this.isResizingY;
    }

    public _cursorStyle(x: number, y: number): string {
      var c1 = parseInt(this.dragBox.attr("y"), 10);
      var c2 = parseInt(this.dragBox.attr("height"), 10) + c1;
      if (this._isCloseEnough(y, c1, this.resizePadding) ||
          this._isCloseEnough(y, c2, this.resizePadding)) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
