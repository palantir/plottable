///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {

    public _drag(){
      super._drag();
      if (this.dragBox == null) {return;}
      var attrs: BoxArea = {};
      var drawnX = true;
      var drawnY = true;
      var x0 = this._selectionOrigin[0];
      var x1 = this._location[0];
      var y0 = this._selectionOrigin[1];
      var y1 = this._location[1];

      if (!this.isResizeEnabled() || this.isResizingX || !this.isResizingY) {
        attrs.width = Math.abs(x0 - x1);
        attrs.x = Math.min(x0, x1);
        drawnX = attrs.width > 0;
      }
      if (!this.isResizeEnabled() || this.isResizingY || !this.isResizingX) {
        attrs.height = Math.abs(y0 - y1);
        attrs.y = Math.min(y0, y1);
        drawnY = attrs.height > 0;
      }
      this.dragBox.attr(attrs);
      var xMin = attrs.x || parseInt(this.dragBox.attr("x"), 10);
      var yMin = attrs.y || parseInt(this.dragBox.attr("y"), 10);
      this.selection = {
        xMin: xMin,
        xMax: (attrs.width || parseInt(this.dragBox.attr("width"), 10)) + xMin,
        yMin: yMin,
        yMax: (attrs.height || parseInt(this.dragBox.attr("height"), 10)) + yMin
      };
      this.boxIsDrawn = drawnX && drawnY;
    }

    public _enableResize() {
      super._enableResize();
      this._resizeXEnabled = true;
      this._resizeYEnabled = true;
    }

    public _cursorStyle(x: number, y: number): string {
      var x1 = parseInt(this.dragBox.attr("x"), 10);
      var width = parseInt(this.dragBox.attr("width"), 10);
      var x2 = width + x1;
      var y1 = parseInt(this.dragBox.attr("y"), 10);
      var height = parseInt(this.dragBox.attr("height"), 10);
      var y2 = height + y1;
      var otherWidthPadding = Math.min(DragBox.RESIZE_PADDING, width / 2);
      var otherHeightPadding = Math.min(DragBox.RESIZE_PADDING, height / 2);
      var left = this._isCloseEnoughLeft(x, x1, width);
      var top = this._isCloseEnoughLeft(y, y1, height);
      var right = this._isCloseEnoughRight(x, x2, width);
      var bottom = this._isCloseEnoughRight(y, y2, height);

      if (this.isResizingX && this.isResizingY) {
        if (left && top || bottom && right) {
          return "nwse-resize";
        } else if (top && right || bottom && left) {
          return "nesw-resize";
        } else {
          return "";
        }
      } else if (this.isResizingX) {
        return left || right ? "ew-resize" : "";
      } else if (this.isResizingY) {
        return top || bottom ? "ns-resize": "";
      }

      if (left && top || bottom && right) {
        return "nwse-resize";
      } else if (top && right || bottom && left) {
        return "nesw-resize";
      } else if ((left || right) && y1 - DragBox.RESIZE_PADDING <= y && y <= y2 + DragBox.RESIZE_PADDING) {
        return "ew-resize";
      } else if ((top || bottom) && x1 - DragBox.RESIZE_PADDING <= x && x <= x2 + DragBox.RESIZE_PADDING) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
