///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class Rect extends AbstractDrawer {

    public draw(data: any[], attrToProjector: AttributeToProjector, animator = new Animator.Null()) {
      var svgElement = "rect";
      var dataElements = this._renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      animator.animate(dataElements, attrToProjector);
      dataElements.exit().remove();
    }
  }
}
}
