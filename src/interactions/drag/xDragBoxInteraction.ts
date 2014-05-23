///<reference path="../../reference.ts" />

module Plottable {
  export class XDragBoxInteraction extends DragBoxInteraction {
    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0]);
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

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this.componentToListenTo.availableHeight);
      return this;
    }
  }
}
