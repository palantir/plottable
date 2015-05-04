///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class YDragBoxLayer extends DragBoxLayer {
    constructor() {
      super();
      this.classed("y-drag-box-layer", true);
      this._hasCorners = false;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this.bounds(this.bounds()); // set correct bounds when width/height changes
      return this;
    }

    protected _setBounds(newBounds: Bounds) {
      super._setBounds({
        topLeft: { x: 0, y: newBounds.topLeft.y },
        bottomRight: { x: this.width(), y: newBounds.bottomRight.y }
      });
    }

    protected _setResizableClasses(canResize: boolean) {
      this.classed("y-resizable", canResize);
    }
  }
}
}
