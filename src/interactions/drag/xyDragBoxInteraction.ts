///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {

    public _drag(){
      super._drag();
      if (this.dragBox == null) {return;}
      var drawnX = true;
      var drawnY = true;
      var x0 = this._selectionOrigin[0];
      var x1 = this._location[0];
      var y0 = this._selectionOrigin[1];
      var y1 = this._location[1];
      if (this._dragBoxAttr == null) {
        this._dragBoxAttr = {x: 0, width: 0, y: 0, height: 0};
      }

      if (!this.resizeEnabled() || this.isResizingX() || !this.isResizingY()) {
        this._dragBoxAttr.width = Math.abs(x0 - x1);
        this._dragBoxAttr.x = Math.min(x0, x1);
        drawnX = this._dragBoxAttr.width > 0;
      }
      if (!this.resizeEnabled() || this.isResizingY() || !this.isResizingX()) {
        this._dragBoxAttr.height = Math.abs(y0 - y1);
        this._dragBoxAttr.y = Math.min(y0, y1);
        drawnY = this._dragBoxAttr.height > 0;
      }
      this.dragBox.attr(this._dragBoxAttr);
      var xMin = this._dragBoxAttr.x;
      var yMin = this._dragBoxAttr.y;
      this.selection = {
        xMin: xMin,
        xMax: this._dragBoxAttr.width + xMin,
        yMin: yMin,
        yMax: this._dragBoxAttr.height + yMin
      };
      this._boxIsDrawn = drawnX && drawnY;
    }

    public _cursorStyle(xOrigin: number, yOrigin: number): string {
      var xStart = this._dragBoxAttr.x;
      var width = this._dragBoxAttr.width;
      var xEnd = width + xStart;
      var yStart = this._dragBoxAttr.y;
      var height = this._dragBoxAttr.height;
      var yEnd = height + yStart;
      var otherWidthPadding = Math.min(DragBox.RESIZE_PADDING, width / 2);
      var otherHeightPadding = Math.min(DragBox.RESIZE_PADDING, height / 2);
      var left = this._isCloseEnoughLeft(xOrigin, xStart, width);
      var top = this._isCloseEnoughLeft(yOrigin, yStart, height);
      var right = this._isCloseEnoughRight(xOrigin, xEnd, width);
      var bottom = this._isCloseEnoughRight(yOrigin, yEnd, height);

      if (this.isResizingX() && this.isResizingY()) {
        if (left && top || bottom && right) {
          return "nwse-resize";
        } else if (top && right || bottom && left) {
          return "nesw-resize";
        } else {
          return "";
        }
      } else if (this.isResizingX()) {
        return left || right ? "ew-resize" : "";
      } else if (this.isResizingY()) {
        return top || bottom ? "ns-resize": "";
      }

      if (left && top || bottom && right) {
        return "nwse-resize";
      } else if (top && right || bottom && left) {
        return "nesw-resize";
      } else if ((left || right) && yStart - DragBox.RESIZE_PADDING <= yOrigin && yOrigin <= yEnd + DragBox.RESIZE_PADDING) {
        return "ew-resize";
      } else if ((top || bottom) && xStart - DragBox.RESIZE_PADDING <= xOrigin && xOrigin <= xEnd + DragBox.RESIZE_PADDING) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
