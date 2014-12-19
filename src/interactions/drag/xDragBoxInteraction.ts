///<reference path="../../reference.ts" />

module Plottable {
export module Interaction {
  export class XDragBox extends DragBox {
    protected _setOrigin(x: number, y: number) {
      super._setOrigin(x, 0);
    }
    protected _setLocation(x: number, y: number) {
      super._setLocation(x, this._componentToListenTo.height());
    }

    protected canResizeY() {
      return false;
    }
  }
}
}
