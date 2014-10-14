///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Element extends AbstractDrawer {
    public _svgElement: string;

    public svgElement(tag: string): Element {
      this._svgElement = tag;
      return this;
    }

    public _getDrawSelection(data: any[]): any {
      var dataElements = this._renderArea.selectAll(this._svgElement).data(data);
      dataElements.enter().append(this._svgElement);
      return dataElements;
    }

    public _finishDrawing(selection: any) {
      selection.exit().remove();
    }
  }
}
}
