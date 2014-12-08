///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    public static _CAN_RESIZE_X = false;
    public _setOrigin(x: number, y: number) {
      super._setOrigin(0, y);
    }
    public _setLocation(x: number, y: number) {
      super._setLocation(this._componentToListenTo.width(), y);
    }
  }
}
}
