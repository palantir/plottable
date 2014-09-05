///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Area extends Abstract._Drawer {

    public draw(data: any[], attrToProjector: IAttributeToProjector) {
      var svgElement = "path";
<<<<<<< HEAD
      var dataElements = this.renderArea.selectAll(svgElement).data([data]);
=======
      var dataElements = this._renderArea.selectAll(svgElement).data(data);
>>>>>>> develop

      dataElements.enter().append(svgElement);
      dataElements.attr(attrToProjector).classed("area", true);
      dataElements.exit().remove();
    }
  }
}
}
