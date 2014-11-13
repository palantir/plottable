///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    public static CAN_RESIZE_Y = false;
    public _setOrigin(x: number, y: number) {
      super._setOrigin(x, 0);
    }
    public _setLocation(x: number, y: number) {
      super._setLocation(x, this._componentToListenTo.height());
    }
  }
}
}
