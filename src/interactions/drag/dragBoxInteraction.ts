///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class DragBox extends Drag {
    private static CLASS_DRAG_BOX = "drag-box";
    public dragBox: D3.Selection;
    public boxIsDrawn = false;
    public resizeEnabled = false;
    public resizePadding = 10;

    public _isCloseEnough(val: number, t: number): boolean {
      return t - this.resizePadding <= val && val <= t + this.resizePadding;
    }

    public enableResize() {
      this.resizeEnabled = true;
      return this;
    }

    public disableResize() {
      this.resizeEnabled = false;
      return this;
    }

    public _isResizeStartAttr(i: number, attr1: string, attr2: string): boolean {
      var origin = this.origin[i];
      var c1 = parseInt(this.dragBox.attr(attr1), 10);
      var c2 = parseInt(this.dragBox.attr(attr2), 10) + c1;
      var result1 = this._isCloseEnough(origin, c1);
      if (result1) {
        this.origin[i] = c2;
      }
      var result2 = this._isCloseEnough(origin, c2);
      if (result2) {
        this.origin[i] = c1;
      }
      return result1 || result2;
    }

    public _isResizeStart(): boolean {
      return false;
    }

    public _doDragstart() {
      if (this.boxIsDrawn && (!this.resizeEnabled || !this._isResizeStart())) {
        this.clearBox();
      }
    }

    public _getPixelArea(): any {
      // Should be overwritten.
      return {};
    }

    public _doDrag() {
      if (this.ondrag == null) {
        return;
      }
      this.ondrag(this._getPixelArea());
    }

    public _doDragend(){
      if (this.ondragend == null) {
        return;
      }
      this.ondragend(this._getPixelArea());
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
      return this;
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      var cname = DragBox.CLASS_DRAG_BOX;
      var foreground = this.componentToListenTo.foregroundContainer;
      this.dragBox = foreground.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.on("mousemove", () => this._hover());
      return this;
    }

    public _hover() {
      if (this.resizeEnabled) {
        var cursorStyle: string;
        if (this.boxIsDrawn) {
          var position = d3.mouse(this.hitBox[0][0].parentNode);
          cursorStyle = this._cursorStyle(position[0], position[1]);
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
