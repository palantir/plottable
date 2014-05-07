///<reference path="../../reference.ts" />

module Plottable {
  export interface IPixelArea {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }
  export function setupDragBoxZoom(dragBox: XYDragBoxInteraction, xScale: QuantitiveScale, yScale: QuantitiveScale) {
    var xDomainOriginal = xScale.domain();
    var yDomainOriginal = yScale.domain();
    var resetOnNextClick = false;
    function callback(pixelArea: IPixelArea) {
      if (pixelArea == null) {
        if (resetOnNextClick) {
          xScale.domain(xDomainOriginal);
          yScale.domain(yDomainOriginal);
        }
        resetOnNextClick = !resetOnNextClick;
        return;
      }
      resetOnNextClick = false;
      xScale.domain([xScale.invert(pixelArea.xMin), xScale.invert(pixelArea.xMax)]);
      yScale.domain([yScale.invert(pixelArea.yMax), yScale.invert(pixelArea.yMin)]);
      dragBox.clearBox();
      return;
    }
    dragBox.callback(callback);
  }
}
