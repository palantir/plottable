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

    public _getSelectionDistance(selection: D3.Selection, pixelPoint: Point): number {
      var circleX = parseFloat(selection.attr("cx"));
      var circleY = parseFloat(selection.attr("cy"));
      var circleRadius = parseFloat(selection.attr("r"));

      var circleCenter = {x: circleX, y: circleY};
      var centerToPointDistance = _Util.Methods.pointDistance(pixelPoint, circleCenter);
      return centerToPointDistance < circleRadius ? 0 : centerToPointDistance - circleRadius;
    }

    public _getClosestDatumPoint(selection: D3.Selection, pixelPoint: Point): Point {
      var circleX = parseFloat(selection.attr("cx"));
      var circleY = parseFloat(selection.attr("cy"));
      return {x: circleX, y: circleY};
    }
  }
}
}
