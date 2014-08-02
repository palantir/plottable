///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
    }
  }
}
}
