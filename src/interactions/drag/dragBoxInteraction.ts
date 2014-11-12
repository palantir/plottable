///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  /**
   * A DragBox is an interaction that automatically draws a box across the
   * element you attach it to when you drag.
   */
  interface ResizeDimension {
    offset: number; // px offset between where the resize drag started and the edge of the box (<= RESIZE_PADDING)
    origin: boolean; // whether we are resizing the origin coordinate or the location coordinate
    positive: boolean; // whether the resize is on the positive edge or the negative edge of the dragbox
  }

  interface ResizeInfo {
    xResizing: ResizeDimension; // null if x not resizing
    yResizing: ResizeDimension; // null if y not resizing
  }
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
    public _boxIsDrawn = false;
    public _resizeXEnabled = false;
    public _resizeYEnabled = false;
    private resizing: ResizeInfo = {xResizing: null, yResizing: null};
    private cursorStyle = "";

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
      return !!this.resizing.xResizing;
    }

    /**
     * Return true if box is resizing on the Y dimension.
     *
     * @returns {boolean}
     */
    public isResizingY(): boolean {
      return !!this.resizing.yResizing;
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
      return this.isResizingX() || this.isResizingY();
    }

    public _dragstart() {
      var mouse = d3.mouse(this._hitBox[0][0].parentNode);

      if (this.boxIsDrawn() && (this.resizing = this.getResizeInfo(mouse[0], mouse[1])) && this.isResizing()) {
        // we are resizing; don't clear the box, don't call the dragstart callback
        return;
      }
      super._dragstart();
      this.clearBox();
    }

    private getResizeInfo(xPosition: number, yPosition: number) {
      var xResizing: ResizeDimension = null;
      var yResizing: ResizeDimension = null;
      var xStart = this._getOrigin()[0];
      var yStart = this._getOrigin()[1];
      var xEnd = this._getLocation()[0];
      var yEnd = this._getLocation()[1];
      var padding = DragBox.RESIZE_PADDING;

      function inPaddedRange(position: number, start: number, end: number, padding: number) {
        return Math.min(start, end) - padding <= position && position <= Math.max(start, end) + padding;
      }

      function getResizeDimension(origin: number, destination: number, position: number, padding: number): ResizeDimension {
        // origin: where the drag began
        // destination: where the drag ended
        // position: where the cursor currently is (possibly the start of a resize)
        var min = Math.min(origin, destination);
        var max = Math.max(origin, destination);
        var interiorPadding = Math.min(padding, (max-min)/2);
        if (min - padding < position && position < min + interiorPadding) {
          return {offset: position - min, positive: false, origin: origin === min};
        }
        if (max - interiorPadding < position && position < max + padding) {
          return {offset: position - max, positive: true, origin: origin === max};
        }
        return null;
      }

      if (this._resizeXEnabled && inPaddedRange(yPosition, yStart, yEnd, padding)) {
        xResizing = getResizeDimension(xStart, xEnd, xPosition, padding);
      }
      if (this._resizeYEnabled && inPaddedRange(xPosition, xStart, xEnd, padding)) {
        yResizing = getResizeDimension(yStart, yEnd, yPosition, padding);
      }
      return {xResizing: xResizing, yResizing: yResizing};
    }


    public _drag() {
      if (this.isResizing()) {
        // Eases the mouse into the center of the dragging line, in case dragging started with the mouse
        // away from the center due to `DragBox.RESIZE_PADDING`.
        if (this.isResizingX()) {
          var diffX = this.resizing.xResizing.offset;
          var x = d3.event.x;
          if (diffX !== 0) {
            x += diffX;
            this.resizing.xResizing.offset += diffX > 0 ? -1 : 1;
          }
          if (this.resizing.xResizing.origin) {
            this._setOrigin(this._constrainX(x), this._getOrigin()[1]);
          } else {
            this._setLocation(this._constrainX(x), this._getLocation()[1]);
          }
        }

        if (this.isResizingY()) {
          var diffY = this.resizing.yResizing.offset;
          var y = d3.event.y;
          if (diffY !== 0) {
            y += diffY;
            this.resizing.yResizing.offset += diffY > 0 ? -1 : 1;
          }
          if (this.resizing.yResizing.origin) {
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
      this.resizing = {xResizing: null, yResizing: null};
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
      this.dragBox.attr({x: xo, y: yo, width: w, height: h});
      this._boxIsDrawn = (w > 0 && h > 0);
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
      } else if (!this._boxIsDrawn) {
        this.cursorStyle = "";
      }
      this._hitBox.style("cursor", this.cursorStyle);
    }

    private getCursorStyle(xOrigin: number, yOrigin: number): string {
      var resizeInfo = this.getResizeInfo(xOrigin, yOrigin);
      var left   = resizeInfo.xResizing && !resizeInfo.xResizing.positive;
      var right  = resizeInfo.xResizing &&  resizeInfo.xResizing.positive;
      var top    = resizeInfo.yResizing && !resizeInfo.yResizing.positive;
      var bottom = resizeInfo.yResizing &&  resizeInfo.yResizing.positive;

      if (left && top || bottom && right) {
        return "nwse-resize";
      } else if (top && right || bottom && left) {
        return "nesw-resize";
      } else if ((left || right)) {
        return "ew-resize";
      } else if ((top || bottom)) {
        return "ns-resize";
      } else {
        return "";
      }
    }
  }
}
}
