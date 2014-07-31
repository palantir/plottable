///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    private isResizingX = false;
    private isResizingY = false;

    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
    }

    public setBox(x0: number, x1: number, y0: number, y1: number) {
      if (this.dragBox == null) {return;}
      var attrs: any = {};
      var drawnX: boolean = true;
      var drawnY: boolean = true;
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
      this.boxIsDrawn = drawnX && drawnY;
      return this;
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

    public _doDragstart() {
      super._doDragstart();
      if (this.ondragstart == null) {
        return;
      }
      this.ondragstart({x: this.origin[0], y: this.origin[1]});
    }

    public _getPixelArea(): any {
      var xMin: number, xMax: number, yMin: number, yMax: number;
      if (this.resizeEnabled) {
        xMin = parseInt(this.dragBox.attr("x"), 10);
        xMax = parseInt(this.dragBox.attr("width"), 10) + xMin;
        yMin = parseInt(this.dragBox.attr("y"), 10);
        yMax = parseInt(this.dragBox.attr("height"), 10) + yMin;
      } else {
        xMin = Math.min(this.origin[0], this.location[0]);
        xMax = Math.max(this.origin[0], this.location[0]);
        yMin = Math.min(this.origin[1], this.location[1]);
        yMax = Math.max(this.origin[1], this.location[1]);
      }
      return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    }
  }
}
}
