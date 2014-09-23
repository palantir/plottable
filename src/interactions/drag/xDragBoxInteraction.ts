///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._selectionOrigin[0], this._location[0]);
    }

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this._componentToListenTo.height());
      return this;
    }

    public _enableResize(enabled: boolean) {
      super._enableResize(enabled);
      this._resizeXEnabled = enabled;
    }

    public _cursorStyle(x: number, y: number): string {
      var leftPosition = this._dragBoxAttr.x;
      var width = this._dragBoxAttr.width;
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
