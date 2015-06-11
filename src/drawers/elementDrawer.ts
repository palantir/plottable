///<reference path="../reference.ts" />

module Plottable {
export module Drawers {
  export class Element extends Drawer {
    protected _svgElement: string;

    public selector(): string {
      return this._svgElement;
    }
  }
}
}
