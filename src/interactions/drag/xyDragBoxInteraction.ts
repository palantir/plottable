///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    private isResizingX = false;
    private isResizingY = false;

    public _drag(){
      super._drag();
      if (this.dragBox == null) {return;}
      var attrs: any = {};
      var drawnX: boolean = true;
      var drawnY: boolean = true;
      var x0 = this._selectionOrigin[0];
      var x1 = this.location[0];
      var y0 = this._selectionOrigin[1];
      var y1 = this.location[1];
      if (!this.resizeEnabled || this.isResizingX || !this.isResizingY) {
        attrs.width = Math.abs(x0 - x1);
        attrs.x = Math.min(x0, x1);
        drawnX = attrs.width > 0;
      }
      if (!this.resizeEnabled || this.isResizingY || !this.isResizingX) {
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

    public _doDragend() {
      this.isResizingX = false;
      this.isResizingY = false;
      super._doDragend();
    }

    public _isResizeStart(): boolean {
      this.isResizingX = this._isResizeStartAttr(0, "x", "width");
      this.isResizingY = this._isResizeStartAttr(1, "y", "height");
      return this.isResizingX || this.isResizingY;
    }

    public _cursorStyle(x: number, y: number): string {
      var x1 = parseInt(this.dragBox.attr("x"), 10);
      var width = parseInt(this.dragBox.attr("width"), 10);
      var x2 = width + x1;
      var y1 = parseInt(this.dragBox.attr("y"), 10);
      var height = parseInt(this.dragBox.attr("height"), 10);
      var y2 = height + y1;
      var halfwidth = width / 2;
      var halfheight = height / 2;
      var left = this._isCloseEnoughXY(x, x1, halfwidth, false);
      var top = this._isCloseEnoughXY(y, y1, halfheight, false);
      var right = this._isCloseEnoughXY(x, x2, halfwidth, true);
      var bottom = this._isCloseEnoughXY(y, y2, halfheight, true);
      var cursorStyle = "";

      if (this.isResizingX && this.isResizingY) {
        if (left && top || bottom && right) {
          cursorStyle = "nwse-resize";
        } else if (top && right || bottom && left) {
          cursorStyle = "nesw-resize";
        }
        // Using the last cursor in case `this._cursorStyle()` returns empty.
        // This is to cover the cases where the user drags too fast.
        return this._lastCursorStyle = cursorStyle || this._lastCursorStyle;

      } else if (this.isResizingX) {
        cursorStyle = left || right ? "ew-resize" : "";
        return this._lastCursorStyle = cursorStyle || this._lastCursorStyle;

      } else if (this.isResizingY) {
        cursorStyle = top || bottom ? "ns-resize": "";
        return this._lastCursorStyle = cursorStyle || this._lastCursorStyle;
      }

      var hovering = y1 - this.resizePadding <= y && y <= y2 + this.resizePadding &&
        x1 - this.resizePadding <= x && x <= x2 + this.resizePadding;
      if (!hovering) {
        return "";
      }
      if (left && top || bottom && right) {
        return "nwse-resize";
      } else if (top && right || bottom && left) {
        return "nesw-resize";
      } else if (left || right) {
        return "ew-resize";
      } else if (top || bottom) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
