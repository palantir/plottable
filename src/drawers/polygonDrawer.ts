///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Polygon extends Abstract._Drawer {

    public draw(data: any[], attrToProjector: IAttributeToProjector, animator = new Animator.Null()) {
      var svgElement = "polygon";
      var dataElements = this._renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      dataElements.exit().remove();
      animator.animate(dataElements, attrToProjector);
    }
  }
}
}
