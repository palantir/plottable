///<reference path="../../reference.ts" />

module Plottable {
  export class XAreaInteraction extends DragBoxInteraction {
    public _drag(){
      super._drag();
      var width  = Math.abs(this.origin[0] - this.location[0]);
      var height = parseFloat(this.hitBox.attr("height"));
      var x      = Math.min(this.origin[0] , this.location[0]);
      var y      = 0
      this.dragBox.attr({x: x, y: y, height: height, width: width});
    }

    public _doDragend(){
      if (this.callbackToCall == null) {
        return;
      }
      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      var pixelArea = {xMin: xMin, xMax: xMax};
      this.callbackToCall(pixelArea);
    }
  }
}
