///<reference path="../../reference.ts" />

module Plottable {
  export class XYDragBoxInteraction extends DragBoxInteraction {
    public _drag(){
      super._drag();
      var width  = Math.abs(this.origin[0] - this.location[0]);
      var height = Math.abs(this.origin[1] - this.location[1]);
      var x      = Math.min(this.origin[0] , this.location[0]);
      var y      = Math.min(this.origin[1] , this.location[1]);
      this.dragBox.attr({x: x, y: y, height: height, width: width});
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
