///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this._origin[0], this._location[0]);
    }

    public setBox(x0: number, x1: number) {
<<<<<<< HEAD
      super.setBox(x0, x1, 0, this.componentToListenTo._availableHeight);
=======
      super.setBox(x0, x1, 0, this.componentToListenTo.height());
>>>>>>> develop
      return this;
    }
  }
}
}
