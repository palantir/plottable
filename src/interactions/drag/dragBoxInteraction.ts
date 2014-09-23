///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  /**
   * A DragBox is an interaction that automatically draws a box across the
   * element you attach it to when you drag.
   */
  export class DragBox extends Drag {
    private static CLASS_DRAG_BOX = "drag-box";
    public static RESIZE_PADDING = 10;
    /**
     * The DOM element of the box that is drawn. When no box is drawn, it is
     * null.
     */
    public dragBox: D3.Selection;
    /**
     * The currently selected area, which can be different from the are the user has dragged.
     */
    public selection: SelectionArea;
    public _boxIsDrawn = false;
    public _selectionOrigin: number[];
    public _resizeXEnabled = false;
    public _resizeYEnabled = false;
    private _isResizingX = false;
    private _isResizingY = false;
    private _resizeEnabled = false;
    private resizeStartDiff: number[] = [];
    private lastCursorStyle = "";

    // Returns true if `val` is "close enough" to `position`.
    public _isCloseEnoughLeft(val: number, position: number, len: number): boolean {
      var leftPadding: number = DragBox.RESIZE_PADDING;
      var rightPadding: number = Math.min(DragBox.RESIZE_PADDING, len / 2);
      return position - leftPadding <= val && val <= position + rightPadding;
    }

    public _isCloseEnoughRight(val: number, position: number, len: number): boolean {
      var leftPadding = Math.min(DragBox.RESIZE_PADDING, len / 2);
      var rightPadding = DragBox.RESIZE_PADDING;
      return position - leftPadding <= val && val <= position + rightPadding;
    }

    /**
     * Gets whether resizing is enabled or not.
     *
     * @returns {boolean}
     */
    public resizeEnabled(): boolean;
    /**
     * Enables or disables resizing.
     *
     * @param {boolean} enabled
     */
    public resizeEnabled(enabled: boolean): DragBox;
    public resizeEnabled(enabled?: boolean): any {
      if (enabled == null) {
        return this._resizeEnabled;
      } else {
        this._enableResize(enabled);
        return this;
      }
    }

    /**
     * Return true if box is resizing on the X dimension.
     *
     * @returns {boolean}
     */
    public isResizingX(): boolean {
      return this._isResizingX;
    }

    /**
     * Return true if box is resizing on the Y dimension.
     *
     * @returns {boolean}
     */
    public isResizingY(): boolean {
      return this._isResizingY;
    }

    /**
     * Whether or not dragBox has been rendered in a visible area.
     *
     * @returns {boolean}
     */
    public boxIsDrawn(): boolean {
      return this._boxIsDrawn;
    }

    /**
     * Return true if box is resizing.
     *
     * @returns {boolean}
     */
    public isResizing(): boolean {
      return this._isResizingX || this._isResizingY;
    }

    public _enableResize(enabled: boolean) {
      this._resizeEnabled = enabled;
    }

    private checkResizeStart() {
      var xOrigin = this._origin[0];
      var yOrigin = this._origin[1];
      var xStart = parseInt(this.dragBox.attr("x"), 10);
      var yStart = parseInt(this.dragBox.attr("y"), 10);
      var width = parseInt(this.dragBox.attr("width"), 10);
      var height = parseInt(this.dragBox.attr("height"), 10);
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      if (this._resizeXEnabled && this.isInsideBox(yOrigin, yStart, yEnd)) {
        if (this._isCloseEnoughLeft(xOrigin, xStart, width)) {
          this._selectionOrigin[0] = xEnd;
          this.resizeStartDiff[0] = xStart - xOrigin;
          this._isResizingX = true;
        } else if (this._isCloseEnoughRight(xOrigin, xEnd, width)) {
          this._selectionOrigin[0] = xStart;
          this.resizeStartDiff[0] = xEnd - xOrigin;
          this._isResizingX = true;
        } else {
          this._isResizingX = false;
        }
      } else {
        this._isResizingX = false;
      }
      if (this._resizeYEnabled && this.isInsideBox(xOrigin, xStart, xEnd)) {
        if (this._isCloseEnoughLeft(yOrigin, yStart, height)) {
          this._selectionOrigin[1] = yEnd;
          this.resizeStartDiff[1] = yStart - yOrigin;
          this._isResizingY = true;
        } else if (this._isCloseEnoughRight(yOrigin, yEnd, height)) {
          this._selectionOrigin[1] = yStart;
          this.resizeStartDiff[1] = yEnd - yOrigin;
          this._isResizingY = true;
        } else {
          this._isResizingY = false;
        }
      } else {
        this._isResizingY = false;
      }
    }

    /**
     * Checks if the cursor is inside the dragBox for the given dimension.
     */
    private isInsideBox(origin: number, from: number, to: number): boolean {
      return origin + DragBox.RESIZE_PADDING > from && origin - DragBox.RESIZE_PADDING < to;
    }

    public _doDragstart() {
      this._selectionOrigin = this._origin.slice();
      if (this._boxIsDrawn) {
        if (!this._resizeEnabled) {
          this.clearBox();
        } else {
          this.checkResizeStart();
          if (!this._isResizingX && !this._isResizingY) {
            this.clearBox();
          }
        }
      }
      super._doDragstart();
    }

    public _drag() {
      var x = d3.event.x;
      var y = d3.event.y;
      var diffX = this.resizeStartDiff[0];
      var diffY = this.resizeStartDiff[1];
      // Eases the mouse into the center of the dragging line, in case dragging started with the mouse
      // away from the center due to `DragBox.RESIZE_PADDING`.
      if (this._isResizingX && diffX !== 0) {
        x += diffX;
        this.resizeStartDiff[0] += diffX > 0 ? -1 : 1;
      }
      if (this._isResizingY && diffY !== 0) {
        y += diffY;
        this.resizeStartDiff[1] += diffY > 0 ? -1 : 1;
      }
      this._location = [this._constrainX(x), this._constrainY(y)];
      this._doDrag();
    }

    public _doDragend() {
      this._isResizingX = false;
      this._isResizingY = false;
      super._doDragend();
    }

    /**
     * Clears the highlighted drag-selection box drawn by the DragBox.
     *
     * @returns {DragBox} The calling DragBox.
     */
    public clearBox() {
      if (this.dragBox == null) {return;} // HACKHACK #593
      this.dragBox.attr("height", 0).attr("width", 0);
      this._boxIsDrawn = false;
      return this;
    }

    /**
     * Set where the box is draw explicitly.
     *
     * @param {number} x0 Left.
     * @param {number} x1 Right.
     * @param {number} y0 Top.
     * @param {number} y1 Bottom.
     *
     * @returns {DragBox} The calling DragBox.
     */
    public setBox(x0: number, x1: number, y0: number, y1: number) {
      if (this.dragBox == null) {return;} // HACKHACK #593
      var w = Math.abs(x0 - x1);
      var h = Math.abs(y0 - y1);
      var xo = Math.min(x0, x1);
      var yo = Math.min(y0, y1);
      this.dragBox.attr({x: xo, y: yo, width: w, height: h});
      this._boxIsDrawn = (w > 0 && h > 0);
      this.selection = {
        xMin: xo,
        xMax: xo + w,
        yMin: yo,
        yMax: yo + h
      };
      return this;
    }

    public _anchor(component: Abstract.Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var background = this._componentToListenTo._backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.on("mousemove", () => this._hover());
      return this;
    }

    public _hover() {
      if (this._resizeEnabled) {
        var cursorStyle: string;
        if (this._boxIsDrawn) {
          var position = d3.mouse(this._hitBox[0][0].parentNode);
          cursorStyle = this._cursorStyle(position[0], position[1]);
          if (!cursorStyle && this._isDragging) {
            cursorStyle = this.lastCursorStyle;
          }
          this.lastCursorStyle = cursorStyle;
        } else if (this._isResizingX || this._isResizingY) {
          cursorStyle = this.lastCursorStyle;
        } else {
          cursorStyle = "";
        }
        this._hitBox.style("cursor", cursorStyle);
      }
    }

    public _cursorStyle(x: number, y: number): string {
      return "";
    }
  }
}
}
