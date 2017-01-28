import { Point, Bounds } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";

import { DragBoxLayer } from "./dragBoxLayer";

export class XDragBoxLayer extends DragBoxLayer {
  /**
   * An XDragBoxLayer is a DragBoxLayer whose size can only be set in the X-direction.
   * The y-values of the bounds() are always set to 0 and the height() of the XDragBoxLayer.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("x-drag-box-layer");
    this._hasCorners = false;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    // set correct bounds when width/height changes
    this._setBounds(this.bounds());
    return this;
  }

  protected _setBounds(newBounds: Bounds) {
    super._setBounds({
      topLeft: { x: newBounds.topLeft.x, y: 0 },
      bottomRight: { x: newBounds.bottomRight.x, y: this.height() },
    });
  }

  protected _setResizableClasses(canResize: boolean) {
    if (canResize && this.enabled()) {
      this.addClass("x-resizable");
    } else {
      this.removeClass("x-resizable");
    }
  }

  public yScale<D extends number | { valueOf(): number }>(): QuantitativeScale<D>;
  public yScale<D extends number | { valueOf(): number }>(yScale: QuantitativeScale<D>): this;
  public yScale<D extends number | { valueOf(): number }>(yScale?: QuantitativeScale<D>): any {
    if (yScale == null) {
      return super.yScale();
    }
    throw new Error("yScales cannot be set on an XDragBoxLayer");
  }

  public yExtent(): (number | { valueOf(): number })[];
  public yExtent(yExtent: (number | { valueOf(): number })[]): this;
  public yExtent(yExtent?: (number | { valueOf(): number })[]): any {
    if (yExtent == null) {
      return super.yExtent();
    }
    throw new Error("XDragBoxLayer has no yExtent");
  }
}
