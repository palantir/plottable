///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this.origin[1], this.location[1]);
    }

    public _doDragend(){
      if (this.callbackToCall == null) {
        return;
      }
      var yMin = Math.min(this.origin[1], this.location[1]);
      var yMax = Math.max(this.origin[1], this.location[1]);
      var pixelArea = {yMin: yMin, yMax: yMax};
      this.callbackToCall(pixelArea);
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this.componentToListenTo.availableWidth, y0, y1);
      return this;
    }
  }
}
}
