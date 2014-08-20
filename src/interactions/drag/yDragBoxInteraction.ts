///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._origin[1], this._location[1]);
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this.componentToListenTo._availableWidth, y0, y1);
      return this;
    }
  }
}
}
