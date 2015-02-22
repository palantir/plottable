///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Circle extends Element {

    constructor(key: string) {
      super(key);
      this.svgElement("circle");
    }

    public _getPixelPoint(datum: any, index: number): Point {
      return { x: this._attrToProjector["cx"](datum, index), y: this._attrToProjector["cy"](datum, index) };
    }

    public _isSelectionInBounds(selection: D3.Selection, xExtent: Extent, yExtent: Extent, tolerance: number): boolean {
      return Circle._ifCircleIntersect(selection, xExtent, yExtent, tolerance);
    }

    private static _ifCircleIntersect(selection: D3.Selection, xExtent: Extent, yExtent: Extent, tolerance: number): boolean {
      var circleX = parseFloat(selection.attr("cx"));
      var circleY = parseFloat(selection.attr("cy"));
      var radius = parseFloat(selection.attr("r"));

      var closestX = Circle.clamp(circleX, xExtent.min, xExtent.max);
      var closestY = Circle.clamp(circleY, yExtent.min, yExtent.max);

      var distanceX = Math.abs(circleX - closestX);
      var distanceY = Math.abs(circleY - closestY);

      return Math.pow(distanceX, 2) + Math.pow(distanceY, 2) <= Math.pow(radius + tolerance, 2);
    }

    private static clamp(value: number, min: number, max: number) {
      if (value < min) {
        return min;
      } else if (value > max) {
        return max;
      } else {
        return value;
      }
    }

    private static pointDistance(x1: number, y1: number, x2: number, y2: number) {
      return Math.pow(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2), 0.5);
    }
  }
}
}
