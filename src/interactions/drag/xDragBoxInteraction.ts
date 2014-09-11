///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      var x1 = this.location[0];
      this.setBox(this._selectionOrigin[0], x1);
    }

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this.componentToListenTo.availableHeight);
      return this;
    }

    public _isResizeStart(): boolean {
      this.isResizingX = this._isResizeStartAttr(true);
      return this.isResizingX;
    }

    public _cursorStyle(x: number, y: number): string {
      var leftPosition = parseInt(this.dragBox.attr("x"), 10);
      var width = parseInt(this.dragBox.attr("width"), 10);
      var rightPosition = width + leftPosition;
      if (this._isCloseEnoughLeft(x, leftPosition, width) ||
          this._isCloseEnoughRight(x, rightPosition, width)) {
        return "ew-resize";
      } else {
        return "";
      }
    }
  }
}
}
