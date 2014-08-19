///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class DragBox extends Drag {
    private static CLASS_DRAG_BOX = "drag-box";
    public dragBox: D3.Selection;
    public boxIsDrawn = false;
    public _resizeEnabled = false;
    public resizePadding = 10;
    public _selectionOrigin: number[];
    public selection: SelectionArea;
    public isResizing = false;
    public _lastCursorStyle = "";

    public _isCloseEnough(val: number, position: number, padding: number): boolean {
      return position - padding <= val && val <= position + padding;
    }

    public _isCloseEnoughXY(val: number, position: number, padding: number, halfLength: number, isLeft: boolean): boolean {
      var leftValue: number, rightValue: number;
      if (isLeft) {
        leftValue = position - padding;
        rightValue = position + Math.min(halfLength, padding);
      } else {
        leftValue = position - Math.min(halfLength, padding);
        rightValue = position + padding;
      }
      return leftValue <= val && val <= rightValue;
    }

    /**
     * Gets wether resizing is enabled or not.
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
        return this._resizeEnabled;
      } else {
        this._resizeEnabled = enabled;
        return this;
      }
    }

    public _isResizeStartAttr(isX: boolean): boolean {
      var i: number, positionAttr: string, lengthAttr: string;
      if (isX) {
        i = 0;
        positionAttr = "x";
        lengthAttr = "width";
      } else {
        i = 1;
        positionAttr = "y";
        lengthAttr = "height";
      }
      var origin = this.origin[i];
      var c1 = parseInt(this.dragBox.attr(positionAttr), 10);
      var c2 = parseInt(this.dragBox.attr(lengthAttr), 10) + c1;
      var result1 = this._isCloseEnough(origin, c1, this.resizePadding);
      if (result1) {
        this._selectionOrigin[i] = c2;
      }
      var result2 = this._isCloseEnough(origin, c2, this.resizePadding);
      if (result2) {
        this._selectionOrigin[i] = c1;
      }
      return result1 || result2;
    }

    public _isResizeStart(): boolean {
      return false;
    }

    public _doDragstart() {
      this._selectionOrigin = this.origin.slice();
      if (this.boxIsDrawn) {
        if (!this._resizeEnabled || !(this.isResizing = this._isResizeStart())) {
          this.clearBox();
        }
      }
      super._doDragstart();
    }

    public _doDragend() {
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
      if (this._resizeEnabled) {
        var cursorStyle: string;
        if (this.boxIsDrawn) {
          var position = d3.mouse(this.hitBox[0][0].parentNode);
          cursorStyle = this._cursorStyle(position[0], position[1]);
        } else if (this.isResizing) {
          cursorStyle = this._lastCursorStyle;
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
