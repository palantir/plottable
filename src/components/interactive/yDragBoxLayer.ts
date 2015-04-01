///<reference path="../../reference.ts" />

module Plottable {
export module Component {
  export module Interactive {
    export class YDragBoxLayer extends DragBoxLayer {
      protected _setBounds(newBounds: Bounds) {
        super._setBounds({
          topLeft: { x: 0, y: newBounds.topLeft.y },
          bottomRight: { x: this.width(), y: newBounds.bottomRight.y }
        });
      }

      protected _setResizable(canResize: boolean) {
        this._yResizable = canResize;
      }
    }
  }
}
}
