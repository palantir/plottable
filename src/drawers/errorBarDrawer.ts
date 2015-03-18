///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class ErrorBar extends Element {
    public static ERROR_BAR_CLASS = "error-bar";
    public static ERROR_BAR_MIDDLE_CLASS = "error-bar-middle";
    public static ERROR_BAR_LOWER_CLASS = "error-bar-lower";
    public static ERROR_BAR_UPPER_CLASS = "error-bar-upper";

    private _errorTickRadius = 10;
    private _isVertical: boolean;

    constructor(key: string, isVertical: boolean) {
      super(key);
      this.svgElement("g");
      this._isVertical = isVertical;
    }

    protected _enterData(data: any[]) {
      var errorBars = this._getRenderArea().selectAll(this._svgElement).data(data);
      errorBars.enter().append("g").classed(ErrorBar.ERROR_BAR_CLASS, true)
          .each(function(d) {
            d3.select(this).append("line").classed(ErrorBar.ERROR_BAR_LOWER_CLASS, true);
            d3.select(this).append("line").classed(ErrorBar.ERROR_BAR_MIDDLE_CLASS, true);
            d3.select(this).append("line").classed(ErrorBar.ERROR_BAR_UPPER_CLASS, true);
          });
      errorBars.exit().remove();
    }

    protected _drawStep(step: AppliedDrawStep) {
      super._drawStep(step);

	    var attrToProjector = <AttributeToAppliedProjector>_Util.Methods.copyMap(step.attrToProjector);

      var xProjector = attrToProjector["x"];
      var yProjector = attrToProjector["y"];
      var lowerProjector = attrToProjector["lower"];
      var upperProjector = attrToProjector["upper"];

      if (this._isVertical) {
        var xMinProjector = (d: any, i: number) => xProjector(d, i) - this._errorTickRadius;
        var xMaxProjector = (d: any, i: number) => xProjector(d, i) + this._errorTickRadius;
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_LOWER_CLASS, xMinProjector, lowerProjector, xMaxProjector, lowerProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_MIDDLE_CLASS, xProjector, lowerProjector, xProjector, upperProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_UPPER_CLASS, xMinProjector, upperProjector, xMaxProjector, upperProjector);
      } else {
        var yMinProjector = (d: any, i: number) => yProjector(d, i) - this._errorTickRadius;
        var yMaxProjector = (d: any, i: number) => yProjector(d, i) + this._errorTickRadius;
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_LOWER_CLASS, lowerProjector, yMinProjector, lowerProjector, yMaxProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_MIDDLE_CLASS, lowerProjector, yProjector, upperProjector, yProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_UPPER_CLASS, upperProjector, yMinProjector, upperProjector, yMaxProjector);
      }
      return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
    }


    private setProjectorsForLine(selector: string, x1Projector: AppliedProjector, y1Projector: AppliedProjector,
        x2Projector: AppliedProjector, y2Projector: AppliedProjector) {
      this._getRenderArea().selectAll("line." + selector)
          .attr("x1", x1Projector)
          .attr("x2", x2Projector)
          .attr("y1", y1Projector)
          .attr("y2", y2Projector);
    }
  }
}
}
