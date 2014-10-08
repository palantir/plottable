///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends AbstractDrawer {

    public draw(data: any[], attrToProjector: AttributeToProjector) {
      var svgElement = "path";
      var dataElements = this._renderArea.selectAll(svgElement).data([data]);

      dataElements.enter().append(svgElement);
      dataElements.attr(attrToProjector).classed("area", true);
      dataElements.exit().remove();
    }
  }
}
}
