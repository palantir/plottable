///<reference path="../../reference.ts" />

module Plottable {
export module Component {
  export module Interactive {
    export class XDragBoxLayer extends DragBoxLayer {
      constructor() {
        super();
        this.classed("x-drag-box-layer", true);
        this._hasCorners = false;
      }

      public _computeLayout(offeredXOrigin?: number, offeredYOrigin?: number,
                            availableWidth?: number, availableHeight?: number) {
        super._computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
        this.bounds(this.bounds()); // set correct bounds when width/height changes
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
