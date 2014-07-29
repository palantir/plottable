///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0]);
    }

    public _doDragstart() {
      if (this.ondragstart == null) {
        return;
      }
      this.ondragstart({x: this.origin[0]});
    }

    public _getPixelArea(): any {
      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      return {xMin: xMin, xMax: xMax};
    }

    public setBox(x0: number, x1: number) {
      super.setBox(x0, x1, 0, this.componentToListenTo.availableHeight);
      return this;
    }
  }
}
}
