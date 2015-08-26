///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class YDragBoxLayer extends DragBoxLayer {
    /**
     * A YDragBoxLayer is a DragBoxLayer whose size can only be set in the Y-direction.
     * The x-values of the bounds() are always set to 0 and the width() of the YDragBoxLayer.
     *
     * @constructor
     */
    constructor() {
      super();
      this.addClass("y-drag-box-layer");
      this._hasCorners = false;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._setBoundsWithoutChangingMode(this.bounds()); // set correct bounds when width/height changes
      return this;
    }

    protected _setBounds(newBounds: Bounds) {
      super._setBounds({
        topLeft: { x: 0, y: newBounds.topLeft.y },
        bottomRight: { x: this.width(), y: newBounds.bottomRight.y }
      });
    }

    protected _setResizableClasses(canResize: boolean) {
      if (canResize && this.enabled()) {
        this.addClass("y-resizable");
      } else {
        this.removeClass("y-resizable");
      }
    }

    public xScale<D extends number | { valueOf(): number }>(): QuantitativeScale<D>;
    public xScale<D extends number | { valueOf(): number }>(xScale: QuantitativeScale<D>): SelectionBoxLayer;
    public xScale<D extends number | { valueOf(): number }>(xScale?: QuantitativeScale<D>): any {
      if (xScale == null) {
        throw new Error("YDragBoxLayer has no xScale");
      }
      throw new Error("xScales cannot be set on an YDragBoxLayer");
    }

    public xExtent(): (number | { valueOf(): number })[];
    public xExtent(xExtent: (number | { valueOf(): number })[]): SelectionBoxLayer;
    public xExtent(xExtent?: (number | { valueOf(): number })[]): any {
      throw new Error("YDragBoxLayer has no xExtent");
    }

  }
}
}
