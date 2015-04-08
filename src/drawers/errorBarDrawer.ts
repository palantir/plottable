///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  export class ErrorBar extends Element {
    public static ERROR_BAR_CLASS = "error-bar";
    public static ERROR_BAR_MIDDLE_CLASS = "error-bar-middle";
    public static ERROR_BAR_LOWER_CLASS = "error-bar-lower";
    public static ERROR_BAR_UPPER_CLASS = "error-bar-upper";

    private _isVertical: boolean;
    private _tickLength: number;

    constructor(key: string, isVertical: boolean) {
      super(key);
      this.svgElement("g");
      this._isVertical = isVertical;
    }

    public tickLength(tickLength: number) {
      this._tickLength = tickLength;
      return this;
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

      var halfTickLength = this._tickLength / 2;

      var minProjector = this._isVertical ? (d: any, i: number) => xProjector(d, i) - halfTickLength :
                                            (d: any, i: number) => yProjector(d, i) - halfTickLength;
      var maxProjector = this._isVertical ? (d: any, i: number) => xProjector(d, i) + halfTickLength :
                                            (d: any, i: number) => yProjector(d, i) + halfTickLength;

      if (this._isVertical) {
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_LOWER_CLASS, minProjector, lowerProjector, maxProjector, lowerProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_MIDDLE_CLASS, xProjector, lowerProjector, xProjector, upperProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_UPPER_CLASS, minProjector, upperProjector, maxProjector, upperProjector);
      } else {
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_LOWER_CLASS, lowerProjector, minProjector, lowerProjector, maxProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_MIDDLE_CLASS, lowerProjector, yProjector, upperProjector, yProjector);
        this.setProjectorsForLine(ErrorBar.ERROR_BAR_UPPER_CLASS, upperProjector, minProjector, upperProjector, maxProjector);
      }

      delete attrToProjector["x"];
      delete attrToProjector["y"];
      delete attrToProjector["lower"];
      delete attrToProjector["upper"];

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
