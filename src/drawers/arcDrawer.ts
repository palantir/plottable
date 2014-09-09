///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Arc extends Abstract._Drawer {

    public draw(data: any[], attrToProjector: IAttributeToProjector, animator = new Animator.Null()) {
      var svgElement = "path";
      var dataElements = this._renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      dataElements.classed("arc", true);
      animator.animate(dataElements, attrToProjector);
      dataElements.exit().remove();
    }
  }
}
}
