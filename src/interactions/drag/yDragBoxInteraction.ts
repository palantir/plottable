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
      var height = parseInt(this.dragBox.attr("height"), 10);
      var c2 = height + c1;
      var otherPadding = Math.min(this.resizePadding, height / 2);
      if (this._isCloseEnough(y, c1, this.resizePadding, otherPadding) ||
          this._isCloseEnough(y, c2, otherPadding, this.resizePadding)) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
