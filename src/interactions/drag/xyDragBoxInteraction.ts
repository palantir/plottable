///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XYDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._origin[0], this._location[0], this._origin[1], this._location[1]);
    }
  }
}
}
