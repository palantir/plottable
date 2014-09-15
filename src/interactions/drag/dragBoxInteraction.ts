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
     * Whether or not dragBox has been rendered in a visible area.
     */
    public boxIsDrawn = false;
    /**
     * The currently selected area, which can be different from the are the user has dragged.
     */
    public selection: SelectionArea;
    /**
     * True if box is resizing on the X dimension.
     */
    public isResizingX = false;
    /**
     * True if box is resizing on the Y dimension.
     */
    public isResizingY = false;
    /**
     * True if box is resizing.
     */
    public isResizing = false;
    public _selectionOrigin: number[];
    public _resizeXEnabled = false;
    public _resizeYEnabled = false;
    private resizeEnabled = false;
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
    public isResizeEnabled(): boolean;
    /**
     * Enables or disables resizing.
     *
     * @param {boolean} enabled
     */
    public isResizeEnabled(enabled: boolean): DragBox;
    public isResizeEnabled(enabled?: boolean): any {
      if (enabled == null) {
        return this.resizeEnabled;
      } else {
        this._enableResize();
        return this;
      }
    }

    public _enableResize() {
      this.resizeEnabled = true;
    }

    private isResizeStartAttr(isX: boolean): boolean {
      var i1 = isX ? 0 : 1;
      var i2 = isX ? 1 : 0;
      var positionAttr1 = isX ? "x" : "y";
      var positionAttr2 = isX ? "y" : "x";
      var lengthAttr1 = isX ? "width" : "height";
      var lengthAttr2 = isX ? "height": "width";
      var otherOrigin = this.origin[i2];
      var from = parseInt(this.dragBox.attr(positionAttr2), 10);
      var to = parseInt(this.dragBox.attr(lengthAttr2), 10) + from;
      if (otherOrigin + DragBox.RESIZE_PADDING < from || otherOrigin - DragBox.RESIZE_PADDING > to) {
        return false;
      }
      var attrOrigin = this.origin[i1];
      var leftPosition = parseInt(this.dragBox.attr(positionAttr1), 10);
      var len = parseInt(this.dragBox.attr(lengthAttr1), 10);
      var rightPosition = len + leftPosition;
      var leftResult = this._isCloseEnoughLeft(attrOrigin, leftPosition, len);
      if (leftResult) {
        this._selectionOrigin[i1] = rightPosition;
        this.resizeStartDiff[i1] = leftPosition - attrOrigin;
      }
      var rightResult = this._isCloseEnoughRight(attrOrigin, rightPosition, len);
      if (rightResult) {
        this._selectionOrigin[i1] = leftPosition;
        this.resizeStartDiff[i1] = rightPosition - attrOrigin;
      }
      return leftResult || rightResult;
    }

    public _doDragstart() {
      this._selectionOrigin = this.origin.slice();
      if (this.boxIsDrawn) {
        if (!this.resizeEnabled) {
          this.clearBox();
        } else {
          this.isResizingX = this._resizeXEnabled && this.isResizeStartAttr(true);
          this.isResizingY = this._resizeYEnabled && this.isResizeStartAttr(false);
          this.isResizing = this.isResizingX || this.isResizingY;
          if (!this.isResizing) {
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
      if (this.isResizingX && diffX !== 0) {
        x += diffX;
        this.resizeStartDiff[0] += diffX > 0 ? -1 : 1;
      }
      if (this.isResizingY && diffY !== 0) {
        y += diffY;
        this.resizeStartDiff[1] += diffY > 0 ? -1 : 1;
      }
      this.location = [this._constrainX(x), this._constrainY(y)];
      this._doDrag();
    }

    public _doDragend() {
      this.isResizingX = false;
      this.isResizingY = false;
      this.isResizing = false;
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
      this.boxIsDrawn = false;
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
      this.boxIsDrawn = (w > 0 && h > 0);
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
      if (this.resizeEnabled) {
        var cursorStyle: string;
        if (this.boxIsDrawn) {
          var position = d3.mouse(this._hitBox[0][0].parentNode);
          cursorStyle = this._cursorStyle(position[0], position[1]);
          if (!cursorStyle && this._isDragging) {
            cursorStyle = this.lastCursorStyle;
          }
          this.lastCursorStyle = cursorStyle;
        } else if (this.isResizing) {
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
