///<reference path="../reference.ts" />

module Plottable {
export module Drawer {
  export class RectDrawer extends Abstract.Drawer {

    public draw(data: any[][], attrHash: any) {
      var svgElement = "rect";
      var dataElements = this.renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      dataElements.attr(attrHash);
      dataElements.exit().remove();
    }
  }
}
}
