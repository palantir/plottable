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
    public static _canResizeX = true;
    public static _canResizeY = true;
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
    public _dragBoxAttr: SVGRect;
    private _isResizingX = false;
    private _isResizingY = false;
    private xResizeOrigin = false; // record whether xResize is on "origin" or "location"
    private yResizeOrigin = false;
    private resizeStartDiff: number[] = [];
    private cursorStyle = "";

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
        return this._resizeXEnabled || this._resizeYEnabled;
      } else {
        this._resizeXEnabled = enabled && (<typeof DragBox> this.constructor)._canResizeX;
        this._resizeYEnabled = enabled && (<typeof DragBox> this.constructor)._canResizeY;
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

    public _dragstart() {
      if (this.boxIsDrawn() && this.checkResizeStart()) {
        // we are resizing; don't clear the box, don't call the dragstart callback
        return;
      } else {
        super._dragstart();
        this.clearBox();
      }
    }

    private checkResizeStart() {
      var xPosition = d3.mouse(this._hitBox[0][0].parentNode)[0];
      var yPosition = d3.mouse(this._hitBox[0][0].parentNode)[1];
      var xStart  = this._dragBoxAttr.x;
      var yStart  = this._dragBoxAttr.y;
      var width   = this._dragBoxAttr.width;
      var height  = this._dragBoxAttr.height;
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      this._isResizingX = false;
      this._isResizingY = false;

      if (this._resizeXEnabled && this.isInsideBox(yPosition, yStart, yEnd)) {
        if (this._isCloseEnoughLeft(xPosition, xStart, width)) {
          this.xResizeOrigin = this._getOrigin()[0] < this._getLocation()[0];
          this.resizeStartDiff[0] = xStart - xPosition;
          this._isResizingX = true;
        } else if (this._isCloseEnoughRight(xPosition, xEnd, width)) {
          this.xResizeOrigin = this._getOrigin()[0] > this._getLocation()[0];
          this.resizeStartDiff[0] = xEnd - xPosition;
          this._isResizingX = true;
        }
      }
      if (this._resizeYEnabled && this.isInsideBox(xPosition, xStart, xEnd)) {
        if (this._isCloseEnoughLeft(yPosition, yStart, height)) {
          this.yResizeOrigin = this._getOrigin()[1] < this._getLocation()[1];
          this.resizeStartDiff[1] = yStart - yPosition;
          this._isResizingY = true;
        } else if (this._isCloseEnoughRight(yPosition, yEnd, height)) {
          this.yResizeOrigin = this._getOrigin()[1] > this._getLocation()[1];
          this.resizeStartDiff[1] = yEnd - yPosition;
          this._isResizingY = true;
        }
      }
      return this.isResizing();
    }

    /**
     * Checks if the cursor is inside the dragBox for the given dimension.
     */
    private isInsideBox(origin: number, from: number, to: number): boolean {
      return Plottable._Util.Methods.inRange(origin, from - DragBox.RESIZE_PADDING, to + DragBox.RESIZE_PADDING);
    }


    public _drag() {
      if (this.isResizing()) {
        // Eases the mouse into the center of the dragging line, in case dragging started with the mouse
        // away from the center due to `DragBox.RESIZE_PADDING`.
        if (this.isResizingX()) {
          var diffX = this.resizeStartDiff[0];
          var x = d3.event.x;
          if (diffX !== 0) {
            x += diffX;
            this.resizeStartDiff[0] += diffX > 0 ? -1 : 1;
          }
          if (this.xResizeOrigin) {
            this._setOrigin(this._constrainX(x), this._getOrigin()[1]);
          } else {
            this._setLocation(this._constrainX(x), this._getLocation()[1]);
          }
        }

        if (this.isResizingY()) {
          var diffY = this.resizeStartDiff[1];
          var y = d3.event.y;
          if (diffY !== 0) {
            y += diffY;
            this.resizeStartDiff[1] += diffY > 0 ? -1 : 1;
          }
          if (this.yResizeOrigin) {
            this._setOrigin(this._getOrigin()[0], this._constrainY(y));
          } else {
            this._setLocation(this._getLocation()[0], this._constrainY(y));
          }
        }

        this._doDrag();
      } else {
        super._drag();
      }
      this.setBox(this._getOrigin()[0], this._getLocation()[0], this._getOrigin()[1], this._getLocation()[1]);
    }

    public _dragend() {
      this._isResizingX = false;
      this._isResizingY = false;
      super._dragend();
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
      var w  = Math.abs(x0 - x1);
      var h  = Math.abs(y0 - y1);
      var xo = Math.min(x0, x1);
      var yo = Math.min(y0, y1);
      var newProps: SVGRect = {x: xo, y: yo, width: w, height: h};
      this.dragBox.attr(newProps);
      this._dragBoxAttr = newProps;
      this._boxIsDrawn = (w > 0 && h > 0);
      this.selection = {
        xMin: xo,
        xMax: xo + w,
        yMin: yo,
        yMax: yo + h
      };
      return this;
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var background = this._componentToListenTo._backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.on("mousemove", () => this._hover());
      return this;
    }

    public _hover() {
      if (this.resizeEnabled() && !this._isDragging && this._boxIsDrawn) {
        var position = d3.mouse(this._hitBox[0][0].parentNode);
        this.cursorStyle = this.getCursorStyle(position[0], position[1]);
      }
      if (!this._boxIsDrawn) {
        this.cursorStyle = "";
      }
      this._hitBox.style("cursor", this.cursorStyle);
    }

    private getCursorStyle(xOrigin: number, yOrigin: number): string {
      var xStart = this._dragBoxAttr.x;
      var width = this._dragBoxAttr.width;
      var xEnd = width + xStart;
      var yStart = this._dragBoxAttr.y;
      var height = this._dragBoxAttr.height;
      var yEnd = height + yStart;
      var left = false, top = false, right = false, bottom = false;
      if (this._resizeXEnabled) {
        left = this._isCloseEnoughLeft(xOrigin, xStart, width);
        right = this._isCloseEnoughRight(xOrigin, xEnd, width);
      }
      if (this._resizeYEnabled) {
        top = this._isCloseEnoughLeft(yOrigin, yStart, height);
        bottom = this._isCloseEnoughRight(yOrigin, yEnd, height);
      }

      if (left && top || bottom && right) {
        return "nwse-resize";
      } else if (top && right || bottom && left) {
        return "nesw-resize";
      } else if ((left || right) && this.isInsideBox(yOrigin, yStart, yEnd)) {
        return "ew-resize";
      } else if ((top || bottom) && this.isInsideBox(xOrigin, xStart, xEnd)) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
