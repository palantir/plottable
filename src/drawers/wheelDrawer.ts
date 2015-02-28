///<reference path="../reference.ts" />

module Plottable {
  export module _Drawer {
    export class Wheel extends Element {

      constructor(key: string) {
        super(key);
        this._svgElement = "path";
      }

      public _drawStep(step: DrawStep) {
        var attrToProjector = <AttributeToProjector>_Util.Methods.copyMap(step.attrToProjector);

        var startAngleF = attrToProjector["start-angle"];
        var endAngleF = attrToProjector["end-angle"];
        var innerRadiusF = attrToProjector["inner-radius"];
        var outerRadiusF = attrToProjector["outer-radius"];

        delete attrToProjector["start-angle"];
        delete attrToProjector["end-angle"];
        delete attrToProjector["inner-radius"];
        delete attrToProjector["outer-radius"];

        attrToProjector["d"] = d3.svg.arc()
            .startAngle(startAngleF)
            .endAngle(endAngleF)
            .innerRadius(innerRadiusF)
            .outerRadius(outerRadiusF);
        return super._drawStep({attrToProjector: attrToProjector, animator: step.animator});
      }
    }
  }
}
