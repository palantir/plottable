/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point, Bounds } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";

import { DragBoxLayer } from "./dragBoxLayer";

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
    // set correct bounds when width/height changes
    this._setBounds(this.bounds());
    return this;
  }

  protected _setBounds(newBounds: Bounds) {
    super._setBounds({
      topLeft: { x: 0, y: newBounds.topLeft.y },
      bottomRight: { x: this.width(), y: newBounds.bottomRight.y },
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
  public xScale<D extends number | { valueOf(): number }>(xScale: QuantitativeScale<D>): this;
  public xScale<D extends number | { valueOf(): number }>(xScale?: QuantitativeScale<D>): any {
    if (xScale == null) {
      return super.xScale();
    }
    throw new Error("xScales cannot be set on an YDragBoxLayer");
  }

  public xExtent(): (number | { valueOf(): number })[];
  public xExtent(xExtent: (number | { valueOf(): number })[]): this;
  public xExtent(xExtent?: (number | { valueOf(): number })[]): any {
    if (xExtent == null) {
      return super.xExtent();
    }
    throw new Error("YDragBoxLayer has no xExtent");
  }
}
