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
  }
}
}
