///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._selectionOrigin[1], this._location[1]);
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this._componentToListenTo.width(), y0, y1);
      return this;
    }

    public _enableResize(enabled: boolean) {
      super._enableResize(enabled);
      this._resizeYEnabled = enabled;
    }

    public _cursorStyle(x: number, y: number): string {
      var topPosition = parseInt(this.dragBox.attr("y"), 10);
      var height = parseInt(this.dragBox.attr("height"), 10);
      var bottomPosition = height + topPosition;
      if (this._isCloseEnoughLeft(y, topPosition, height) ||
          this._isCloseEnoughRight(y, bottomPosition, height)) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
