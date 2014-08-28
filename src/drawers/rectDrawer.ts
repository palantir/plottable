///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Rect extends Abstract._Drawer {

    public draw(data: any[][], attrToProjector: IAttributeToProjector, animator = new Animator.Null()) {
      var svgElement = "rect";
      var dataElements = this._renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      animator.animate(dataElements, attrToProjector);
      dataElements.exit().remove();
    }
  }
}
}
