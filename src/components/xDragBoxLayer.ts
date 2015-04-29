///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class XDragBoxLayer extends DragBoxLayer {
    constructor() {
      super();
      this.classed("x-drag-box-layer", true);
      this.hasCorners = false;
    }

    public computeLayout(offeredXOrigin?: number, offeredYOrigin?: number,
                          availableWidth?: number, availableHeight?: number) {
      super.computeLayout(offeredXOrigin, offeredYOrigin, availableWidth, availableHeight);
      this.bounds(this.bounds()); // set correct bounds when width/height changes
    }

    protected setBounds(newBounds: Bounds) {
      super.setBounds({
        topLeft: { x: newBounds.topLeft.x, y: 0 },
        bottomRight: { x: newBounds.bottomRight.x, y: this.height() }
      });
    }

    protected setResizableClasses(canResize: boolean) {
      this.classed("x-resizable", canResize);
    }
  }
}
}
