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

    public _getClosestPixelPoint(datum: any, index: number, pixelPoint: Point): Point {
      var circleX = this._attrToProjector["cx"](datum, index);
      var circleY = this._attrToProjector["cy"](datum, index);
      var circleRadius = this._attrToProjector["r"](datum, index);

      var circleCenter = {x: circleX, y: circleY};
      if (_Util.Methods.pointDistance(circleCenter, pixelPoint) <= circleRadius) {
        return pixelPoint;
      } else {
        var angle = Math.atan((pixelPoint.x - circleX) / (pixelPoint.y - circleY));
        return { x: circleRadius * Math.cos(angle), y: circleRadius * Math.sin(angle) };
      }
    }
  }
}
}
