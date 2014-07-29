///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
    }

    public _doDragstart() {
      if (this.ondragstart == null) {
        return;
      }
      this.ondragstart({x: this.origin[0], y: this.origin[1]});
    }

    public _getPixelArea(): any {
      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      var yMin = Math.min(this.origin[1], this.location[1]);
      var yMax = Math.max(this.origin[1], this.location[1]);
      return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    }
  }
}
}
