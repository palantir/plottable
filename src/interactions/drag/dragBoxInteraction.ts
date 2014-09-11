///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class DragBox extends Drag {
    private static CLASS_DRAG_BOX = "drag-box";
    public dragBox: D3.Selection;
    public boxIsDrawn = false;
    public resizePadding = 10;
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
    private resizeEnabled = false;
    private resizeStartDiff: number[] = [];
    private lastCursorStyle = "";

    // Returns true if `val` is "close enough" to `position`.
    public _isCloseEnoughLeft(val: number, position: number, len: number): boolean {
      var leftPadding: number = this.resizePadding;
      var rightPadding: number = Math.min(this.resizePadding, len / 2);
      return position - leftPadding <= val && val <= position + rightPadding;
    }

    public _isCloseEnoughRight(val: number, position: number, len: number): boolean {
      var leftPadding = Math.min(this.resizePadding, len / 2);
      var rightPadding = this.resizePadding;
      return position - leftPadding <= val && val <= position + rightPadding;
    }

    /**
     * Gets whether resizing is enabled or not.
     *
     * @returns {boolean}
     */
    public resize(): boolean;
    /**
     * Enables or disables resizing.
     *
     * @param {boolean} enabled
     */
    public resize(enabled: boolean): DragBox;
    public resize(enabled?: boolean): any {
      if (enabled == null) {
        return this.resizeEnabled;
      } else {
        this.resizeEnabled = enabled;
        return this;
      }
    }

    public _isResizeStartAttr(isX: boolean): boolean {
      var i1: number, i2: number, positionAttr1: string, positionAttr2: string, lengthAttr1: string, lengthAttr2: string;
      if (isX) {
        i1 = 0;
        i2 = 1;
        positionAttr1 = "x";
        positionAttr2 = "y";
        lengthAttr1 = "width";
        lengthAttr2 = "height";
      } else {
        i1 = 1;
        i2 = 0;
        positionAttr1 = "y";
        positionAttr2 = "x";
        lengthAttr1 = "height";
        lengthAttr2 = "width";
      }
      var otherOrigin = this.origin[i2];
      var from = parseInt(this.dragBox.attr(positionAttr2), 10);
      var to = parseInt(this.dragBox.attr(lengthAttr2), 10) + to;
      if (otherOrigin < from || otherOrigin > to) {
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

    public _isResizeStart(): boolean {
      return false;
    }

    public _doDragstart() {
      this._selectionOrigin = this.origin.slice();
      if (this.boxIsDrawn) {
        if (!this.resizeEnabled) {
          this.clearBox();
        } else {
          this.isResizing = this._isResizeStart();
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
     * Clears the highlighted drag-selection box drawn by the AreaInteraction.
     *
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox() {
      if (this.dragBox == null) {return;} // HACKHACK #593
      this.dragBox.attr("height", 0).attr("width", 0);
      this.boxIsDrawn = false;
      return this;
    }

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

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var background = this.componentToListenTo.backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.on("mousemove", () => this._hover());
      return this;
    }

    public _hover() {
      if (this.resizeEnabled) {
        var cursorStyle: string;
        if (this.boxIsDrawn) {
          var position = d3.mouse(this.hitBox[0][0].parentNode);
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
        this.hitBox.style("cursor", cursorStyle);
      }
    }

    public _cursorStyle(x: number, y: number): string {
      return "";
    }
  }
}
}
