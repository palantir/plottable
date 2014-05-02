///<reference path="../../reference.ts" />

module Plottable {
  export class XYDragBoxInteraction extends DragBoxInteraction {
    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
    }

    public _doDragend(){
      if (this.callbackToCall == null) {
        return;
      }
      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      var yMin = Math.min(this.origin[1], this.location[1]);
      var yMax = Math.max(this.origin[1], this.location[1]);
      var pixelArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      this.callbackToCall(pixelArea);
    }
  }
}
