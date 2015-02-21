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

    public _getClosestPixelPoint(selection: D3.Selection, pixelPoint: Point): Point {
      var circleX = parseFloat(selection.attr("cx"));
      var circleY = parseFloat(selection.attr("cy"));
      var circleRadius = parseFloat(selection.attr("r"));

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
