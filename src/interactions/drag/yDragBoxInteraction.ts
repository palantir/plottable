///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public _drag(){
      super._drag();
      this.setBox(this.origin[1], this.location[1]);
    }

    public _doDragstart() {
      if (this.ondragstart == null) {
        return;
      }
      this.ondragstart({y: this.origin[1]});
    }

    public setBox(y0: number, y1: number) {
      super.setBox(0, this.componentToListenTo.availableWidth, y0, y1);
      return this;
    }
  }
}
}
