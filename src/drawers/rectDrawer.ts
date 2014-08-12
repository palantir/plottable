///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Rect extends Abstract._Drawer {

    public draw(data: any[][], attrToProjector: IAttributeToProjector) {
      var svgElement = "rect";
      var dataElements = this.renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      dataElements.attr(attrToProjector);
      dataElements.exit().remove();
    }
  }
}
}
