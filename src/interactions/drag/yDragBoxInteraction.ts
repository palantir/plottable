///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._selectionOrigin[1], this._location[1]);
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this._componentToListenTo.width(), y0, y1);
      return this;
    }
  }
}
}
