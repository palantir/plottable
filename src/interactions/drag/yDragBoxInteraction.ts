///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class YDragBox extends DragBox {
    protected _setOrigin(x: number, y: number) {
      super._setOrigin(0, y);
    }
    protected _setLocation(x: number, y: number) {
      super._setLocation(this._componentToListenTo.width(), y);
    }

    protected canResizeX() {
      return false;
    }
  }
}
}
