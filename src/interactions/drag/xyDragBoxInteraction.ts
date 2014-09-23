///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    constructor() {
      super();
      this._canResizeX = true;
      this._canResizeY = true;
    }

    public _drag(){
      super._drag();
      if (this.dragBox == null) {return;}
      var drawnX = true;
      var drawnY = true;
      var x0 = this._selectionOrigin[0];
      var x1 = this._location[0];
      var y0 = this._selectionOrigin[1];
      var y1 = this._location[1];
      if (this._dragBoxAttr == null) {
        this._dragBoxAttr = {x: 0, width: 0, y: 0, height: 0};
      }

      if (!this.resizeEnabled() || this.isResizingX() || !this.isResizingY()) {
        this._dragBoxAttr.width = Math.abs(x0 - x1);
        this._dragBoxAttr.x = Math.min(x0, x1);
        drawnX = this._dragBoxAttr.width > 0;
      }
      if (!this.resizeEnabled() || this.isResizingY() || !this.isResizingX()) {
        this._dragBoxAttr.height = Math.abs(y0 - y1);
        this._dragBoxAttr.y = Math.min(y0, y1);
        drawnY = this._dragBoxAttr.height > 0;
      }
      this.dragBox.attr(this._dragBoxAttr);
      var xMin = this._dragBoxAttr.x;
      var yMin = this._dragBoxAttr.y;
      this.selection = {
        xMin: xMin,
        xMax: this._dragBoxAttr.width + xMin,
        yMin: yMin,
        yMax: this._dragBoxAttr.height + yMin
      };
      this._boxIsDrawn = drawnX && drawnY;
    }
  }
}
}
