///<reference path="../../reference.ts" />

module Plottable {
export module Component {
  export module Interactive {
    export class XDragBoxLayer extends DragBoxLayer {
      protected _hasCorners = false;

      constructor() {
        super();
        this.classed("x-drag-box-layer", true);
      }

      protected _setBounds(newBounds: Bounds) {
        super._setBounds({
          topLeft: { x: newBounds.topLeft.x, y: 0 },
          bottomRight: { x: newBounds.bottomRight.x, y: this.height() }
        });
      }

      protected _setResizableClasses(canResize: boolean) {
        this.classed("x-resizable", canResize);
      }
    }
  }
}
}
