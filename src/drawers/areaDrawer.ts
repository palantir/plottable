///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Abstract._Drawer {

    public draw(data: any[], attrToProjector: IAttributeToProjector) {
      var pathData = [data];
      var svgElement = "path";
      var dataElements = this.renderArea.selectAll(svgElement).data(pathData);

      dataElements.enter().append(svgElement);
      dataElements.attr(attrToProjector).classed("area", true);
      dataElements.exit().remove();
    }
  }
}
}
